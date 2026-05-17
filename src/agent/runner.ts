// Minimal agent loop: LLM (Qwen via DashScope OpenAI-compatible endpoint) +
// curated tool set. Iterates tool_calls until LLM stops calling tools.
//
// Default: routes through NeXra platform (/api/admin/agent/chat) so calls are
// quota-metered. NEXRA_LLM_DIRECT=1 + DASHSCOPE_API_KEY → direct DashScope.

import { apiFetch, ApiError } from "../auth/client.js";
import { toolsForLLM, runTool } from "./tools.js";
import { color } from "../util/ui.js";

const SYSTEM_PROMPT = `You are NeXra Agent — an AI assistant for e-commerce founders.

You have access to the user's NeXra Studio (image/video/music/website/PPT/voice generation) and Shop (products / orders / customers / inventory / marketing / logistics).

When the user asks you to do something, decide whether you need to call a tool. Prefer tools over guessing. Call tools in parallel when independent.

Be concise. Show URLs/IDs verbatim. When you generate images or content, mention what was created and where it can be viewed.

Current locale: en. Currency: RM (Malaysian Ringgit).`;

type Msg = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
};

export async function runAgent(userInput: string, history: Msg[] = []): Promise<Msg[]> {
  const msgs: Msg[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userInput },
  ];

  for (let iter = 0; iter < 8; iter++) {
    const reply = await callLLM(msgs);
    msgs.push(reply);

    if (!reply.tool_calls || reply.tool_calls.length === 0) {
      if (reply.content) {
        console.log();
        console.log(reply.content);
      }
      break;
    }

    // Run each tool_call — dispatched through platform (server-driven registry)
    for (const tc of reply.tool_calls) {
      let args: any = {};
      try {
        args = tc.function.arguments
          ? typeof tc.function.arguments === "string"
            ? JSON.parse(tc.function.arguments)
            : tc.function.arguments
          : {};
      } catch {
        args = {};
      }
      console.log(
        color.gray(`  → ${tc.function.name}(${JSON.stringify(args).slice(0, 80)})`)
      );
      let result: any;
      try {
        result = await runTool(tc.function.name, args);
      } catch (e: any) {
        result = { error: e instanceof ApiError ? e.body : e.message };
      }
      const resultStr = JSON.stringify(result).slice(0, 4000);
      msgs.push({
        role: "tool",
        tool_call_id: tc.id,
        content: resultStr,
      });
    }
  }

  // Return history sans system prompt (caller appends new turns)
  return msgs.filter((m) => m.role !== "system");
}

async function callLLM(msgs: Msg[]): Promise<Msg> {
  const direct = process.env.NEXRA_LLM_DIRECT === "1";
  if (direct) return callDashScopeDirect(msgs);
  return callViaNexra(msgs);
}

async function callViaNexra(msgs: Msg[]): Promise<Msg> {
  // 平台代理 — 走 /api/admin/agent/chat (复用配额、计费、provider 选择)
  // 若该 endpoint 不存在 → fallback direct
  try {
    const tools = await toolsForLLM();
    const resp = await apiFetch<any>("/api/admin/agent/chat", {
      method: "POST",
      body: {
        messages: msgs,
        tools,
        model: process.env.NEXRA_LLM_MODEL || "qwen3-max-2026-01-23",
      },
    });
    return parseLLMResp(resp);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      // 平台还没有 agent chat 代理 endpoint, 走直连
      return callDashScopeDirect(msgs);
    }
    throw e;
  }
}

async function callDashScopeDirect(msgs: Msg[]): Promise<Msg> {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) {
    throw new Error(
      "DashScope key missing. Set DASHSCOPE_API_KEY, or wait for /api/admin/agent/chat platform proxy."
    );
  }
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
  const tools = await toolsForLLM();
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.NEXRA_LLM_MODEL || "qwen3-max-2026-01-23",
      messages: msgs,
      tools,
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`DashScope ${r.status}: ${text.slice(0, 300)}`);
  }
  const data = await r.json();
  return parseLLMResp(data);
}

function parseLLMResp(data: any): Msg {
  const choice = data.choices?.[0] || {};
  const m = choice.message || {};
  return {
    role: "assistant",
    content: m.content || "",
    tool_calls: m.tool_calls || [],
  };
}
