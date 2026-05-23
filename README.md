<div align="center">

# 🤖 NeXra Agent CLI

### One agent. A whole closet of SaaS inside.

**Generates everything. Integrates nothing.**

Songs · MVs · websites · short dramas · novels · marketing reels · product photos · Shopee / TikTok listings · FB ads · bank-statement reconciliation · logistics — **50+ AI capabilities native, no external API to wire up**.

```bash
npm install -g @nexra-ai/agent-cli
nexra login
nexra chat
```

[English](./README.md) · [中文](./README.zh-CN.md)

[Website](https://nexra-ai.co) · [Docs](https://nexra-ai.co/docs/cli) · [Pricing](https://nexra-ai.co/pricing) · [Studio](https://nexra-ai.co/studio)

</div>

---

## 🎯 The one-line difference

Every agent sells *itself*. NeXra sells *the whole shop inside itself*.

| Agent | One-liner pitch | …so after you install it, you still need to wire up: |
|---|---|---|
| **Hermes** | *Self-evolving agent* | Suno + Runway + Webflow + Shopify + FB Marketing + Mailgun + Twilio + Shopee + TikTok + … |
| **OpenHuman** | *The agent that knows you best* | Suno + Runway + Webflow + Shopify + FB Marketing + Mailgun + Twilio + Shopee + TikTok + … |
| **OpenClaw** | *General-purpose assistant* | Suno + Runway + Webflow + Shopify + FB Marketing + Mailgun + Twilio + Shopee + TikTok + … |
| **🟣 NeXra** | ***A whole closet of SaaS, packed into one agent*** | **— nothing. Just `nexra login`.** |

---

## ✨ The 5 things that actually matter

### 1️⃣ 50+ native AI capabilities — *the agent does it itself, not by calling an API*

Just talk to it (in Telegram, terminal, anywhere):

| You ask… | NeXra does (no external API) |
|---|---|
| *"Write a theme song for the summer collection"* | 🎵 Generates a song (MiniMax) |
| *"Cut a 30-second MV using that song"* | 🎬 Generates the MV (Seedance) |
| *"Build a landing page with a hero video"* | 🌐 Builds the website (Site Builder + hero video) |
| *"Make a 30-second short drama starring this dress"* | 🎭 Generates the short drama (digital human) |
| *"Write a 5,000-word seed-marketing novel with my product"* | 📖 Generates the novel |
| *"Cut that into a 9:16 IG Reel"* | ✂️ Re-edits the video |
| *"Run an A/B FB ad campaign for SKU A68862"* | 📊 Spins up FB Ads + Bayesian A/B |
| *"List my product on Shopee and TikTok Shop"* | 🛍 Pushes to marketplaces |
| *"Reconcile today's bank statement against unpaid orders"* | 💸 AI bank reconciliation |

Other agents send these to Suno / Runway / Webflow / FB Marketing / Shopify / each their own SDK and billing.
**NeXra is the SDK.**

### 2️⃣ Don't switch IDE — *one NeXra replaces 22+ API integrations in Claude Code/Cursor*

Already in Claude Code? Add **one line** of MCP config:

```json
{ "mcpServers": { "nexra": { "command": "nexra", "args": ["mcp"] } } }
```

Now your Claude Code has 22 e-commerce + creative tools — **the alternative is signing up at 22 separate platforms, getting 22 API keys, billing 22 ways, and writing the integration code yourself**. NeXra collapses all of that into one OAuth login.

### 3️⃣ The Taobao for agent skills — *finally, somewhere to sell what you build*

You wrote a clever plugin / skill for Claude Code or Hermes — **who buys it?** Nobody. It rots on your laptop.

NeXra is **the first marketplace built specifically for agent plugins**:

- Publish a plugin → real e-commerce tenants pay real RM to install
- **Author keeps 70%**, NeXra takes 30%
- AI scaffolds your plugin (`nexra plugin init`)
- Built-in install / upgrade / sandbox / signed releases

For agent builders this is the missing distribution layer. For shop owners it's an app store of vetted retail automations.

### 4️⃣ One brain, every channel *(table stakes, but we do it properly)*

CLI / Telegram / WhatsApp / WeChat / FB / Web Console / MCP all share the same agent record — same memory, same persona, same knowledge base, same 22+ tools. Most agents claim this; few wire it end-to-end across customer-facing messaging channels.

### 5️⃣ Cloud agent borrows your laptop *(`nexra daemon`)*

Run `nexra daemon` and your Telegram bot can call `fs_write` / `bash_exec` on your Mac through a long-poll bridge. Useful for "export today's orders to my desktop" workflows. *(Other agents can technically do this — we just made it one command, with a hardened security model: 127.0.0.1 only, pairing token, Origin whitelist.)*

---

## ⚡ Quickstart

```bash
npm install -g @nexra-ai/agent-cli
nexra login                       # OAuth device flow — no API keys
nexra chat                        # talk to your shop
nexra channels bind telegram      # turn it into a 24/7 customer-service bot
nexra daemon                      # let the bot use your Mac (optional)
```

---

## ✨ Side-by-side vs generic AI agents

**Claude Code is great at code. NeXra Agent is great at *running an e-commerce business*.**

| | Generic AI agents (Claude Code, Cursor, Aider) | **NeXra Agent** |
|---|---|---|
| **What it generates natively** | Code, text | **Image, video, music, MV, website, PPT, voice, short drama, novel, ads, listings, reports** |
| **Auth** | Per-tool API keys (22+) | **One OAuth login** |
| **Channels** | Just terminal | **Terminal + Telegram + WA + WeChat + FB + Web + MCP** |
| **Shared memory across channels** | ✗ Per-tool | ✅ One brain, every channel |
| **Marketplace to sell what you build** | ✗ | ✅ 70/30 split, real paying buyers |
| **Plugs into Claude Code / Cursor** | n/a | ✅ `nexra mcp` |

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

## 📦 Built-in capabilities

NeXra's platform ships with **50+ native AI capabilities** today (Studio + Shop + Marketing + Marketplace + Logistics + Reconciliation). The CLI currently exposes **22 of them via MCP / chat** — the rest live behind the Web Console + Telegram bot and roll into the CLI release by release.

### 🎨 Studio (creative — native generation, no external API)
- **`studio_generate_image`** — image generation (Qwen / SDXL / Seedance), aspect ratio + preset
- *(Exposed via Web/Telegram, CLI coming next release: music · video · MV · short-drama · novel · website · PPT · voice · digital-human · photo-AI · image-to-video · web-intro video)*

### 🛒 Shop (operations)
- **`shop_list_products`** / **`shop_get_product`** — browse/inspect inventory
- **`shop_list_orders`** / **`shop_get_order`** — orders (online + offline unified)
- **`shop_search_customers`** — find customers by name / phone / email
- **`search_products`** / **`trending_products`** — keyword + best-seller search
- **`lookup_order`** / **`cancel_order`** — order ops
- **`my_cart`** / **`add_to_cart`** — cart manipulation
- *(Platform also has: AutoCount POS sync · purchase orders · stock-take · daigou (group-buy) · distributors · F&B vertical · property vertical — exposed in Web Console)*

### 📣 Marketing & content
- **`generate_marketing_copy`** — FB / Email / WhatsApp copywriting per product
- *(Platform also has: FB Ads automation + Bayesian A/B · Custom Audience · Blog Autopilot · SMM traffic services · AI bank-statement reconciliation — exposed in Web Console)*

### 🌍 Marketplace & logistics (platform — coming to CLI)
- Shopee + TikTok Shop adapters (cross-border listing sync)
- Skynet + EasyParcel logistics (account routing + 20% net-profit split)

### 🔌 Plugin marketplace — *the Taobao for agent skills*
- **`generate_plugin_code`** — AI writes a plugin spec from natural language
- **`list_marketplace_plugins`** / **`install_marketplace_plugin`** / **`uninstall_plugin`** / **`upgrade_installed_plugin`**
- **`publish_new_plugin_version`** — author flow (**70% revenue share**)
- **`test_plugin`** — sandbox-test before publishing

### 👤 Account
- **`me_quota_status`** — your plan, RM credits remaining, usage

### 💻 System (CLI-only — runs on your machine)
- **`fs_read`** / **`fs_write`** / **`bash_exec`** / **`http_fetch`**

**Server-driven tool registry** — when a new capability ships server-side, the next `nexra chat` already sees it. No CLI re-release needed.

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
