<div align="center">

# 🤖 NeXra Agent CLI

### One brain. Every channel. Built for retail.

**The AI agent that runs your shop — across CLI, Telegram, WhatsApp, WeChat, Facebook, Web, and any MCP client — sharing one memory, one persona, one skill set.**

```bash
npm install -g @nexra-ai/agent-cli
nexra login
nexra chat
```

[English](./README.md) · [中文](./README.zh-CN.md)

[Website](https://nexra-ai.co) · [Docs](https://nexra-ai.co/docs/cli) · [Pricing](https://nexra-ai.co/pricing) · [Studio](https://nexra-ai.co/studio)

</div>

---

## 🎯 What makes NeXra different

Most AI agents pick one trick: *self-evolving*, *most-personal*, *general-purpose*. NeXra picks **a domain (retail) + a topology (every channel, one brain)** and goes deep.

| | Their bet | What it means |
|---|---|---|
| **Hermes** | "Self-evolving agent" | Smarter over time |
| **OpenHuman** | "The agent that knows you best" | Hyper-personal |
| **OpenClaw** | "All-purpose assistant" | Wide & flexible |
| **🟣 NeXra Agent** | **"One brain, every channel, built for retail"** | **Cross-channel + e-commerce-native + your machine** |

### The 5 things only NeXra does

1. **🧠 One brain, every channel.** CLI + Telegram + WhatsApp + WeChat + Facebook + Web Console + MCP — all share the **same agent**: same memory, same persona, same 22 tools, same RAG knowledge base. Your customer chats the Telegram bot at 9am; you open `nexra chat` at 3pm — *it remembers*. No other agent does this end-to-end.
2. **🛰  Local bridge to the cloud agent.** Run `nexra daemon` once and your **Telegram bot can save files to your Mac, run shell scripts, fetch URLs** — the cloud agent borrows your laptop's hands. *Nobody else ships this.*
3. **🛒 E-commerce-native out of the box.** 22 tools pre-wired: products / orders / customers / inventory / marketing + **Studio inside** (image / video / music / website / PPT). You don't teach NeXra what an SKU or a refund is — it ships knowing.
4. **🔌 Plugs into Claude Code, Cursor, Cline, Zed.** `nexra mcp` exposes those 22 tools to any MCP client. Don't switch your coding agent — give it 22 e-commerce superpowers.
5. **💸 70/30 plugin marketplace.** Anyone can ship a NeXra plugin and earn from it. Authors keep 70%. Closed-garden agents can't say this.

---

## ⚡ Quickstart

```bash
npm install -g @nexra-ai/agent-cli
nexra login              # OAuth device flow — no API keys
nexra chat               # talk to your shop
nexra channels bind telegram   # turn it into a 24/7 customer-service bot
nexra daemon             # let the bot use your Mac (optional)
```

That's it. Same agent, same brain — on your terminal, on your customers' phones, inside Claude Code.

---

## ✨ Side-by-side vs generic AI agents

**Claude Code is great at code. NeXra Agent is great at *running an e-commerce business*.**

| | Generic AI agents (Claude Code, Cursor, Aider) | **NeXra Agent** |
|---|---|---|
| **Out-of-the-box tools** | Empty toolbelt — bring your own | **22 pre-wired** (Studio + Shop) |
| **What it knows** | Code, files, shell | Products, orders, inventory, customers, ads |
| **Auth** | Per-tool API keys | **One OAuth login** |
| **Channels** | Just terminal | **Terminal + Telegram + WA + WeChat + FB + Web + MCP** |
| **Shared memory across channels** | ✗ Per-tool | ✅ One brain, every channel |
| **Cloud agent ↔ your machine** | ✗ | ✅ `nexra daemon` long-poll bridge |
| **Studio (image/video/music/site/PPT)** | ✗ | ✅ Built-in, per-call billing |
| **Plugin marketplace** | ✗ | ✅ 70/30 split |
| **Server** | Yours | **Yours** (your data, your control) |

---

## 🚀 Five ways to use it — *same brain, every surface*

You only train your agent once. Wherever your customers or staff reach out, NeXra is already there.

```
    Terminal       Web Console        Telegram bot       WhatsApp/FB/WeChat       Claude Code / Cursor
   nexra chat   nexra-ai.co/admin   @YourStoreBot           (OAuth bind)         (MCP server)
        \              \                 |                       /                       /
         \              \                |                      /                       /
          ────────────── shared agent runtime (one memory + one persona + 22 tools) ──────
                                              │
                                              └─ optional: `nexra daemon` lets cloud-side
                                                 channels call fs/bash on your laptop
```

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

### 4. Customer-facing — *bind your agent to your store's channels*

Turn the same agent into a 24/7 customer-service bot — straight from your terminal:

```bash
nexra channels bind telegram      # paste a @BotFather token
nexra channels bind wechat        # paste WeChat AppID + secret
nexra channels bind web           # get a <script> widget snippet
nexra channels bind whatsapp      # opens admin (Meta Business OAuth)
nexra channels bind facebook      # opens admin (Page admin OAuth)
```

Every channel uses the **same agent** you've been chatting with in the terminal. Same persona, same product knowledge, same conversation history. Customers can ask "do you have this in size M?" on Telegram and your agent answers using `shop_list_products` — automatically.

### 5. ⭐ Daemon bridge — *let your cloud agent borrow your machine*

The killer feature. Run once:

```bash
nexra daemon
```

…and now your Telegram bot, your Web console agent, and any future channel can call **`fs_read` / `fs_write` / `bash_exec` / `http_fetch` on YOUR laptop** via a long-poll bridge. Ask the Telegram bot *"export today's orders to ~/Desktop/orders.csv"* — it actually does it. Bind a customer-service Telegram chat → your agent on your store's server, and watch it reach back to your office Mac to fulfil "print this packing list".

```
Telegram bot ─→ NeXra server ─→ LLM picks a tool
                       │
                       └─ if it's a local tool (fs/bash/http) ─→ long-polls ─→ your `nexra daemon` ─→ runs on your Mac ─→ result flows back
```

🔒 **Security**: daemon binds 127.0.0.1, requires a per-instance pairing token, strict Origin whitelist. Local fs/bash is **off** by default; you have to `nexra agents allow <id>` per agent. Customer-facing Telegram bots stay locked down unless you flip the switch yourself.

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
- [x] **v0.5.0** — **Unified agent runtime** — CLI / Telegram / Web Console share the same agent, memory, persona, knowledge. `nexra agents` to pick which agent runs your chat. `nexra update` actually upgrades.
- [x] **v0.5.1** — `nexra channels bind` — Telegram / WeChat / Web widget from the terminal; WhatsApp / Facebook / Siri via OAuth.
- [x] **v0.5.2** — `nexra daemon` — local HTTP bridge so the Web Agent Console can call fs/bash on your Mac.
- [x] **v0.5.4** — **Daemon long-poll bridge** — Telegram & remote channels can call `fs_read` / `bash_exec` on your laptop too.
- [ ] **v0.6** — Plugin sandbox runtime (signing + rlimit + permission whitelist)
- [ ] **v0.7** — Named persistent Cloudflare tunnels + standalone signed binaries

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

### One brain. Every channel. Built for retail.

Made with ❤️ in Malaysia by [NeXra AI](https://nexra-ai.co).

</div>
