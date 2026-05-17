// nexra plugin <sub> — plugin development workflow.
//
// v0.2 ships skeleton: init / dev / pack / publish. Full sandbox runtime
// (signed manifests + permission whitelist + rlimit subprocess + audit)
// lands in v0.3 per PRD v2 §7.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { apiFetch, ApiError } from "../auth/client.js";
import { color, logError, logInfo, logSuccess, symbols } from "../util/ui.js";

export async function pluginCmd(args: string[]) {
  const [sub, ...rest] = args;
  switch (sub) {
    case "init":
      return init(rest);
    case "dev":
      return dev(rest);
    case "pack":
      return pack(rest);
    case "publish":
      return publish(rest);
    case "list":
      return list();
    case "--help":
    case "-h":
    case undefined:
      return help();
    default:
      logError(`Unknown plugin subcommand: ${sub}`);
      help();
      process.exit(1);
  }
}

function help() {
  console.log();
  console.log(color.bold("nexra plugin <sub>") + " — develop & publish marketplace plugins");
  console.log();
  console.log("  " + color.cyan("init") + " <name>           Scaffold a new plugin directory");
  console.log("  " + color.cyan("dev") + " [./path]          Run plugin locally with auto-reload");
  console.log("  " + color.cyan("pack") + " [./path]         Create .tar.gz for submission");
  console.log("  " + color.cyan("publish") + " [./path]      Submit plugin to marketplace for review");
  console.log("  " + color.cyan("list") + "                  List plugins you've published");
  console.log();
  console.log("Revenue: marketplace plugins earn ~70% to the developer (30% platform fee).");
  console.log();
}

const MANIFEST_TEMPLATE = (slug: string, displayName: string) =>
  JSON.stringify(
    {
      manifest_version: "1.0",
      plugin_id: slug,
      name: displayName,
      description: "TODO: short description of what your plugin does",
      version: "0.1.0",
      author: { name: "TODO", email: "you@example.com" },
      industry_compatible: ["retail", "fnb_restaurant", "fnb_buffet", "service", "property"],
      required_features: [],
      permissions: {
        api: [
          // Endpoints your plugin will call. Wildcards OK.
          // "GET /api/admin/products",
          // "POST /api/admin/orders",
        ],
        skills_read: false,
        data_write: false,
      },
      entrypoints: {
        // Cron schedule (every day at 9am):
        trigger: "schedule:0 9 * * *",
        // Event subscriptions:
        events: [],
        handler: "main.js:onTrigger",
      },
      pricing: {
        model: "monthly", // or "one_time" / "free"
        amount_myr: 15,
        trial_days: 7,
      },
    },
    null,
    2
  );

const MAIN_JS_TEMPLATE = `// NeXra plugin entry — \`onTrigger\` runs on the schedule/event in manifest.json.
//
// You receive { event, data, tenant_id, api } where \`api\` is an authed client
// pre-bound to the user's NeXra account (scoped to permissions you declared).

export async function onTrigger({ event, data, tenant_id, api }) {
  // Example: list 5 most recent orders.
  const orders = await api.get("/api/admin/orders/unified", { query: { limit: 5 } });
  console.log("got orders:", orders?.items?.length ?? "(none)");

  // Generate an image with Studio:
  // const img = await api.post("/api/admin/studio/image/generate", {
  //   body: { prompt: "summer sale banner", aspect_ratio: "16:9", n: 1 }
  // });

  return { ok: true, processed: orders.items?.length || 0 };
}
`;

const README_TEMPLATE = (slug: string, name: string) => `# ${name}

A NeXra plugin.

## Develop

\`\`\`bash
nexra plugin dev
\`\`\`

## Publish

\`\`\`bash
nexra plugin publish
\`\`\`

## License

MIT
`;

function init(args: string[]) {
  const name = args[0];
  if (!name) {
    logError("Usage: nexra plugin init <name>");
    process.exit(1);
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  const dir = resolve(process.cwd(), slug);
  if (existsSync(dir)) {
    logError(`Directory ${dir} already exists.`);
    process.exit(1);
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "manifest.json"), MANIFEST_TEMPLATE(slug, name));
  writeFileSync(join(dir, "main.js"), MAIN_JS_TEMPLATE);
  writeFileSync(join(dir, "README.md"), README_TEMPLATE(slug, name));
  writeFileSync(join(dir, ".gitignore"), "node_modules/\n*.tgz\n.env\n");

  console.log();
  logSuccess(`Created plugin ${color.cyan(slug)} at ${color.gray(dir)}`);
  console.log();
  console.log("Next steps:");
  console.log("  " + color.cyan(`cd ${slug}`));
  console.log("  " + color.cyan("vim manifest.json     # set permissions, pricing"));
  console.log("  " + color.cyan("vim main.js           # write your handler"));
  console.log("  " + color.cyan("nexra plugin dev      # test locally"));
  console.log("  " + color.cyan("nexra plugin publish  # submit for review"));
  console.log();
}

function readManifest(dir: string): any {
  const path = join(dir, "manifest.json");
  if (!existsSync(path)) {
    logError(`No manifest.json in ${dir}`);
    process.exit(1);
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e: any) {
    logError(`Invalid manifest.json: ${e.message}`);
    process.exit(1);
  }
}

async function dev(args: string[]) {
  const dir = resolve(args[0] || process.cwd());
  const manifest = readManifest(dir);
  const entry = manifest.entrypoints?.handler || "main.js:onTrigger";
  const [file, fn] = entry.split(":");
  const filePath = join(dir, file);

  if (!existsSync(filePath)) {
    logError(`Entry file ${file} not found in ${dir}`);
    process.exit(1);
  }

  console.log();
  logInfo(`Running ${color.cyan(manifest.plugin_id)} v${manifest.version}`);
  logInfo(`Handler: ${file}:${fn}`);
  console.log();

  // Spawn node subprocess to run entry. Inject minimal SDK shim via env.
  // (Real sandbox lands in v0.3 — for now, plugin runs with full Node perms.)
  const runner = `
import("${filePath.replace(/\\/g, "/")}").then(async (mod) => {
  const fn = mod["${fn}"] || mod.default;
  if (typeof fn !== "function") {
    console.error("Handler ${fn} not exported from ${file}");
    process.exit(1);
  }
  const api = {
    get: async (path, opts={}) => {
      const r = await fetch(\`\${process.env.NEXRA_API_URL || "https://api.nexra-ai.co"}\${path}\` + qs(opts.query),
        { headers: { Authorization: \`Bearer \${process.env.NEXRA_PLUGIN_TOKEN}\` } });
      return r.json();
    },
    post: async (path, opts={}) => {
      const r = await fetch(\`\${process.env.NEXRA_API_URL || "https://api.nexra-ai.co"}\${path}\`,
        { method: "POST",
          headers: { Authorization: \`Bearer \${process.env.NEXRA_PLUGIN_TOKEN}\`, "Content-Type": "application/json" },
          body: opts.body ? JSON.stringify(opts.body) : undefined });
      return r.json();
    }
  };
  function qs(q) {
    if (!q) return "";
    const s = new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([_,v]) => v!=null))).toString();
    return s ? "?" + s : "";
  }
  try {
    const result = await fn({ event: "dev_trigger", data: {}, tenant_id: "dev", api });
    console.log("\\n→ handler returned:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("→ handler threw:", e);
    process.exit(1);
  }
});
`;
  // 用 CLI 本机已登录的 access_token 给 plugin 临时用 (dev only)
  const { getCurrent } = await import("../auth/tokenStore.js");
  const creds = getCurrent();
  if (!creds) {
    logError("Not signed in. Run: nexra login");
    process.exit(1);
  }

  const child = spawn(process.execPath, ["--input-type=module", "-e", runner], {
    stdio: ["ignore", "inherit", "inherit"],
    env: {
      ...process.env,
      NEXRA_PLUGIN_TOKEN: creds.access_token,
      NEXRA_API_URL: process.env.NEXRA_API_URL || "https://api.nexra-ai.co",
    },
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

function pack(args: string[]) {
  const dir = resolve(args[0] || process.cwd());
  const manifest = readManifest(dir);
  const outName = `${manifest.plugin_id}-${manifest.version}.tgz`;
  const outPath = resolve(process.cwd(), outName);

  // Use system tar — no JS tar dep.
  const child = spawn(
    "tar",
    ["czf", outPath, "-C", dirname(dir), basename(dir)],
    { stdio: "inherit" }
  );
  child.on("exit", (code) => {
    if (code === 0) {
      const size = statSync(outPath).size;
      console.log();
      logSuccess(`Packed ${color.cyan(outName)} (${(size / 1024).toFixed(1)} KB)`);
    } else {
      logError(`tar exited with code ${code}`);
      process.exit(code ?? 1);
    }
  });
}

function basename(p: string): string {
  return p.split("/").pop() || p;
}

async function publish(args: string[]) {
  const dir = resolve(args[0] || process.cwd());
  const manifest = readManifest(dir);

  // List all files we'd ship (excluding common junk)
  const files = walk(dir).filter(
    (f) =>
      !f.includes("/node_modules/") &&
      !f.includes("/.git/") &&
      !f.includes("/.DS_Store") &&
      !f.endsWith(".tgz") &&
      !f.endsWith(".log")
  );

  console.log();
  logInfo(`Publishing ${color.cyan(manifest.plugin_id)} v${manifest.version}`);
  logInfo(`Files: ${files.length}`);
  for (const f of files.slice(0, 8)) {
    console.log(`  ${symbols.bullet} ${color.gray(f.replace(dir + "/", ""))}`);
  }
  if (files.length > 8) console.log(`  ${color.gray(`...and ${files.length - 8} more`)}`);
  console.log();

  // Encode files as base64 for the JSON submission. (For binaries this is
  // crude; v0.3 will switch to multipart + signature.)
  const payload: any = {
    manifest,
    files: {} as Record<string, string>,
  };
  for (const f of files) {
    const rel = f.replace(dir + "/", "");
    const buf = readFileSync(f);
    payload.files[rel] = buf.toString("base64");
  }

  try {
    const resp = await apiFetch<any>("/api/admin/plugins/publish", {
      method: "POST",
      body: payload,
    });
    logSuccess(`Submitted! Review status: ${color.cyan(resp.status || "pending")}`);
    if (resp.review_url) {
      console.log(`Track at: ${color.cyan(resp.review_url)}`);
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      logError("Publish endpoint not live yet — plugin marketplace API ships in v0.3.");
      logInfo("Until then, email your packed plugin to plugins@nexra-ai.co for early review.");
      process.exit(1);
    }
    if (e instanceof ApiError) {
      logError(`Publish failed (${e.status}): ${JSON.stringify(e.body).slice(0, 300)}`);
    } else {
      logError((e as Error).message);
    }
    process.exit(1);
  }
}

async function list() {
  try {
    const r = await apiFetch<any>("/api/admin/plugins/mine");
    const plugins = r.items || r.plugins || [];
    if (!plugins.length) {
      logInfo("You haven't published any plugins yet. Try: nexra plugin init my-plugin");
      return;
    }
    console.log();
    for (const p of plugins) {
      console.log(
        `  ${color.cyan(p.plugin_id.padEnd(20))} v${(p.version || "?").padEnd(8)} ` +
          `${(p.status || "").padEnd(10)} ${color.gray(p.installs ? `${p.installs} installs` : "")}`
      );
    }
    console.log();
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      logInfo("Plugin marketplace listing not live yet — ships in v0.3.");
      return;
    }
    throw e;
  }
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
