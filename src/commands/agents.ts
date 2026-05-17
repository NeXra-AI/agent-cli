// nexra agents {list,use,unuse,allow,deny} — manage the bound agent.
//
// Each tenant has one or more AI agents (e.g. "AI 购物助手", "Nexra 经理",
// "小销" sales bot etc.). CLI binds to one of them — that picks the
// persona / memory / model used in `nexra chat`.
//
// Only agents with allow_client_tools=true get fs/bash/http in CLI mode.
// Customer-facing agents (Telegram bot) MUST stay false — that's the security
// boundary.
import { apiFetch, ApiError } from "../auth/client.js";
import { color, logError, logInfo, logSuccess, symbols } from "../util/ui.js";
import { getDefaultAgentId, saveDefaultAgentId } from "../state.js";

type AgentRow = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  allow_client_tools: boolean;
  is_customer_facing: boolean;
};

export async function agentsCmd(args: string[]) {
  const [sub, ...rest] = args;
  switch (sub) {
    case undefined:
    case "list":
    case "ls":
      return list();
    case "use":
      return use(rest[0]);
    case "unuse":
    case "clear":
      return unuse();
    case "allow":
      return setClientTools(rest[0], true);
    case "deny":
      return setClientTools(rest[0], false);
    case "--help":
    case "-h":
      return help();
    default:
      logError(`Unknown agents subcommand: ${sub}`);
      help();
      process.exit(1);
  }
}

function help() {
  console.log();
  console.log(color.bold("nexra agents") + " — manage which agent runs your chat");
  console.log();
  console.log("  " + color.cyan("list") + "             Show this tenant's agents + which is CLI-bound");
  console.log("  " + color.cyan("use <id>") + "         Pin this agent for CLI chat");
  console.log("  " + color.cyan("unuse") + "            Unpin (CLI auto-picks first CLI-capable agent)");
  console.log("  " + color.cyan("allow <id>") + "       Enable fs/bash/http for this agent (admin/dev only!)");
  console.log("  " + color.cyan("deny <id>") + "        Disable fs/bash/http (customer-facing safe default)");
  console.log();
  console.log(color.gray("⚠️  Only enable client tools on agents you personally use."));
  console.log(color.gray("    Customer-facing agents (Telegram/WhatsApp bots) must stay denied."));
  console.log();
}

async function list() {
  try {
    const r = await apiFetch<{ agents: AgentRow[] }>("/api/admin/agent/agents");
    const bound = getDefaultAgentId();
    if (!r.agents?.length) {
      logInfo("No agents configured. Set them up at https://nexra-ai.co/admin/agent-console");
      return;
    }
    console.log();
    for (const a of r.agents) {
      const isBound = a.id === bound;
      const arrow = isBound ? color.green(symbols.arrow) : " ";
      const flags: string[] = [];
      if (a.allow_client_tools) flags.push(color.cyan("fs/bash"));
      if (a.is_customer_facing) flags.push(color.gray("customer"));
      if (a.status !== "active") flags.push(color.yellow(a.status));
      const tag = flags.length ? `  [${flags.join(" ")}]` : "";
      const pinNote = isBound ? color.gray("  ← pinned for CLI") : "";
      console.log(
        `  ${arrow} ${color.bold("#" + String(a.id).padEnd(3))} ${a.name.padEnd(20)} ${color.gray((a.description || "").slice(0, 50))}${tag}${pinNote}`
      );
    }
    console.log();
    console.log(color.gray("Pin one: nexra agents use <id>"));
    console.log(color.gray("Enable terminal tools: nexra agents allow <id>"));
    console.log();
  } catch (e) {
    handleErr(e);
  }
}

async function use(rawId?: string) {
  if (!rawId) {
    logError("Usage: nexra agents use <id>");
    process.exit(1);
  }
  const id = parseInt(rawId, 10);
  if (!id) {
    logError(`Invalid agent id: ${rawId}`);
    process.exit(1);
  }
  // Verify it exists
  try {
    const r = await apiFetch<{ agents: AgentRow[] }>("/api/admin/agent/agents");
    const a = r.agents.find((x) => x.id === id);
    if (!a) {
      logError(`Agent #${id} not found.`);
      process.exit(1);
    }
    saveDefaultAgentId(id);
    logSuccess(`Pinned: #${id} ${color.bold(a.name)}`);
    if (!a.allow_client_tools) {
      console.log(
        color.yellow("⚠️  This agent has fs/bash/http DISABLED.") +
          color.gray(" Enable: nexra agents allow " + id)
      );
    }
  } catch (e) {
    handleErr(e);
  }
}

function unuse() {
  saveDefaultAgentId(undefined);
  logSuccess("Unpinned. CLI will auto-pick a CLI-capable agent next chat.");
}

async function setClientTools(rawId: string | undefined, allow: boolean) {
  if (!rawId) {
    logError(`Usage: nexra agents ${allow ? "allow" : "deny"} <id>`);
    process.exit(1);
  }
  const id = parseInt(rawId, 10);
  try {
    await apiFetch(`/api/admin/agent/agents/${id}/client-tools`, {
      method: "PATCH",
      body: { allow },
    });
    logSuccess(
      `Agent #${id}: client tools ${allow ? color.green("ENABLED") : color.red("DISABLED")}.`
    );
    if (allow) {
      console.log(color.yellow("⚠️  Anyone who can chat with this agent can run shell commands on your machine via CLI."));
      console.log(color.gray("   Make sure this agent is private (not a Telegram bot, etc.)."));
    }
  } catch (e) {
    handleErr(e);
  }
}

function handleErr(e: unknown) {
  if (e instanceof ApiError) {
    logError(`API error ${e.status}: ${JSON.stringify(e.body).slice(0, 300)}`);
  } else {
    logError((e as Error).message);
  }
  process.exit(1);
}
