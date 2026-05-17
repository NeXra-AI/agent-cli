<div align="center">

# 🤖 NeXra Agent CLI

**The AI agent for e-commerce founders.**

The first agent purpose-built to run a shop. Image / video / music / website generation **+** products / orders / customers / inventory / marketing — all from your terminal, or plugged into Claude Code / Cursor / Cline via MCP.

```bash
npm install -g @nexra-ai/agent-cli
nexra login
```

[Website](https://nexra-ai.co) · [Docs](https://nexra-ai.co/docs/cli) · [Pricing](https://nexra-ai.co/pricing) · [Studio](https://nexra-ai.co/studio) · [Discord](https://discord.gg/nexra)

</div>

---

## ✨ Why NeXra Agent

**Claude Code is great at code. NeXra Agent is great at *running an e-commerce business*.**

| | Generic AI agents (Claude Code, Cursor, Aider) | **NeXra Agent** |
|---|---|---|
| **Out-of-the-box tools** | Empty toolbelt — bring your own | **22 pre-wired** (Studio + Shop) |
| **What it knows** | Code, files, shell | Products, orders, inventory, customers, ads |
| **Auth** | Per-tool API keys | **One OAuth login** |
| **Multi-channel** | Just terminal | Terminal + Web + **MCP** (works inside your existing agent) |
| **Server** | Yours | **Yours** (your data, your control) |
| **Pricing** | LLM tokens | LLM tokens **+** per-generation (image/video pricing exposed) |

---

## 🚀 Three ways to use it

### 1. Terminal agent — *NeXra is your shell agent*

```bash
nexra chat
```

```
> Search for products under RM 50, generate a hero image for the
  top seller, save the image to ~/Desktop/promo.png

  → shop_list_products({"max_price": 50, "sort": "best_seller"})
  → studio_generate_image({"prompt": "lifestyle hero shot of [...]"})
  → fs_write({"path": "/Users/amos/Desktop/promo.png", ...})

✓ Done. Top seller: A68862 (RM 55).
✓ Image saved: /Users/amos/Desktop/promo.png
```

Built-in tools (works on **your** machine, not ours):
- `fs_read` / `fs_write` — read/write files
- `bash_exec` — run shell commands (60s timeout)
- `http_fetch` — GET/POST any URL
- All 22 SaaS tools below

### 2. MCP server — *NeXra inside Claude Code, Cursor, Cline, Zed*

Already love your AI coding agent? Don't switch — **add NeXra as a Model Context Protocol server** and your agent gets 22 e-commerce superpowers.

Add to your MCP config (Claude Code: `~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "nexra": {
      "command": "nexra",
      "args": ["mcp"]
    }
  }
}
```

Restart Claude Code / Cursor and ask:
- *"List my last 5 NeXra orders"* → `shop_list_orders`
- *"Search '吊带' products, write WhatsApp copy for the top one"* → `search_products` + `generate_marketing_copy`
- *"Generate a hero image for the summer collection"* → `studio_generate_image`

**Same OAuth login, same tools, no extra setup.** Works with any [MCP-compatible client](https://modelcontextprotocol.io/clients).

### 3. Web — *inside the NeXra Admin dashboard*

Sign in at [nexra-ai.co](https://nexra-ai.co) → **Agent Console** → **🤖 NeXra Agent** tab. Same 22 tools, same agent runtime, browser UI. No install required.

---

## 📦 22 built-in tools (and growing)

### 🎨 Studio (creative)
- **`studio_generate_image`** — image generation (Qwen / SDXL / Seedance), aspect ratio + preset

### 🛒 Shop (operations)
- **`shop_list_products`** / **`shop_get_product`** — browse/inspect inventory
- **`shop_list_orders`** / **`shop_get_order`** — orders (online + offline unified)
- **`shop_search_customers`** — find customers by name / phone / email
- **`search_products`** / **`trending_products`** — keyword + best-seller search
- **`lookup_order`** / **`cancel_order`** — order ops
- **`my_cart`** / **`add_to_cart`** — cart manipulation

### 📣 Marketing & content
- **`generate_marketing_copy`** — FB / Email / WhatsApp copywriting per product

### 🔌 Plugin marketplace
- **`generate_plugin_code`** — AI writes a plugin spec from natural language
- **`list_marketplace_plugins`** / **`install_marketplace_plugin`** / **`uninstall_plugin`** / **`upgrade_installed_plugin`**
- **`publish_new_plugin_version`** — author flow
- **`test_plugin`** — sandbox-test before publishing

### 👤 Account
- **`me_quota_status`** — your plan, RM credits remaining, usage

### 💻 System (CLI-only — runs on your machine)
- **`fs_read`** / **`fs_write`** / **`bash_exec`** / **`http_fetch`**

**Adding tools** — server-side registry, no CLI re-release needed. New tool ships → next `nexra chat` already sees it.

---

## 🔐 Auth & data model

```
$ nexra login

🤖 NeXra Agent — sign in

  Open this URL in your browser:
  https://nexra-ai.co/oauth/device?user_code=ABCD-1234

  Or enter code:  ABCD-1234

Waiting for approval ...........
✓ Signed in as Acme Boutique (acme · pro)
```

- OAuth 2.0 device flow (RFC 8628) — no API key shuffling
- `~/.nexra/credentials.json` (chmod 600) stores tokens
- Access 1h, refresh 90d, auto-rotation
- Multi-profile: `nexra --profile acme whoami`, `nexra profiles list`
- Revoke any session from `nexra-ai.co` settings

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────┐
│  YOUR machine — pick how you use it            │
│                                                 │
│   nexra chat            Claude Code / Cursor   │
│   (NeXra REPL)          (any MCP client)        │
│        │                       │                │
│        │                       ▼                │
│        │              ┌─────────────────┐       │
│        │              │  nexra mcp      │       │
│        │              │  (stdio server) │       │
│        │              └────────┬────────┘       │
│        │                       │                │
│        └──────────┬────────────┘                │
│                   │                              │
│           Bearer OAuth + 22 tool schemas         │
└───────────────────┼──────────────────────────────┘
                    │ HTTPS
                    ▼
┌────────────────────────────────────────────────┐
│  api.nexra-ai.co (NeXra platform — proprietary)│
│   • OAuth + quota + billing                    │
│   • Server-driven tool registry                │
│   • Studio API (image/video/music/site/PPT)    │
│   • Shop API (357 endpoints)                   │
│   • Plugin marketplace                          │
└────────────────────────────────────────────────┘
```

**This repo (the CLI)** is licensed under [BUSL-1.1](./LICENSE) — read it, fork it, run it, contribute. Don't repackage it as a competing hosted SaaS. Auto-converts to Apache 2.0 on **2030-05-17**.

**The platform** (Studio + Shop APIs) is proprietary — that's what we host, scale, and bill for. See [terms](https://nexra-ai.co/terms).

---

## ⚡ Common workflows

### Founder mode — *one prompt, multi-tool*
```bash
nexra chat "What's my top product this week? Make 3 IG-aspect ad variants for it."
```

### Daily ops via Claude Code
After adding NeXra MCP: *"Check today's orders, draft a WhatsApp message to anyone whose order hasn't been paid in 24h."*

### Self-hosted dev with tunnel
```bash
nexra tunnel start --port 3000
# → https://random-words-1234.trycloudflare.com → localhost:3000
```

### Build & publish a marketplace plugin
```bash
nexra plugin init reorder-low-stock
cd reorder-low-stock
# edit manifest.json + main.js
nexra plugin dev          # local test
nexra plugin publish      # submit for review (70/30 split)
```

---

## 🤝 Contributing

PRs welcome for:
- New LLM providers (OpenAI / Anthropic / Gemini / local Ollama)
- New CLI commands
- Better UX, more example prompts, better error messages
- Bug fixes, tests, docs

See [CONTRIBUTING.md](./CONTRIBUTING.md).

```bash
git clone https://github.com/nexra-ai/agent-cli
cd agent-cli && npm install
npm run dev -- whoami
```

---

## 📦 Roadmap

- [x] **v0.1** — OAuth login, `whoami`, `studio image`, `shop list`
- [x] **v0.2** — `chat` agent REPL, video/music/site/ppt/voice, multi-profile, tunnel, plugin init/dev/publish, update
- [x] **v0.3** — System tools (fs/bash/http), real billing, 22-tool server registry, web Agent Console
- [x] **v0.4** — **MCP server** (`nexra mcp`) — works in Claude Code / Cursor / Cline / any MCP client
- [ ] **v0.5** — Plugin sandbox runtime (signing + rlimit + permission whitelist)
- [ ] **v0.6** — Named persistent Cloudflare tunnels (stable subdomains)
- [ ] **v0.7** — Standalone binaries (Linux/macOS/Windows, signature-verified self-update)

---

## 💰 Pricing

The CLI is **free**. You pay only when you use the platform:

| Plan | RM / month | Includes |
|---|---|---|
| **Free** | 0 | RM 5 trial credit |
| **Coding** | 49 | RM 49 monthly credit |
| **Pro** | 89 | RM 89 monthly credit |
| **Enterprise** | 299 | RM 299 monthly credit |
| **SME** | 999 | RM 999 monthly credit |

Per-call pricing on [nexra-ai.co/pricing](https://nexra-ai.co/pricing). All AI calls deduct from your monthly credit; extra credits never expire.

---

## 📄 License

[BUSL-1.1](./LICENSE) for this CLI client (→ Apache 2.0 on 2030-05-17).
[NeXra Studio / Shop APIs](https://nexra-ai.co/terms) are proprietary.
"NeXra" is a trademark — forks must rename.

---

<div align="center">

**The AI agent for e-commerce founders.**
Made with ❤️ in Malaysia by [NeXra AI](https://nexra-ai.co).

</div>
