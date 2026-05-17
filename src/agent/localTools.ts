// Local tool dispatcher — runs on the user's machine, NOT the platform.
//
// The server declares these tools in its registry with `local: true`. The
// LLM sees them like any other tool, but when invoked the CLI executes them
// locally so the agent can actually touch the user's filesystem / shell /
// network.
//
// This is what gives NeXra Agent its "Claude Code for e-commerce" feel —
// it lives on your server, with your files, running your commands.
import { execFile, spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const MAX_FS_BYTES_DEFAULT = 200_000;
const MAX_HTTP_BYTES = 200_000;
const MAX_BASH_TIMEOUT_SEC = 300;
const DEFAULT_BASH_TIMEOUT_SEC = 60;

export async function runLocalTool(name: string, args: any): Promise<any> {
  switch (name) {
    case "fs_read":
      return fsRead(args);
    case "fs_write":
      return fsWrite(args);
    case "bash_exec":
      return bashExec(args);
    case "http_fetch":
      return httpFetch(args);
    default:
      throw new Error(`Unknown local tool: ${name}`);
  }
}

// === fs_read ==================================================================
function fsRead(args: { path: string; max_bytes?: number }): any {
  if (!args.path) return { error: "path required" };
  const abs = resolve(process.cwd(), args.path);
  let st;
  try {
    st = statSync(abs);
  } catch (e: any) {
    return { error: `cannot stat: ${e.message}` };
  }
  if (st.isDirectory()) {
    return { error: `${abs} is a directory; use bash_exec with ls instead` };
  }
  const max = Math.min(args.max_bytes ?? MAX_FS_BYTES_DEFAULT, 1_000_000);
  const buf = readFileSync(abs);
  const truncated = buf.length > max;
  return {
    path: abs,
    size_bytes: buf.length,
    truncated,
    content: buf.subarray(0, max).toString("utf8"),
  };
}

// === fs_write =================================================================
function fsWrite(args: { path: string; content: string; append?: boolean }): any {
  if (!args.path) return { error: "path required" };
  if (args.content === undefined) return { error: "content required" };
  const abs = resolve(process.cwd(), args.path);
  try {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, args.content, { flag: args.append ? "a" : "w" });
    const st = statSync(abs);
    return {
      path: abs,
      bytes_written: Buffer.byteLength(args.content),
      total_size: st.size,
      action: args.append ? "appended" : "wrote",
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

// === bash_exec ================================================================
function bashExec(args: { command: string; cwd?: string; timeout_seconds?: number }): Promise<any> {
  if (!args.command) return Promise.resolve({ error: "command required" });
  const timeoutSec = Math.min(args.timeout_seconds ?? DEFAULT_BASH_TIMEOUT_SEC, MAX_BASH_TIMEOUT_SEC);
  const cwd = args.cwd ? resolve(process.cwd(), args.cwd) : process.cwd();

  return new Promise((res) => {
    const child = spawn("bash", ["-c", args.command], {
      cwd,
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    let killed = false;
    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGTERM");
    }, timeoutSec * 1000);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
      if (stdout.length > MAX_FS_BYTES_DEFAULT) stdout = stdout.slice(0, MAX_FS_BYTES_DEFAULT);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > MAX_FS_BYTES_DEFAULT) stderr = stderr.slice(0, MAX_FS_BYTES_DEFAULT);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      res({
        command: args.command,
        cwd,
        exit_code: code ?? -1,
        stdout,
        stderr,
        ...(killed ? { timed_out: true, timeout_seconds: timeoutSec } : {}),
      });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      res({ error: err.message });
    });
  });
}

// === http_fetch ===============================================================
async function httpFetch(args: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}): Promise<any> {
  if (!args.url) return { error: "url required" };
  try {
    const r = await fetch(args.url, {
      method: args.method || "GET",
      headers: args.headers,
      body: args.body,
    });
    const buf = await r.arrayBuffer();
    const truncated = buf.byteLength > MAX_HTTP_BYTES;
    const text = Buffer.from(buf).subarray(0, MAX_HTTP_BYTES).toString("utf8");
    const respHeaders: Record<string, string> = {};
    r.headers.forEach((v, k) => (respHeaders[k] = v));
    return {
      status: r.status,
      headers: respHeaders,
      body: text,
      bytes: buf.byteLength,
      truncated,
    };
  } catch (e: any) {
    return { error: e.message };
  }
}
