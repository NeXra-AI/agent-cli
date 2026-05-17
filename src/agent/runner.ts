// v0.5 — Thin client runner.
//
// We no longer run an LLM loop locally. The unified agent (shared with
// Telegram + Web Agent Console) runs server-side. CLI just:
//   1. Sends user message to /api/admin/agent/converse
//   2. If server replies type=text → print
//   3. If server replies type=client_exec → execute the local tools (fs/bash/
//      http) on user's machine, send results back, loop
//   4. Persist session_id locally so next `nexra chat` continues memory
//
// This gives all 3 channels the same agent record, conversation history, persona,
// knowledge base, and 22 SaaS tools. CLI additionally runs 4 local tools
// (fs_read/fs_write/bash_exec/http_fetch) when the bound agent has
// allow_client_tools=true (set via Agent Console).
import { apiFetch, ApiError } from "../auth/client.js";
import { runLocalTool } from "./localTools.js";
import { color } from "../util/ui.js";
import { getSessionId, saveSessionId, getDefaultAgentId } from "../state.js";

type PendingToolCall = {
  call_id: string;
  name: string;
  args: any;
};

type ConverseResp = {
  session_id: string;
  agent: { id: number; name: string };
  type: "text" | "client_exec";
  content?: string;
  pending_tool_calls?: PendingToolCall[];
  iterations: number;
};

const MAX_ROUND_TRIPS = 8; // 防止意外的 server↔client tool loop 死循环

export async function runAgent(userInput: string): Promise<void> {
  let sessionId: string | undefined = getSessionId();
  const agentId: number | undefined = getDefaultAgentId();

  // First turn: send user message
  let payload: any = {
    session_id: sessionId,
    message: userInput,
    include_client_tools: true,
  };
  if (agentId) payload.agent_id = agentId;

  for (let i = 0; i < MAX_ROUND_TRIPS; i++) {
    let resp: ConverseResp;
    try {
      resp = await apiFetch<ConverseResp>("/api/admin/agent/converse", {
        method: "POST",
        body: payload,
      });
    } catch (e: any) {
      if (e instanceof ApiError) {
        if (e.status === 402) {
          console.log();
          console.error(color.red("✗ Quota exceeded. Top up: https://nexra-ai.co/billing"));
          return;
        }
        if (e.status === 401) {
          console.error(color.red("✗ Session expired. Run: nexra login"));
          return;
        }
        console.error(color.red(`✗ Server error ${e.status}: ${JSON.stringify(e.body).slice(0, 300)}`));
        return;
      }
      throw e;
    }

    // Always persist latest session id (server may have created one)
    if (resp.session_id && resp.session_id !== sessionId) {
      sessionId = resp.session_id;
      saveSessionId(sessionId);
    }

    if (resp.type === "text") {
      if (resp.content) {
        console.log();
        console.log(resp.content);
      }
      return;
    }

    if (resp.type === "client_exec" && resp.pending_tool_calls?.length) {
      // Run each locally + collect results
      const tool_results: Array<{ call_id: string; name: string; result: any }> = [];
      for (const tc of resp.pending_tool_calls) {
        console.log(
          color.gray(`  → ${tc.name}(${JSON.stringify(tc.args).slice(0, 80)})`)
        );
        let result: any;
        try {
          result = await runLocalTool(tc.name, tc.args || {});
        } catch (e: any) {
          result = { error: e.message || String(e) };
        }
        tool_results.push({ call_id: tc.call_id, name: tc.name, result });
      }

      // Next iteration: send results back, no new user message
      payload = {
        session_id: sessionId,
        tool_results,
        include_client_tools: true,
      };
      if (agentId) payload.agent_id = agentId;
      continue;
    }

    // Shouldn't happen but be defensive
    console.error(color.red(`✗ Unexpected response type: ${resp.type}`));
    return;
  }

  console.error(color.red(`✗ Too many client_exec round-trips (${MAX_ROUND_TRIPS}). Aborting.`));
}

/** /reset clears local session (next chat starts fresh). */
export function resetSession() {
  saveSessionId(undefined);
}
