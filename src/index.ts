#!/usr/bin/env node
// NeXra Agent CLI — entry point
import { loginCmd } from "./commands/login.js";
import { logoutCmd } from "./commands/logout.js";
import { whoamiCmd } from "./commands/whoami.js";
import { studioCmd } from "./commands/studio.js";
import { shopCmd } from "./commands/shop.js";
import { chatCmd } from "./commands/chat.js";
import { profilesCmd } from "./commands/profiles.js";
import { tunnelCmd } from "./commands/tunnel.js";
import { pluginCmd } from "./commands/plugin.js";
import { updateCmd } from "./commands/update.js";
import { mcpCmd } from "./commands/mcp.js";
import { agentsCmd } from "./commands/agents.js";
import { channelsCmd } from "./commands/channels.js";
import { daemonCmd } from "./commands/daemon.js";
import { VERSION, API_BASE, setCurrentProfile } from "./config.js";
import { color, logError } from "./util/ui.js";

const HELP = `
${color.bold("nexra")} — NeXra Agent CLI ${color.gray("v" + VERSION)}

The AI agent for e-commerce founders. Runs on your server.
Built-in Studio (image/video/music/site/PPT) + Shop ops + Plugin marketplace.

${color.bold("USAGE")}
  nexra [--profile <name>] <command> [...]

${color.bold("COMMANDS")}
  ${color.cyan("login")} [--force]                  Sign in via browser (OAuth)
  ${color.cyan("logout")}                            Sign out current profile
  ${color.cyan("whoami")}                            Show current tenant + quota
  ${color.cyan("profiles")} [list|use|remove]       Multi-tenant profile management

  ${color.cyan("chat")} ["prompt"]                   Agent REPL — shared runtime w/ Telegram + Web Console
  ${color.cyan("agents")} [list|use|allow]           Pick which agent runs your chat
  ${color.cyan("channels")} [list|bind|unbind]       Connect agent to Telegram/WeChat/Web/etc.
  ${color.cyan("studio")} <sub> [args]               AI creative — image/video/music/site/ppt/voice
  ${color.cyan("shop")} <sub> [args]                 Shop ops — products/orders/customers

  ${color.cyan("mcp")}                              Run as MCP server — plug NeXra into Claude Code, Cursor, etc.
  ${color.cyan("daemon")} [--port 34563]            Local HTTP bridge so Web Agent Console can use fs/bash on this Mac
  ${color.cyan("tunnel")} <sub> [args]               Expose local service via Cloudflare Tunnel
  ${color.cyan("plugin")} <sub> [args]               Develop & publish marketplace plugins
  ${color.cyan("update")}                            Check for & install latest CLI version

  ${color.cyan("version")}                           Print version
  ${color.cyan("help")}                              This help

${color.bold("GLOBAL FLAGS")}
  --profile <name>                 Use named profile (overrides NEXRA_PROFILE env)

${color.bold("ENV")}
  NEXRA_API_URL                    Override API base (default: ${API_BASE})
  NEXRA_PROFILE                    Profile name (multi-tenant; default: "default")
  NEXRA_HOME                       Credentials dir (default: ~/.nexra)
  NEXRA_LLM_DIRECT                 1 = bypass platform proxy (needs DASHSCOPE_API_KEY)

${color.bold("LEARN MORE")}
  Docs:     https://nexra-ai.co/docs/cli
  GitHub:   https://github.com/nexra-ai/agent-cli
  Pricing:  https://nexra-ai.co/pricing
`;

function extractGlobalFlags(argv: string[]): string[] {
  // 抽掉 --profile <name> 后返剩余 args (保留 cmd + 其他 flags)
  const out: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--profile" && argv[i + 1]) {
      setCurrentProfile(argv[++i]);
      continue;
    }
    if (a.startsWith("--profile=")) {
      setCurrentProfile(a.slice("--profile=".length));
      continue;
    }
    out.push(a);
  }
  return out;
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const args = extractGlobalFlags(rawArgs);
  const [cmd, ...rest] = args;

  if (!cmd || cmd === "help" || cmd === "-h" || cmd === "--help") {
    console.log(HELP);
    return;
  }
  if (cmd === "version" || cmd === "-v" || cmd === "--version") {
    console.log(VERSION);
    return;
  }

  try {
    switch (cmd) {
      case "login":
        await loginCmd(rest);
        break;
      case "logout":
        await logoutCmd(rest);
        break;
      case "whoami":
        await whoamiCmd(rest);
        break;
      case "profiles":
      case "profile":
        await profilesCmd(rest);
        break;
      case "chat":
        await chatCmd(rest);
        break;
      case "agents":
      case "agent":
        await agentsCmd(rest);
        break;
      case "channels":
      case "channel":
        await channelsCmd(rest);
        break;
      case "studio":
        await studioCmd(rest);
        break;
      case "shop":
        await shopCmd(rest);
        break;
      case "tunnel":
        await tunnelCmd(rest);
        break;
      case "plugin":
        await pluginCmd(rest);
        break;
      case "update":
        await updateCmd(rest);
        break;
      case "mcp":
        await mcpCmd(rest);
        break;
      case "daemon":
        await daemonCmd(rest);
        break;
      default:
        logError(`Unknown command: ${cmd}`);
        console.log("Run `nexra help` for usage.");
        process.exit(1);
    }
  } catch (e: any) {
    logError(e.message || String(e));
    process.exit(1);
  }
}

main();
