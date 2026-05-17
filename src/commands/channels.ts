// nexra channels — bind your agent to Telegram / WhatsApp / FB / WeChat / Web.
//
// Most channels (WhatsApp / FB / Siri) need OAuth web flow → CLI prints the
// admin URL. Telegram + WeChat + Web Widget can be done from CLI.
import { createInterface } from "node:readline";
import { spawn } from "node:child_process";
import { apiFetch, ApiError } from "../auth/client.js";
import { color, logError, logInfo, logSuccess, symbols } from "../util/ui.js";
import { getDefaultAgentId } from "../state.js";

const WEB_URL = "https://shop.jvogue.org/admin/agent-console#channels";

type ChannelRow = {
  id: number;
  agent_id: number | null;
  channel_type: string;
  channel_name: string;
  is_active: boolean;
  config: any;
  webhook_url: string | null;
};

export async function channelsCmd(args: string[]) {
  const [sub, ...rest] = args;
  switch (sub) {
    case undefined:
    case "list":
    case "ls":
      return list();
    case "bind":
      return bind(rest);
    case "unbind":
    case "remove":
    case "rm":
      return unbind(rest[0]);
    case "web":
      return openWeb();
    case "--help":
    case "-h":
      return help();
    default:
      logError(`Unknown channels subcommand: ${sub}`);
      help();
      process.exit(1);
  }
}

function help() {
  console.log();
  console.log(color.bold("nexra channels") + " — bind your agent to messaging platforms");
  console.log();
  console.log("  " + color.cyan("list") + "                       Show your bindings");
  console.log("  " + color.cyan("bind telegram") + "              Paste a Telegram bot token (from @BotFather)");
  console.log("  " + color.cyan("bind wechat") + "                Paste WeChat AppID + AppSecret");
  console.log("  " + color.cyan("bind web") + "                   Generate a <script> widget snippet");
  console.log("  " + color.cyan("bind whatsapp") + " | " + color.cyan("facebook") + " | " + color.cyan("siri") +
              "  Opens web admin (need OAuth / QR)");
  console.log("  " + color.cyan("unbind <id>") + "                Disconnect a channel");
  console.log("  " + color.cyan("web") + "                        Open the web channel-manager URL");
  console.log();
  console.log(color.gray("Web equivalent: " + WEB_URL));
  console.log();
}

async function list() {
  try {
    const r = await apiFetch<{ channels: ChannelRow[] }>("/api/admin/agent/channels");
    if (!r.channels.length) {
      console.log();
      logInfo("No channels bound yet.");
      console.log("Try: " + color.cyan("nexra channels bind telegram"));
      return;
    }
    console.log();
    for (const c of r.channels) {
      const dot = c.is_active ? color.green("●") : color.gray("○");
      const ctype = c.channel_type.padEnd(10);
      const extra =
        c.channel_type === "telegram" && c.config?.bot_username
          ? color.gray(`@${c.config.bot_username}`)
          : "";
      console.log(
        `  ${dot} ${color.bold("#" + String(c.id).padEnd(3))} ${color.cyan(ctype)} ${c.channel_name.padEnd(25)} ${extra}` +
          (c.agent_id ? color.gray(`  → agent #${c.agent_id}`) : "")
      );
    }
    console.log();
  } catch (e) {
    handleErr(e);
  }
}

async function bind(args: string[]) {
  const [type, ...rest] = args;
  if (!type) {
    help();
    return;
  }
  const t = type.toLowerCase();
  switch (t) {
    case "telegram":
    case "tg":
      return bindTelegram(rest);
    case "wechat":
    case "wx":
      return bindWeChat(rest);
    case "web":
    case "widget":
      return bindWeb(rest);
    case "whatsapp":
    case "wa":
    case "facebook":
    case "fb":
    case "messenger":
    case "siri":
      return pointToWeb(t);
    default:
      logError(`Unknown channel: ${t}`);
      help();
      process.exit(1);
  }
}

async function bindTelegram(args: string[]) {
  let tokenArg = "";
  let agentIdArg: number | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--agent") agentIdArg = parseInt(args[++i], 10);
    else if (args[i] === "--token") tokenArg = args[++i];
    else if (!tokenArg) tokenArg = args[i];
  }

  const agentId = agentIdArg ?? getDefaultAgentId();
  if (!agentId) {
    logError("No agent selected. First run: nexra agents list → nexra agents use <id>");
    process.exit(1);
  }

  console.log();
  console.log(color.bold("Bind Telegram bot → NeXra agent"));
  console.log();
  console.log("Step 1: open Telegram, message " + color.cyan("@BotFather") + ", run " + color.cyan("/newbot"));
  console.log("Step 2: copy the bot token (looks like " + color.gray("123456789:ABCdefGhi-jklmnoPQR_stUVWxyz") + ")");
  console.log();

  let token = tokenArg;
  if (!token) {
    token = (await promptHidden("Paste the bot token: ")).trim();
  }
  if (!token) {
    logError("No token provided.");
    process.exit(1);
  }

  try {
    logInfo("Validating with Telegram API + binding...");
    const r = await apiFetch<any>("/api/admin/agent/channels/telegram", {
      method: "POST",
      body: { bot_token: token, agent_id: agentId },
    });
    console.log();
    logSuccess(`Bound @${color.bold(r.bot_username)} (${r.bot_name}) → agent #${agentId} (${r.agent_name})`);
    console.log(`  ${symbols.bullet} Channel id: ${color.cyan(r.channel_id)}`);
    console.log(`  ${symbols.bullet} Webhook:    ${color.gray(r.webhook_url)} ${r.webhook_registered === "ok" ? color.green("✓") : color.yellow("(" + r.webhook_registered + ")")}`);
    console.log();
    console.log(
      `Now message ${color.cyan("@" + r.bot_username)} on Telegram — your agent replies.`
    );
    console.log();
  } catch (e) {
    handleErr(e);
  }
}

async function bindWeChat(args: string[]) {
  const agentId = getDefaultAgentId();
  if (!agentId) {
    logError("No agent selected. First: nexra agents use <id>");
    process.exit(1);
  }
  console.log();
  console.log(color.bold("Bind WeChat Official Account → NeXra agent"));
  console.log();
  console.log("Get AppID + AppSecret from your WeChat OA admin → 开发 → 基本配置");
  console.log();
  const appId = (await prompt("AppID: ")).trim();
  const appSecret = (await promptHidden("AppSecret: ")).trim();
  if (!appId || !appSecret) {
    logError("Both AppID and AppSecret required.");
    process.exit(1);
  }
  try {
    const r = await apiFetch<any>("/api/admin/agent/channels/wechat", {
      method: "POST",
      body: { app_id: appId, app_secret: appSecret, agent_id: agentId },
    });
    console.log();
    logSuccess(`Bound WeChat OA → agent #${agentId}. Channel id ${color.cyan(r.channel_id)}`);
    console.log();
  } catch (e) {
    handleErr(e);
  }
}

async function bindWeb(args: string[]) {
  const agentId = getDefaultAgentId();
  if (!agentId) {
    logError("No agent selected. First: nexra agents use <id>");
    process.exit(1);
  }
  try {
    const r = await apiFetch<any>("/api/admin/agent/channels/web", {
      method: "POST",
      body: { agent_id: agentId },
    });
    console.log();
    logSuccess(`Web widget bound → agent #${agentId}. Channel id ${color.cyan(r.channel_id)}`);
    console.log();
    console.log(color.bold("Paste this just before </body> on your site:"));
    console.log();
    console.log("  " + color.cyan(r.snippet));
    console.log();
  } catch (e) {
    handleErr(e);
  }
}

function pointToWeb(channelType: string) {
  console.log();
  logInfo(`${channelType} binding needs OAuth / QR — open the web admin:`);
  console.log();
  console.log("  " + color.cyan(WEB_URL));
  console.log();
  console.log(color.gray("(WhatsApp needs Meta Business OAuth, Facebook needs Page admin, Siri needs QR.)"));
  console.log();
  tryOpen(WEB_URL);
}

function openWeb() {
  console.log();
  logInfo("Channel manager:");
  console.log("  " + color.cyan(WEB_URL));
  console.log();
  tryOpen(WEB_URL);
}

async function unbind(rawId?: string) {
  if (!rawId) {
    logError("Usage: nexra channels unbind <id>");
    process.exit(1);
  }
  const id = parseInt(rawId, 10);
  try {
    await apiFetch<any>(`/api/admin/agent/channels/${id}`, { method: "DELETE" });
    logSuccess(`Unbound channel #${id}.`);
  } catch (e) {
    handleErr(e);
  }
}

// ============== utils ========================================================
function prompt(q: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(q, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
}

function promptHidden(q: string): Promise<string> {
  // Hide echo so secrets don't appear in terminal scrollback
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    stdout.write(q);
    let buf = "";
    stdin.setRawMode(true);
    stdin.resume();
    const onData = (chunk: Buffer) => {
      const str = chunk.toString("utf8");
      for (const ch of str) {
        if (ch === "\n" || ch === "\r" || ch === "") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          stdout.write("\n");
          resolve(buf);
          return;
        }
        if (ch === "") {
          // Ctrl+C
          stdin.setRawMode(false);
          stdin.pause();
          process.exit(130);
        }
        if (ch === "" || ch === "\b") {
          buf = buf.slice(0, -1);
          continue;
        }
        buf += ch;
        stdout.write("•");
      }
    };
    stdin.on("data", onData);
  });
}

function tryOpen(url: string) {
  let cmd: string, args: string[];
  if (process.platform === "darwin") {
    cmd = "open"; args = [url];
  } else if (process.platform === "win32") {
    cmd = "cmd"; args = ["/c", "start", "", url];
  } else {
    cmd = "xdg-open"; args = [url];
  }
  try {
    const p = spawn(cmd, args, { stdio: "ignore", detached: true });
    p.unref();
    p.on("error", () => {});
  } catch {}
}

function handleErr(e: unknown) {
  if (e instanceof ApiError) {
    logError(`API error ${e.status}: ${JSON.stringify(e.body).slice(0, 300)}`);
  } else {
    logError((e as Error).message);
  }
  process.exit(1);
}
