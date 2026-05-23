<div align="center">

# 🤖 NeXra Agent CLI

### 装一个 agent,顶一整柜电商 SaaS。

**自己什么都能做,不调外面的 API。**

写歌、做 MV、建官网、出短剧、写小说、剪营销片、出商品照、上架 Shopee/TikTok、投 FB Ads、对账银行流水、跑物流 — **50+ AI 能力全部原生内置,一个都不用外接。**

```bash
npm install -g @nexra-ai/agent-cli
nexra login
nexra chat
```

[English](./README.md) · [中文](./README.zh-CN.md)

[官网](https://nexra-ai.co) · [文档](https://nexra-ai.co/docs/cli) · [价格](https://nexra-ai.co/pricing) · [Studio](https://nexra-ai.co/studio)

</div>

---

## 🎯 一句话差异化

别家 agent 都在卖**自己**。NeXra 卖的是**自己里面装的整间店**。

| Agent | 一句话卖点 | 装完后,你还得自己接 | 跑在哪 |
|---|---|---|---|
| **Hermes** | *会自我进化* | Suno + Runway + Webflow + Shopify + FB Marketing + Mailgun + Twilio + Shopee + TikTok + … | 自部署 — 你要 24h 开服务器 |
| **OpenHuman** | *最懂你* | 一柜子 | 本地 — 笔电进睡眠 agent 就死 |
| **OpenClaw** | *全能助手* | 一柜子 | 本地 / 自部署 |
| **Claude Code / Cursor** | *写代码很强* | 一柜子 | 本地 — 关终端就停 |
| **🟣 NeXra** | ***一柜子 SaaS 打包成一个 agent*** | **— 没有。`nexra login` 就够。** | **我们的云。你笔电可以关机。** |

---

## ✨ 真正起作用的 6 件事

### 1️⃣ 50+ 原生 AI 能力 — *agent 自己干,不靠外部 API*

你在 Telegram、终端、随便哪儿,一句话:

| 你说… | NeXra 自己完成(不调外部 API) |
|---|---|
| *"给夏季新品写一首主题曲"* | 🎵 出歌(MiniMax) |
| *"拿这首歌剪一支 30 秒 MV"* | 🎬 出 MV(Seedance) |
| *"做一个落地页 + hero 文生视频"* | 🌐 建官网(含 hero 视频) |
| *"做一支 30 秒短剧推这条裙子"* | 🎭 出短剧(BytePlus 数字人) |
| *"写一篇 5 千字种草小说带产品植入"* | 📖 出小说 |
| *"把这视频剪成 9:16 IG Reel"* | ✂️ 自动剪 |
| *"给 SKU A68862 投一组 FB Ads + A/B"* | 📊 自动投放 + Bayesian A/B |
| *"把这个商品上架 Shopee + TikTok"* | 🛍 自动跨境上架 |
| *"对一下今天银行流水跟未付订单"* | 💸 AI 对账 |

其他 agent 这些事 → 接 Suno + Runway + Webflow + FB Marketing + Shopify + … 每家一套 SDK、一份月费、一个 API key。
**NeXra 自己就是那一柜子 SDK。**

### 2️⃣ 不用换 IDE — *一个 NeXra 替代 22 个平台 API*

已经在用 Claude Code?加**一行**:

```json
{ "mcpServers": { "nexra": { "command": "nexra", "args": ["mcp"] } } }
```

你的 Claude Code 立刻多 22 个电商 + 创意工具 — **不然你得去 22 个平台分别注册、拿 22 个 API key、配 22 份计费、自己写 22 段集成代码**。NeXra 把这一切收成一次 OAuth。

### 3️⃣ 真 24 小时运转 — *你笔电关机/睡觉/出门旅行都没事*

市面上大多数"AI agent"跑在**你**的机器。终端一关 → agent 死。笔电进睡眠 → Telegram bot 没声音。自部署方案(Hermes、OpenClaw)需要**你**养一台服务器,自己付电费、自己重启、自己维护。

**NeXra 跑在我们云端**。整个 agent runtime — 你的人设、记忆、Telegram bot、定时的 FB Ads / Blog Autopilot / 对账任务 — 全在我们服务器上。你睡觉、你笔电关机、你坐飞机出国。**顾客的"这个有 M 码吗"照样有人答、订单照流、广告照优化**。

| | 自部署 agent (Hermes, OpenClaw) | 本地 agent (Claude Code, Cursor) | **NeXra** |
|---|---|---|---|
| 你要维护的服务器 | 有 — 你自己搞 | 没有 | **没有 — 我们搞** |
| 笔电睡眠时还在跑 | 看你服务器没挂 | ✗ 死 | ✅ 一直在 |
| 你出差时还在跑 | 看你服务器没崩 | ✗ 死 | ✅ 一直在 |
| 闲置成本 | 电费 + 带宽 | 免费 | 免费(只按 AI 调用付费) |

零硬件、零运维、零电费。

### 4️⃣ Agent 应用的"淘宝" — *你做的 skill 终于有地方卖*

你给 Claude Code / Hermes 写了一个酷 plugin — **谁买?** 没人。烂在自己电脑。

NeXra 是**第一个专门给 agent plugin 开的应用市场**:

- 发上去 → 真在花钱的电商租户付费安装
- **作者拿 70%**,NeXra 抽 30%
- AI 帮你生成骨架(`nexra plugin init`)
- 内置安装 / 升级 / 沙盒 / 签名发布

对开发者:终于有分发渠道。对店主:有审核过的零售自动化应用市场。

### 5️⃣ 一脑跨端 *(基本面,但做到位)*

CLI / Telegram / WhatsApp / 微信 / FB / 网页 / MCP 共享同一个 agent — 同一份记忆、人设、知识库、22+ 工具。很多 agent 嘴上都说,但很少真正端到端打通顾客面渠道。

### 6️⃣ Cloud agent 借你 Mac 的手 *(`nexra daemon`)*

跑一句 `nexra daemon`,你 Telegram bot 就能通过长轮询调你笔电的 `fs_write` / `bash_exec` — *"把今天订单导到 ~/Desktop"* 它真导。*(其他 agent 技术上也能做,我们做成了一条命令 + 加固的安全模型:127.0.0.1 only、配对 token、Origin 白名单。)*

---

## ⚡ 30 秒上手

```bash
npm install -g @nexra-ai/agent-cli
nexra login                       # OAuth 浏览器登, 不需要 API key
nexra chat                        # 跟你的店聊天
nexra channels bind telegram      # 一秒变 24/7 客服 bot
nexra daemon                      # 让 bot 借你 Mac 的手 (可选)
```

---

## ✨ vs 通用 AI agent

**Claude Code 适合写代码。NeXra Agent 适合开店。**

| | 通用 AI agent (Claude Code, Cursor) | **NeXra Agent** |
|---|---|---|
| **它能自己生成什么** | 代码、文本 | **图、视频、音乐、MV、官网、PPT、配音、短剧、小说、广告、上架、对账** |
| **登录方式** | 每个工具一个 API key (22+) | **一次 OAuth 全搞定** |
| **渠道** | 只在终端 | **终端 + Telegram + WA + 微信 + FB + 网页 + MCP** |
| **跨端共享记忆** | ✗ | ✅ 一脑跨端 |
| **能卖你写的 skill 的市场** | ✗ | ✅ 70/30 分成,真付费买家 |
| **能接进 Claude Code / Cursor** | n/a | ✅ `nexra mcp` |

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

## 📦 内置能力

NeXra 平台当前 **50+ 原生 AI 能力**(Studio + Shop + 营销 + Marketplace + 物流 + 对账)。CLI 现版本通过 MCP / chat 暴露 **22 个**,其余仍在网页 Console + Telegram bot 提供,后续版本陆续接进 CLI。

### CLI 当前 22 工具

### 🎨 Studio (创作 — 原生生成,不调外部 API)
- **`studio_generate_image`** — 图片生成(Qwen / SDXL / Seedance)
- *(平台另有,下版本接 CLI:出歌 · 出视频 · 出 MV · 短剧 · 小说 · 网站 · PPT · 配音 · 数字人 · photo-AI · 图生视频 · 网页介绍视频)*

### 🛒 Shop (运营)
- **`shop_list_products`** / **`shop_get_product`** — 浏览/查产品
- **`shop_list_orders`** / **`shop_get_order`** — 订单(线上+线下统一)
- **`shop_search_customers`** — 找顾客
- **`search_products`** / **`trending_products`** — 关键词 + 热卖榜
- **`lookup_order`** / **`cancel_order`** — 订单操作
- **`my_cart`** / **`add_to_cart`** — 购物车
- *(平台另有:AutoCount POS 同步 · 采购单 · 盘点 · 代购 · 分销 · 餐饮垂直 · 房产垂直 — 网页 Console 已开)*

### 📣 营销 & 内容
- **`generate_marketing_copy`** — FB / Email / WhatsApp 文案
- *(平台另有:FB Ads 自动化 + Bayesian A/B · Custom Audience · Blog Autopilot · SMM 流量 · AI 银行流水对账 — 网页 Console 已开)*

### 🌍 Marketplace & 物流(平台 — 后续接 CLI)
- Shopee + TikTok Shop adapter(跨境上架同步)
- Skynet + EasyParcel 物流(主账号分流 + 20% 净利)

### 🔌 插件市场 — *Agent skill 的淘宝*
- **`generate_plugin_code`** — AI 自动写插件
- **`list_marketplace_plugins`** / **`install_marketplace_plugin`** / **`uninstall_plugin`** / **`upgrade_installed_plugin`**
- **`publish_new_plugin_version`** — 作者发版(**70% 分成**)
- **`test_plugin`** — 沙盒测试

### 👤 账户
- **`me_quota_status`** — 套餐 + RM 余额 + 使用量

### 💻 本机(仅 CLI)
- **`fs_read`** / **`fs_write`** / **`bash_exec`** / **`http_fetch`**

**Server 端工具注册表** — 平台多一个能力,下次 `nexra chat` 就看到,不用重发 CLI 版本。

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
