<div align="center">

# 🤖 NeXra Agent CLI

### 一个大脑,跑遍所有渠道,为开店而生。

**让同一个 AI agent 守住你的店 — 在终端、Telegram、WhatsApp、微信、Facebook、网页、甚至 Claude Code/Cursor (MCP) 共享同一份记忆、同一个人设、同一套技能。**

```bash
npm install -g @nexra-ai/agent-cli
nexra login
nexra chat
```

[English](./README.md) · [中文](./README.zh-CN.md)

[官网](https://nexra-ai.co) · [文档](https://nexra-ai.co/docs/cli) · [价格](https://nexra-ai.co/pricing) · [Studio](https://nexra-ai.co/studio)

</div>

---

## 🎯 NeXra 跟其他 AI agent 不一样在哪

市面上的 agent 都押一个卖点:**自我进化**、**最懂你**、**啥都能干**。NeXra 走另一条路 — **押"领域 (零售)"+"拓扑 (一脑跨端)" 两件事,做深做透**。

| | 它的押注 | 一句话 |
|---|---|---|
| **Hermes** | "会自我进化的 agent" | 越用越聪明 |
| **OpenHuman** | "最懂你的 agent" | 极致个性化 |
| **OpenClaw** | "全能助手" | 广而灵活 |
| **🟣 NeXra Agent** | **"一脑跨端,专为开店"** | **跨渠道 + 电商原生 + 借你机器算力** |

### 只有 NeXra 做的 5 件事

1. **🧠 一个大脑,所有渠道。** CLI + Telegram + WhatsApp + 微信 + Facebook + 网页 Console + MCP — 全部跑**同一个 agent**:同一份记忆、同一个人设、同一套 22 工具、同一份 RAG 知识库。早上顾客在 Telegram 跟 bot 聊产品,下午你开 `nexra chat` 它**记得**。其他 agent 都是各端各存。
2. **🛰  本机权限桥 — Cloud agent 借你机器的手。** 跑一句 `nexra daemon`,你**远程的 Telegram bot 就能把文件存到你的 Mac、跑 shell 脚本、抓取 URL**。全行业没第二家这么做。
3. **🛒 开店原生,开箱即跑。** 22 个工具预接好:产品/订单/顾客/库存/营销 + **Studio 内置**(图/视频/音乐/网站/PPT)。不用教 NeXra 什么是 SKU、什么是退款 — 它一上来就懂。
4. **🔌 接进 Claude Code / Cursor / Cline / Zed。** `nexra mcp` 把这 22 个工具喂给任何 MCP 客户端。不用换 IDE,直接给你现有的 coding agent 装上电商超能力。
5. **💸 70/30 分成的插件市场。** 任何人能发 NeXra 插件赚钱,作者拿 70%。封闭生态的 agent 给不了这个。

---

## ⚡ 30 秒上手

```bash
npm install -g @nexra-ai/agent-cli
nexra login                       # OAuth 浏览器登, 不需要 API key
nexra chat                        # 跟你的店聊天
nexra channels bind telegram      # 一秒变 24/7 客服 bot
nexra daemon                      # 让 bot 借你 Mac 的手 (可选)
```

完事。同一个 agent、同一个大脑 — 在你终端、在你顾客手机里、在 Claude Code 里面。

---

## ✨ vs 通用 AI agent

**Claude Code 适合写代码。NeXra Agent 适合开店。**

| | 通用 AI agent (Claude Code, Cursor) | **NeXra Agent** |
|---|---|---|
| **开箱即用工具** | 空白 — 自己接 | **22 个预接好的工具** (Studio + Shop) |
| **它懂什么** | 代码、文件、shell | 产品、订单、库存、顾客、广告 |
| **登录方式** | 每个工具一个 API key | **一次 OAuth 全搞定** |
| **渠道** | 只在终端 | **终端 + Telegram + WA + 微信 + FB + 网页 + MCP** |
| **跨端共享记忆** | ✗ 单端各存 | ✅ 一脑跨端 |
| **Cloud agent ↔ 你机器** | ✗ | ✅ `nexra daemon` 长轮询桥 |
| **Studio (图/视频/音乐/站/PPT)** | ✗ | ✅ 内置,按次计费 |
| **插件市场** | ✗ | ✅ 70/30 分成 |
| **跑在哪** | 你的机器 | **你的机器** (你的数据,你做主) |

---

## 🚀 五种用法 — *同一个大脑,所有界面*

只训一次 agent,顾客和员工不管从哪个渠道找过来,它都已经在那。

```
   终端          网页 Console     Telegram bot     WhatsApp/FB/微信        Claude Code / Cursor
 nexra chat   nexra-ai.co/admin   @你的店bot         (OAuth 绑定)         (MCP server)
      \             \                |                   /                       /
       \             \               |                  /                       /
        ──────────── 共享 agent runtime (一份记忆 + 一个人设 + 22 工具) ────────
                                       │
                                       └─ 可选: `nexra daemon` 让 cloud 端的
                                          渠道调你笔电的 fs/bash
```

### 1. 终端 — NeXra 当你的 shell agent

```bash
nexra chat
```

```
> 帮我找 5 个 RM 50 以下的产品,给最热卖那个生成一张广告图,存到 ~/Desktop/

  → shop_list_products({"limit":5})
  → studio_generate_image({"prompt":"lifestyle 镜头, A68862 ..."})
  → fs_write({"path":"/Users/amos/Desktop/promo.png", ...})

✓ 完成。最热卖: A68862 (RM 55, 库存 12)
✓ 图已存: /Users/amos/Desktop/promo.png
```

CLI 独有的本机工具(跑在**你**的机器,不是我们的):
- `fs_read` / `fs_write` — 读写文件
- `bash_exec` — 跑 shell 命令 (60 秒超时)
- `http_fetch` — GET/POST 任何 URL

加上 22 个 SaaS 工具(下面列)。

### 2. MCP server — 把 NeXra 接进 Claude Code / Cursor / Cline / Zed

你已经在用 Claude Code 写代码? 不用换 — **把 NeXra 当 MCP server 加进去**,你现有的 agent 立马获得 22 个电商超能力。

```json
// ~/.claude/mcp.json
{
  "mcpServers": {
    "nexra": { "command": "nexra", "args": ["mcp"] }
  }
}
```

重启 Claude Code / Cursor,问它:
- *"列我最近 5 个 NeXra 订单"* → 自动调 `shop_list_orders`
- *"搜 '吊带' 产品,给第一个写 WhatsApp 文案"* → `search_products` + `generate_marketing_copy`
- *"给夏季新品出张主图"* → `studio_generate_image`

**同样的 OAuth,同样的工具,零额外配置**。任何 [MCP 兼容客户端](https://modelcontextprotocol.io/clients)都能用。

### 3. 网页 — 在 NeXra 管理后台里

登 [nexra-ai.co](https://nexra-ai.co) → **Agent Console** → **🤖 NeXra Agent** 标签。同样 22 个工具,同样 agent runtime,浏览器 UI。不用装任何东西。

### 4. 顾客端 — 把同一个 agent 绑你店里所有渠道

把同一个 agent 变成 24/7 客服 bot,在终端就能配:

```bash
nexra channels bind telegram      # 粘 @BotFather 拿的 token
nexra channels bind wechat        # 粘微信公众号 AppID + AppSecret
nexra channels bind web           # 拿一段 <script> 嵌你官网
nexra channels bind whatsapp      # 跳网页走 Meta Business OAuth
nexra channels bind facebook      # 跳网页走 Page 管理员 OAuth
```

每个渠道跑的都是**同一个 agent** — 同样的人设、同样的产品知识、同样的对话历史。顾客在 Telegram 问 "这个有 M 码吗?",agent 自动调 `shop_list_products` 回答。

### 5. ⭐ Daemon 本机桥 — 让 cloud agent 借你机器的手

杀手锏。跑一次:

```bash
nexra daemon
```

你的 Telegram bot、网页 Console agent、未来任何渠道 — 都能通过长轮询桥**调你笔电上的 `fs_read` / `fs_write` / `bash_exec` / `http_fetch`**。你在 Telegram 跟 bot 说 "把今天订单导出到 ~/Desktop/orders.csv" — 它**真的导**。把客服 Telegram 接给你店里 server 上的 agent,它能反手回到你办公室 Mac 上"打印这张装箱单"。

```
Telegram bot ─→ NeXra server ─→ LLM 选工具
                       │
                       └─ 如果是本机工具 (fs/bash/http) ─→ 长轮询 ─→ 你 `nexra daemon` ─→ 在你 Mac 跑 ─→ 结果回传
```

🔒 **安全**: daemon 只绑 127.0.0.1、每实例一个随机配对 token、严格 Origin 白名单。本机 fs/bash 默认**关**,要 `nexra agents allow <id>` 一个一个 agent 开。顾客面向的 Telegram bot 不开你就不会开 — 不怕顾客让 bot 在你机器跑 `rm -rf`。

---

## 🧠 v0.5 统一 agent runtime

三个客户端共享:

```
              你的 ai_agent_system (server, 我们托管)
              ├── 22 SaaS 工具 (Studio + Shop)
              ├── 4 本机工具 (fs/bash/http) — 仅 CLI 见
              ├── 对话历史 (agent_messages 表)
              ├── 长期记忆 (agent_memory 表)
              ├── 知识库 RAG (agent_documents 表)
              └── 多个 agent 人设 (你创建几个就有几个)
                          ↑              ↑              ↑
                          │              │              │
                    Telegram bot   Web Console     nexra-cli
                  (顾客在用)     (你网页用)     (你终端用)
```

你早上在 Telegram 跟客服 bot 说 "明天提醒我补货",下午开 `nexra chat` 问 "我刚跟你说什么了" — **它记得**。

### 选哪个 agent 给 CLI 用

```bash
nexra agents list                # 看你所有 agent
nexra agents use 6              # 把 #6 (Nexra 经理) 当 CLI 默认
nexra agents allow 6            # 开它的 fs/bash 权限 (admin only!)
```

**安全铁律**: 只给**你自己用**的 agent 开 `allow` (像 admin 经理 agent)。顾客面向的 agent (Telegram 客服 bot 等) **永远保持 deny** — 不然顾客能通过聊天让 bot 在你机器跑 `rm -rf`。

---

## 📦 22 个内置工具

### 🎨 Studio (创作)
- **`studio_generate_image`** — 图片生成(Qwen / SDXL / Seedance)

### 🛒 Shop (运营)
- **`shop_list_products`** / **`shop_get_product`** — 浏览/查产品
- **`shop_list_orders`** / **`shop_get_order`** — 订单(线上+线下统一)
- **`shop_search_customers`** — 找顾客
- **`search_products`** / **`trending_products`** — 关键词 + 热卖榜
- **`lookup_order`** / **`cancel_order`** — 订单操作
- **`my_cart`** / **`add_to_cart`** — 购物车

### 📣 营销 & 内容
- **`generate_marketing_copy`** — FB / Email / WhatsApp 文案

### 🔌 插件市场
- **`generate_plugin_code`** — AI 自动写插件
- **`list_marketplace_plugins`** / **`install_marketplace_plugin`** / **`uninstall_plugin`** / **`upgrade_installed_plugin`**
- **`publish_new_plugin_version`** — 作者发版
- **`test_plugin`** — 沙盒测试

### 👤 账户
- **`me_quota_status`** — 套餐 + RM 余额 + 使用量

### 💻 本机(仅 CLI)
- **`fs_read`** / **`fs_write`** / **`bash_exec`** / **`http_fetch`**

**加新工具** — server 端注册表改一处, CLI 自动看到, 不需要重发版。

---

## 🔐 登录 — OAuth 2.0 Device Flow

```
$ nexra login

🤖 NeXra Agent — sign in

  浏览器打开:
  https://nexra-ai.co/oauth/device?user_code=ABCD-1234

  或访问 nexra-ai.co/oauth/device 输入 ABCD-1234

ℹ 验证码 10 分钟过期

Waiting for approval ...........
✓ Signed in as J.VOGUE (jvogue · pro)
```

- 没 API key 烦恼,浏览器一键登
- `~/.nexra/credentials.json` (chmod 600) 存 token
- Access 1 小时,refresh 90 天,自动旋转
- 多 profile: `nexra --profile acme whoami`

---

## 🛡 安全

- **客户端 BSL 1.1 license** ([./LICENSE](./LICENSE)) — 4 年内禁止打包成竞争 SaaS,2030-05-17 自动转 Apache 2.0
- **NeXra 商标** — fork 必须改名
- **Server-driven tool registry** — fork 客户端拿不到工具集合(都在闭源 server)
- **`allow_client_tools` agent-level gate** — 默认 false,顾客 agent 永远没 shell 权
- **2FA + OAuth + token 旋转** + 限流(server 侧)

详情见 [SECURITY.md](./SECURITY.md)。

---

## 💰 价格

CLI **免费**。用的时候按 NeXra 平台计费:

| 套餐 | RM/月 | 月度额度 |
|---|---|---|
| Free | 0 | RM 5 试用 |
| Coding | 49 | RM 49 |
| Pro | 89 | RM 89 |
| Enterprise | 299 | RM 299 |
| SME | 999 | RM 999 |

每次 AI 调用从月度额度扣,额外充值的钱永不过期。

---

## 🤝 贡献

PR 欢迎: 新 LLM provider / 新命令 / UX 改进 / bug 修复。

```bash
git clone https://github.com/NeXra-AI/agent-cli
cd agent-cli && npm install
npm run dev -- whoami
```

---

<div align="center">

### 一个大脑,跑遍所有渠道,为开店而生。

Made with ❤️ in 马来西亚 by [NeXra AI](https://nexra-ai.co)

</div>
