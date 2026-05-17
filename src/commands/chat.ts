// nexra chat — interactive agent REPL (v0.5: thin client to unified runtime).
//
// Conversation persists across `nexra chat` invocations via ~/.nexra/state.json
// (session_id). The agent itself runs server-side, shared with Telegram +
// Web Agent Console. `/reset` starts a fresh conversation thread.
import { createInterface } from "node:readline";
import { runAgent, resetSession } from "../agent/runner.js";
import { color, logError } from "../util/ui.js";
import { getCurrent } from "../auth/tokenStore.js";
import { getSessionId, getDefaultAgentId } from "../state.js";

export async function chatCmd(args: string[]) {
  const current = getCurrent();
  if (!current) {
    logError("Not signed in. Run: nexra login");
    process.exit(1);
  }

  // Single-shot mode: nexra chat "<prompt>"
  const promptArg = args.filter((a) => !a.startsWith("--")).join(" ").trim();
  if (promptArg) {
    try {
      await runAgent(promptArg);
    } catch (e: any) {
      logError(e.message || String(e));
      process.exit(1);
    }
    return;
  }

  // Interactive REPL
  const sid = getSessionId();
  const agentId = getDefaultAgentId();
  console.log();
  console.log(color.bold("🤖 NeXra Agent ") + color.gray(`(${current.tenant.name})`));
  if (sid) {
    console.log(color.gray(`Continuing session ${sid.slice(-12)} — type /reset to start fresh.`));
  } else {
    console.log(color.gray("New conversation. /reset to clear. /exit to quit."));
  }
  if (agentId) {
    console.log(color.gray(`Agent #${agentId} (pinned). Switch: nexra agents use <id>`));
  }
  console.log();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: color.cyan("> "),
  });
  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }
    if (input === "/reset") {
      resetSession();
      console.log(color.gray("(session cleared — next message starts fresh)"));
      rl.prompt();
      return;
    }
    if (input === "/exit" || input === "/quit") {
      rl.close();
      return;
    }
    try {
      await runAgent(input);
    } catch (e: any) {
      logError(e.message || String(e));
    }
    console.log();
    rl.prompt();
  });

  rl.on("close", () => {
    console.log();
    process.exit(0);
  });
}
