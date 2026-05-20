// nexra daemon — local HTTP bridge so the Web Agent Console can execute
// fs/bash/http on this machine.
//
// Architecture:
//   Web (shop.jvogue.org) ─→ NeXra server (/converse) ─→ LLM
//        ↑                                  │
//        │                          returns client_exec
//        │                                  │
//        └─── localhost:34563 ◀───── Web JS fetches local daemon
//                  │
//                  ├─ verify Origin (whitelist)
//                  ├─ verify X-Daemon-Token (pairing)
//                  └─ runLocalTool() ─ same code as `nexra chat`
//
// Security model:
//   1. Binds 127.0.0.1 ONLY (no LAN exposure)
//   2. CORS Access-Control-Allow-Origin = whitelisted hosts
//   3. Per-instance pairing token (random, displayed at startup)
//   4. Origin header strict-check (browser-sent, can't be spoofed cross-site)
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomBytes } from "node:crypto";
import { runLocalTool } from "../agent/localTools.js";
import { color, logInfo, logSuccess, logWarn, symbols } from "../util/ui.js";
import { getCurrent } from "../auth/tokenStore.js";
import { VERSION } from "../config.js";

const DEFAULT_PORT = 34563;

const ALLOWED_ORIGINS = new Set([
  "https://shop.jvogue.org",
  "https://nexra-ai.co",
  "https://www.nexra-ai.co",
  // localhost dev (admin built but served via Vite dev server)
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
]);

// Allow any *.nexra-ai.co subdomain (tenant subdomains)
function isOriginAllowed(origin: string | null | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.hostname.endsWith(".nexra-ai.co")) return true;
  } catch {}
  return false;
}

export async function daemonCmd(args: string[]) {
  const portIdx = args.indexOf("--port");
  const port = portIdx >= 0 ? parseInt(args[portIdx + 1] || String(DEFAULT_PORT), 10) : DEFAULT_PORT;

  const creds = getCurrent();
  if (!creds) {
    console.error(color.red("✗ Not signed in. Run: nexra login"));
    process.exit(1);
  }

  // Per-instance pairing token — printed at startup, user pastes into web UI
  const token = "dmn_" + randomBytes(16).toString("hex");

  const server = createServer((req, res) => handleRequest(req, res, token));

  server.listen(port, "127.0.0.1", () => {
    console.log();
    console.log(color.bold("🛰  NeXra daemon running"));
    console.log();
    console.log(`  ${symbols.bullet} URL:    ${color.cyan(`http://127.0.0.1:${port}`)}`);
    console.log(`  ${symbols.bullet} Tenant: ${color.gray(`${creds.tenant.name} (${creds.tenant.slug})`)}`);
    console.log(`  ${symbols.bullet} Token:  ${color.magenta(token)}`);
    console.log();
    console.log(color.bold("Pair with the Web Agent Console:"));
    console.log(`  1. Open ${color.cyan("https://shop.jvogue.org/admin/agent-console#nexra")}`);
    console.log(`  2. Click ${color.cyan("Connect daemon")} icon in the header`);
    console.log(`  3. Paste the token above`);
    console.log();
    console.log(color.gray("Web will then run fs/bash/http on this machine via the daemon."));
    console.log(color.gray("Ctrl+C to stop."));
    console.log();
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(color.red(`✗ Port ${port} already in use. Another nexra daemon running?`));
      console.error(color.gray(`  Try: lsof -i :${port}`));
      console.error(color.gray(`  Or:  nexra daemon --port 34564`));
    } else {
      console.error(color.red(`✗ Server error: ${err.message}`));
    }
    process.exit(1);
  });

  process.on("SIGINT", () => {
    console.log();
    logInfo("Stopping daemon...");
    server.close(() => process.exit(0));
  });
}

function setCorsHeaders(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Daemon-Token, Authorization"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

function handleRequest(req: IncomingMessage, res: ServerResponse, token: string) {
  setCorsHeaders(req, res);

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Strict origin check (defense-in-depth alongside CORS)
  // /health can be hit by browser preflight detector — allow Origin-less too
  const origin = req.headers.origin;
  const isHealth = req.url === "/health" || req.url === "/";
  if (!isHealth && origin && !isOriginAllowed(origin)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: "Origin not allowed" }));
    return;
  }

  // Health endpoint — no auth, so web can detect daemon is up
  if (isHealth) {
    const creds = getCurrent();
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        ok: true,
        service: "nexra-daemon",
        version: VERSION,
        tenant: creds?.tenant.slug,
      })
    );
    return;
  }

  // All other endpoints require pairing token
  const supplied = req.headers["x-daemon-token"];
  if (typeof supplied !== "string" || supplied !== token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Invalid daemon token. Pair with /connect first." }));
    return;
  }

  // POST /exec  body: { name, args }
  if (req.url === "/exec" && req.method === "POST") {
    readBody(req)
      .then(async (body) => {
        let parsed: any;
        try {
          parsed = JSON.parse(body);
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }
        const { name, args } = parsed;
        if (!name) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Missing tool 'name'" }));
          return;
        }
        try {
          const result = await runLocalTool(name, args || {});
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, result }));
          process.stderr.write(color.gray(`  → ${name}(${JSON.stringify(args).slice(0, 60)})\n`));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message || String(e) }));
        }
      })
      .catch((e) => {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: e.message }));
      });
    return;
  }

  // POST /exec/batch  body: { calls: [{call_id, name, args}, ...] }
  if (req.url === "/exec/batch" && req.method === "POST") {
    readBody(req)
      .then(async (body) => {
        let parsed: any;
        try {
          parsed = JSON.parse(body);
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }
        const calls = parsed?.calls;
        if (!Array.isArray(calls)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Missing 'calls' array" }));
          return;
        }
        const results: Array<{ call_id: string; name: string; result: any }> = [];
        for (const c of calls) {
          try {
            const r = await runLocalTool(c.name, c.args || {});
            results.push({ call_id: c.call_id, name: c.name, result: r });
          } catch (e: any) {
            results.push({
              call_id: c.call_id,
              name: c.name,
              result: { error: e.message || String(e) },
            });
          }
          process.stderr.write(color.gray(`  → ${c.name}\n`));
        }
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, results }));
      })
      .catch((e) => {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: e.message }));
      });
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Not found" }));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    const MAX = 2 * 1024 * 1024; // 2 MB — generous for file_write content
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > MAX) {
        req.destroy(new Error("Body too large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
