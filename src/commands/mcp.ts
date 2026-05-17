// nexra mcp — run NeXra as a Model Context Protocol server (stdio).
//
// This lets any MCP-compatible AI agent (Claude Code, Cursor, Continue.dev,
// Cline, Zed, ...) use NeXra's 22 SaaS tools as if they were native to that
// agent. The user just runs `nexra login` once, adds NeXra to their MCP
// config, and now their preferred coding agent can also do e-commerce.
//
// We deliberately do NOT expose our 4 local tools (fs_read/fs_write/
// bash_exec/http_fetch) via MCP — the host already has better versions.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { loadTools, runTool } from "../agent/tools.js";
import { getCurrent } from "../auth/tokenStore.js";
import { VERSION } from "../config.js";

export async function mcpCmd(_args: string[]) {
  // Auth check up-front; if not logged in, surface a useful error early so the
  // host (Claude Code etc.) can show it instead of "server died silently".
  const creds = getCurrent();
  if (!creds) {
    process.stderr.write(
      "✗ Not signed in. Run `nexra login` first, then restart your MCP client.\n"
    );
    process.exit(1);
  }

  const server = new Server(
    {
      name: "nexra-agent",
      version: VERSION,
    },
    {
      capabilities: { tools: {} },
    }
  );

  // Fetch tools once at startup so we can hand them to the client immediately
  // and so a bad token surfaces before the first tool call.
  let cachedTools: any[] = [];
  try {
    const tools = await loadTools();
    cachedTools = tools.filter((t) => !t.local); // hide CLI-only fs/bash/http
  } catch (e: any) {
    process.stderr.write(`✗ Could not fetch NeXra tools: ${e.message}\n`);
    process.exit(1);
  }

  process.stderr.write(
    `✓ NeXra MCP server ready — ${cachedTools.length} tools exposed ` +
      `(tenant: ${creds.tenant.name}, plan: ${creds.tenant.plan})\n`
  );

  // list_tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: cachedTools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.parameters || { type: "object" },
      })),
    };
  });

  // call_tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments || {};
    try {
      const result = await runTool(name, args);
      // MCP expects content array. Return JSON-encoded result as text.
      return {
        content: [
          {
            type: "text",
            text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: e.message || String(e) }),
          },
        ],
        isError: true,
      };
    }
  });

  // Stdio transport: reads JSON-RPC messages from stdin, writes to stdout.
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // server.connect returns when transport closes (host disconnected)
}
