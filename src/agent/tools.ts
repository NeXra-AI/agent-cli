// Server-driven tool registry.
//
// The CLI no longer carries the tool schemas in its source — instead it asks
// the platform for them at chat-start, and dispatches execution through the
// platform. This means:
//   - A fork of this client doesn't know which endpoints exist or how to
//     wire them up — the registry is server-side.
//   - We can add/remove/improve tools without releasing a new CLI.
//   - Tool descriptions (the part the LLM reads) live next to the endpoint
//     they call, easier to keep in sync.

import { apiFetch } from "../auth/client.js";
import { runLocalTool } from "./localTools.js";

export type ToolSchema = {
  name: string;
  description: string;
  parameters: any; // JSON schema
  /** If true, this tool runs on the CLI machine, not the platform. */
  local?: boolean;
};

let _cached: ToolSchema[] | null = null;

/** Fetch the platform's current tool set (cached for the session). */
export async function loadTools(): Promise<ToolSchema[]> {
  if (_cached) return _cached;
  try {
    const r = await apiFetch<{ tools: ToolSchema[] }>("/api/admin/agent/tools/list");
    _cached = r.tools || [];
    return _cached;
  } catch {
    // Platform tool registry not available (old server build) → no tools.
    // The agent will still answer questions in pure-LLM mode.
    _cached = [];
    return _cached;
  }
}

/** Format the tools for an OpenAI/Qwen function-calling request. */
export async function toolsForLLM(): Promise<any[]> {
  const tools = await loadTools();
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

/** Dispatch a tool call — local execution if `local: true`, else server proxy. */
export async function runTool(name: string, args: any): Promise<any> {
  const tools = await loadTools();
  const tool = tools.find((t) => t.name === name);
  if (tool?.local) {
    return runLocalTool(name, args || {});
  }
  return apiFetch<any>("/api/admin/agent/tools/exec", {
    method: "POST",
    body: { name, args: args || {} },
  });
}
