// OAuth device-code flow client
import { spawn } from "node:child_process";
import { API_BASE, USER_AGENT } from "../config.js";
import { saveCurrent } from "./tokenStore.js";
import { color, logInfo, logSuccess, sleep, symbols } from "../util/ui.js";

type AuthorizeResp = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
};

type TokenResp = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  tenant: { id: string; name: string; slug: string; plan: string };
};

export async function deviceLogin(opts: { label?: string; scope?: string } = {}) {
  const hostname = await getHostname();
  const deviceLabel = opts.label || `${process.env.USER || "user"}@${hostname}`;
  const scope = opts.scope || "studio shop";

  // Step 1: authorize
  const authResp = await postJson<AuthorizeResp>("/api/oauth/device/authorize", {
    client_id: "nexra-cli",
    scope,
    device_label: deviceLabel,
  });

  console.log();
  console.log(color.bold("🤖 NeXra Agent — sign in"));
  console.log();
  console.log("  Open this URL in your browser:");
  console.log("  " + color.cyan(color.underline(authResp.verification_uri_complete)));
  console.log();
  console.log("  Or visit  " + color.cyan(authResp.verification_uri));
  console.log("  and enter code:  " + color.bold(color.magenta(authResp.user_code)));
  console.log();
  logInfo(`Code expires in ${Math.floor(authResp.expires_in / 60)} minutes.`);
  console.log();

  // Auto-open browser (best-effort)
  tryOpenBrowser(authResp.verification_uri_complete);

  // Step 2: poll for token
  const deadline = Date.now() + authResp.expires_in * 1000;
  let interval = Math.max(authResp.interval, 3) * 1000;

  process.stdout.write(color.gray("Waiting for approval"));
  let dots = 0;
  while (Date.now() < deadline) {
    await sleep(interval);
    process.stdout.write(color.gray("."));
    dots = (dots + 1) % 30;
    if (dots === 0) process.stdout.write("\n" + color.gray("Still waiting"));

    const tokenResp = await tryExchange(authResp.device_code);
    if (tokenResp === "pending") continue;
    if (tokenResp === "denied") {
      console.log();
      throw new Error("Login denied in browser.");
    }
    if (tokenResp === "slow_down") {
      interval += 2000;
      continue;
    }
    if (tokenResp && typeof tokenResp === "object") {
      // ✅ success
      console.log();
      console.log();
      logSuccess(
        `Signed in as ${color.bold(tokenResp.tenant.name)} ` +
          color.gray(`(${tokenResp.tenant.slug} · ${tokenResp.tenant.plan})`)
      );

      saveCurrent({
        access_token: tokenResp.access_token,
        refresh_token: tokenResp.refresh_token,
        expires_at: new Date(Date.now() + tokenResp.expires_in * 1000).toISOString(),
        scope: tokenResp.scope,
        tenant: tokenResp.tenant,
        saved_at: new Date().toISOString(),
      });
      console.log(
        color.gray(`Credentials saved to ~/.nexra/credentials.json (chmod 600).`)
      );
      console.log();
      console.log("Try:  " + color.cyan("nexra whoami"));
      console.log("      " + color.cyan('nexra studio image "a cat in a fashion show"'));
      console.log();
      return;
    }
  }

  console.log();
  throw new Error("Login timed out. Run `nexra login` again.");
}

async function tryExchange(deviceCode: string): Promise<TokenResp | "pending" | "denied" | "slow_down" | null> {
  try {
    const url = new URL(API_BASE + "/api/oauth/device/token");
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
      body: JSON.stringify({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceCode,
      }),
    });
    if (r.status === 202) return "pending";
    if (r.status === 200) return (await r.json()) as TokenResp;

    const body = await r.json().catch(() => ({}));
    const err = body?.error || body?.detail?.error;
    if (err === "authorization_pending") return "pending";
    if (err === "access_denied") return "denied";
    if (err === "slow_down") return "slow_down";
    if (err === "expired_token") return null;
    return "pending";
  } catch {
    return "pending";
  }
}

async function postJson<T>(path: string, body: any): Promise<T> {
  const r = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Authorize failed (${r.status}): ${text}`);
  }
  return (await r.json()) as T;
}

function tryOpenBrowser(url: string) {
  let cmd: string;
  let args: string[];
  if (process.platform === "darwin") {
    cmd = "open";
    args = [url];
  } else if (process.platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", "", url];
  } else {
    cmd = "xdg-open";
    args = [url];
  }
  try {
    const p = spawn(cmd, args, { stdio: "ignore", detached: true });
    p.unref();
    p.on("error", () => {
      /* silently fail — user can copy URL manually */
    });
  } catch {
    /* same */
  }
}

async function getHostname(): Promise<string> {
  try {
    const os = await import("node:os");
    return os.hostname();
  } catch {
    return "unknown-host";
  }
}
