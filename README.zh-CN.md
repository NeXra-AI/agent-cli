<div align="center">

# 🤖 NeXra Agent CLI

**电商创业者专属的 AI agent。**

第一个真正"为开店而生"的 AI agent。出图 / 出视频 / 出音乐 / 建站 **+** 产品 / 订单 / 顾客 / 库存 / 营销 — 全在你的终端,或者通过 MCP 接入你已经在用的 Claude Code / Cursor / Cline。

```bash
npm install -g @nexra-ai/agent-cli
nexra login
nexra chat
```

[English](./README.md) · [中文](./README.zh-CN.md)

[官网](https://nexra-ai.co) · [文档](https://nexra-ai.co/docs/cli) · [价格](https://nexra-ai.co/pricing) · [Studio](https://nexra-ai.co/studio)

</div>

> **v0.5 重磅** — **统一 agent runtime**。你终端的 `nexra chat`、你店里 Telegram 的客服 bot、`nexra-ai.co/admin` 网页里的 Agent Console,现在**是同一个 agent** — 同一份记忆、同一个人设、同一套技能、同一个知识库。CLI 多了 fs/bash/http,**因为它跑在你自己的机器上**。

---

## ✨ 为什么用 NeXra Agent

**Claude Code 适合写代码。NeXra Agent 适合开店。**

| | 通用 AI agent (Claude Code, Cursor) | **NeXra Agent** |
|---|---|---|
| **开箱即用工具** | 空白 — 自己接 | **22 个预接好的工具** (Studio + Shop) |
| **它懂什么** | 代码、文件、shell | 产品、订单、库存、顾客、广告 |
| **登录方式** | 每个工具一个 API key | **一次 OAuth 全搞定** |
| **多端口** | 只在终端 | 终端 + 网页 + **MCP**(接你现有的 agent) |
| **跑在哪** | 你的机器 | **你的机器** (你的数据,你做主) |
| **统一记忆** | 单端各自存 | **三个端口同一份记忆** |

---

## 🚀 三种用法

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

**电商创业者专属的 AI agent。**
Made with ❤️ in 马来西亚 by [NeXra AI](https://nexra-ai.co)

</div>
