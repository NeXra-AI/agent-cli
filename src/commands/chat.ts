// nexra chat — interactive agent REPL.
//
// Default: pipes through platform `/api/admin/agent/chat` (quota-metered).
// Fallback: direct DashScope if `DASHSCOPE_API_KEY` set + NEXRA_LLM_DIRECT=1
// (or platform returns 404 because endpoint not yet shipped).
import { createInterface } from "node:readline";
import { runAgent } from "../agent/runner.js";
import { color, logError } from "../util/ui.js";
import { getCurrent } from "../auth/tokenStore.js";

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
  console.log();
  console.log(color.bold("🤖 NeXra Agent ") + color.gray(`(${current.tenant.name})`));
  console.log(color.gray("Type your request. Ctrl+D to exit. /reset to clear history."));
  console.log();

  let history: any[] = [];
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
      history = [];
      console.log(color.gray("(history cleared)"));
      rl.prompt();
      return;
    }
    if (input === "/exit" || input === "/quit") {
      rl.close();
      return;
    }
    try {
      history = await runAgent(input, history);
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
