// nexra tunnel start --port 3000 — expose a local service via Cloudflare
// Tunnel. v0.2 uses `trycloudflare` (zero-config, ephemeral). Named tunnels
// w/ stable subdomain come in v0.3 (needs platform-side cloudflared API
// token issuance).
import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";
import { existsSync, statSync } from "node:fs";
import { color, logError, logInfo, logSuccess } from "../util/ui.js";

export async function tunnelCmd(args: string[]) {
  const [sub, ...rest] = args;
  switch (sub) {
    case undefined:
    case "--help":
    case "-h":
      return help();
    case "start":
      return start(rest);
    case "status":
      return status();
    default:
      logError(`Unknown tunnel subcommand: ${sub}`);
      help();
      process.exit(1);
  }
}

function help() {
  console.log();
  console.log(color.bold("nexra tunnel") + " — expose a local service via Cloudflare Tunnel");
  console.log();
  console.log("  " + color.cyan("start") + " [--port 3000] [--protocol http|https]");
  console.log("            Spin up an ephemeral *.trycloudflare.com URL pointing at");
  console.log("            your local port. No DNS / firewall config needed.");
  console.log();
  console.log("  " + color.cyan("status") + "  Show running tunnels (best-effort, lsof-based)");
  console.log();
  console.log("Requires: cloudflared (https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)");
  console.log("  brew install cloudflared    # macOS");
  console.log();
}

function findCloudflared(): string {
  // Common locations
  const candidates: string[] = [
    "/opt/homebrew/bin/cloudflared",
    "/usr/local/bin/cloudflared",
    "/usr/bin/cloudflared",
  ];
  const fromEnv = process.env.CLOUDFLARED_PATH;
  if (fromEnv) candidates.unshift(fromEnv);
  for (const p of candidates) {
    try {
      if (existsSync(p) && statSync(p).isFile()) return p;
    } catch {
      // ignore
    }
  }
  // 在 $PATH 里
  return "cloudflared";
}

async function start(args: string[]) {
  let port = 3000;
  let protocol = "http";
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--port") port = parseInt(args[++i] || "3000", 10);
    else if (a === "--protocol") protocol = args[++i];
  }

  const bin = findCloudflared();
  console.log();
  console.log(color.bold("🌐 NeXra Tunnel") + color.gray(` (ephemeral via trycloudflare)`));
  console.log();
  logInfo(`Local:  ${color.cyan(`${protocol}://localhost:${port}`)}`);
  logInfo(`Using:  ${color.gray(bin)}`);
  console.log();

  const child: ChildProcessByStdio<null, Readable, Readable> = spawn(
    bin,
    ["tunnel", "--no-autoupdate", "--url", `${protocol}://localhost:${port}`],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  let urlPrinted = false;
  const onLine = (line: string) => {
    // cloudflared prints "https://random-words-1234.trycloudflare.com" to stderr
    const m = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (m && !urlPrinted) {
      urlPrinted = true;
      console.log();
      logSuccess(`Public URL: ${color.cyan(color.bold(m[0]))}`);
      console.log(color.gray("  Anyone with this URL can reach your local port."));
      console.log(color.gray("  Ephemeral — disappears when you Ctrl+C."));
      console.log();
    }
  };
  let stderrBuf = "";
  let stdoutBuf = "";
  child.stderr.on("data", (chunk: Buffer) => {
    stderrBuf += chunk.toString();
    while (true) {
      const idx = stderrBuf.indexOf("\n");
      if (idx < 0) break;
      const line = stderrBuf.slice(0, idx);
      stderrBuf = stderrBuf.slice(idx + 1);
      onLine(line);
      if (process.env.NEXRA_TUNNEL_VERBOSE) process.stderr.write(color.gray(line + "\n"));
    }
  });
  child.stdout.on("data", (chunk: Buffer) => {
    stdoutBuf += chunk.toString();
    while (true) {
      const idx = stdoutBuf.indexOf("\n");
      if (idx < 0) break;
      const line = stdoutBuf.slice(0, idx);
      stdoutBuf = stdoutBuf.slice(idx + 1);
      onLine(line);
    }
  });

  child.on("error", (err: Error) => {
    logError(`Could not start cloudflared: ${err.message}`);
    logInfo("Install: brew install cloudflared");
    process.exit(1);
  });

  child.on("exit", (code: number | null) => {
    console.log();
    if (code === 0) logInfo("Tunnel closed.");
    else logError(`cloudflared exited with code ${code}`);
    process.exit(code ?? 0);
  });

  // Forward Ctrl+C
  process.on("SIGINT", () => {
    child.kill("SIGINT");
  });
}

function status() {
  // No central registry yet — just hint where to look
  logInfo("v0.2 tunnels are ephemeral — they only exist while `nexra tunnel start` is running.");
  logInfo("Named persistent tunnels with stable subdomains arrive in v0.3.");
}
