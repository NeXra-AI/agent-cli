// nexra update — check GitHub releases AND actually upgrade by re-running
// `npm install -g @nexra-ai/agent-cli@latest`. For standalone binaries
// (v0.7), this will switch to signed self-replace.
import { spawn } from "node:child_process";
import { VERSION, USER_AGENT } from "../config.js";
import { color, logError, logInfo, logSuccess, logWarn } from "../util/ui.js";

const RELEASES_API = "https://api.github.com/repos/nexra-ai/agent-cli/releases/latest";

export async function updateCmd(args: string[]) {
  const checkOnly = args.includes("--check");
  logInfo(`Current version: ${color.cyan("v" + VERSION)}`);
  logInfo(`Checking ${color.gray(RELEASES_API)}...`);

  let latestTag = "";
  let body = "";
  try {
    const r = await fetch(RELEASES_API, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/vnd.github+json" },
    });
    if (r.status === 404) {
      logWarn("No releases published yet. You're on the bleeding edge.");
      return;
    }
    if (!r.ok) {
      logError(`GitHub returned ${r.status}. Try again later.`);
      return;
    }
    const data = (await r.json()) as any;
    latestTag = (data.tag_name || "").replace(/^v/, "");
    body = data.body || "";
  } catch (e: any) {
    logError(`Could not reach GitHub: ${e.message}`);
    return;
  }

  if (!latestTag) {
    logWarn("Could not parse latest release.");
    return;
  }

  if (compareVersions(latestTag, VERSION) <= 0) {
    logSuccess(`You're on the latest version (v${VERSION}).`);
    return;
  }

  console.log();
  logSuccess(`New version available: ${color.bold(color.cyan("v" + latestTag))}`);
  if (body) {
    console.log();
    console.log(color.bold("Release notes:"));
    console.log(body.slice(0, 800));
    if (body.length > 800) console.log(color.gray("...truncated"));
    console.log();
  }

  if (checkOnly) {
    console.log("To upgrade, run: " + color.cyan("nexra update"));
    return;
  }

  // Auto-upgrade via npm
  logInfo(`Installing ${color.cyan("@nexra-ai/agent-cli@" + latestTag)}...`);
  console.log();
  await new Promise<void>((resolve) => {
    // 强制 official registry — 防用户配了 Taobao 镜像 (sync 延迟几小时), 装到旧版
    const child = spawn(
      "npm",
      [
        "install",
        "-g",
        `@nexra-ai/agent-cli@${latestTag}`,
        "--registry=https://registry.npmjs.org/",
      ],
      { stdio: "inherit" }
    );
    child.on("exit", (code) => {
      console.log();
      if (code === 0) {
        logSuccess(`Upgraded to v${latestTag}. Run a new \`nexra\` to use the new version.`);
      } else {
        logError(`npm install exited with code ${code}.`);
        logInfo(`Try manually: ${color.cyan("npm install -g @nexra-ai/agent-cli@latest")}`);
      }
      resolve();
    });
    child.on("error", (err) => {
      logError(`Could not start npm: ${err.message}`);
      logInfo("Is npm in your PATH?");
      resolve();
    });
  });
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const ai = pa[i] || 0;
    const bi = pb[i] || 0;
    if (ai > bi) return 1;
    if (ai < bi) return -1;
  }
  return 0;
}
