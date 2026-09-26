---
title: 'Agent = model + harness: Pi, OpenClaw, DeepSeek Harness and Claude Code side by side'
title_zh: 'Agent = 模型 + Harness：Pi、OpenClaw、DeepSeek Harness 和 Claude Code 横向对比'
title_ja: 'エージェント = モデル + ハーネス：Pi・OpenClaw・DeepSeek Harness・Claude Code の横並び比較'
date: 2026-09-12
permalink: /posts/2026/09/agent-harness-comparison/
excerpt: 'Four agents, four answers to the same questions: how big should the core be, who writes the features, what does the model see, and what is the agent allowed to touch. A side-by-side comparison and what I think it means.'
excerpt_zh: '四个 agent，对同一组问题给出了四种答案：核心该多大、功能由谁来写、模型看到什么、agent 被允许碰什么。一次横向对比，以及我的理解。'
excerpt_ja: '4 つのエージェントが同じ問いに 4 通りの答えを出している。コアの大きさ、機能を書くのは誰か、モデルに何を見せるか、エージェントに何を触らせるか。横並びの比較と、そこから考えたこと。'
trilingual: true
tags:
  - AI Agents
  - Agent Harness
  - Pi
  - OpenClaw
  - DeepSeek
  - Claude Code
---

<div class="lang-block lang-en" lang="en" markdown="1">

After writing about [DeepSeek Harness](/posts/2026/08/deepseek-harness/) and [the Claw family](/posts/2026/09/claw-family/), I wanted one page that puts the main agents next to each other. The useful framing, which DeepSeek made explicit, is **agent = model + harness**: the harness is everything that is not the weights — the loop, the tools, what goes into context, the permissions, the interface. Models are converging; harnesses are where the products really differ now.

## The map

<figure class="post-figure">
{% include figures/harness-map.svg %}
<figcaption>Two questions separate them: how much lives in the core, and who adds the rest.</figcaption>
</figure>

## Side by side

| | **Pi** | **OpenClaw** | **DeepSeek Harness** | **Claude Code / Codex** |
|---|---|---|---|---|
| Core | 4 tools (read, write, edit, bash), system prompt under 1k tokens | Pi, plus gateways, memory, skills, browser | small Cordis core; even the loop is a plugin | full-featured, tuned to one model family |
| Who adds features | you — or the agent writes its own TypeScript extensions | community skills | swappable plugins, YAML config | the vendor, plus MCP / plugins |
| Models | 25+ providers | many, incl. local | V4-Flash / Pro, other providers, self-hosted | mainly the vendor's own |
| MCP | left out on purpose (keeps the cached prompt stable) | via skills / plugins | as plugins | built in |
| Context strategy | session *tree*: branch off, fix something, rewind | Active Memory sub-agent before every reply (2.0) | append-only log, 95–100% prefix-cache hits reported | managed by the product (compaction, sub-agents) |
| Interface | terminal | the chat apps you already use | web UI / CLI | terminal, IDE |
| Default safety | none: bash runs with your full permissions; sandbox is an opt-in extension | sandbox off by default | developer preview; plugins run with your access | approval prompts / sandboxed modes |
| Best for | people who want to own every line | a personal assistant that lives in chat | cheap, customisable runs; self-hosting | getting work done with the least setup |

## Four things they agree on

**1. The cache shapes the design.** Pi leaves out MCP partly because loading tool definitions mid-session breaks the cached prompt; DeepSeek built its runtime around an append-only log. Neither is an accident. When one task can consume millions of tokens, the harness that keeps its prefix stable wins on cost by an order of magnitude.

**2. The agent writes its own tools.** Pi's philosophy — don't install features, ask the agent to build the extension — is spreading. It works because code is what these models are best at. The flip side is that your tool set becomes code nobody reviewed.

**3. The UI is dissolving.** OpenClaw showed that a chat thread is enough interface for most things. Armin Ronacher's line about removing the UI entirely no longer sounds like a provocation.

**4. Permissions are the unsolved part.** Look at the "default safety" row. Every harness that optimises for autonomy ships with little or no boundary, and every one that has a boundary makes you click through it. Nobody yet has a permission model that is both safe and invisible.

## How I would choose

- **Learning how agents work:** Pi. Four tools and a small prompt — you can read the whole thing in an afternoon.
- **A personal assistant:** the Claw pattern, but a fork with isolation (NanoClaw, ZeroClaw) rather than stock OpenClaw.
- **Enterprise or on-premises:** a harness that treats the model as a replaceable adapter and whose cost model works with a cache you run yourself. That points to something like DeepSeek Harness in front of your own inference stack — in my work, NIM — once it leaves preview.
- **Just shipping code today:** Claude Code or Codex. Opinionated is a feature when you don't want to build the harness.

The bigger point: choosing an agent is now mostly choosing a harness, and the harness decides three things the model cannot — **what it costs, what it can touch, and whether you can move it to your own hardware**.

### Sources

- [Pi: The Minimal Agent Within OpenClaw — Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [@mariozechner/pi-coding-agent — npm](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [Pi Coding Agent — Sandbox Analysis Report, Agent Safehouse](https://agent-safehouse.dev/docs/agent-investigations/pi)
- [OpenClaw — Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) · [MindStudio on DeepSeek Harness](https://www.mindstudio.ai/blog/deepseek-harness-agentic-coding)

</div>

<div class="lang-block lang-zh" lang="zh" hidden markdown="1">

写完 [DeepSeek Harness](/posts/2026/08/deepseek-harness/) 和 [Claw 家族](/posts/2026/09/claw-family/) 之后，我想要一页把主要的几个 agent 放在一起比较。最有用的框架是 DeepSeek 明确提出的那句：**agent = 模型 + harness**。harness 就是权重之外的一切——循环、工具、放进上下文的内容、权限、交互界面。模型在趋同，现在各产品真正拉开差距的地方在 harness。

## 定位图

<figure class="post-figure">
{% include figures/harness-map.svg %}
<figcaption>区分它们的是两个问题：核心里放多少东西，其余的由谁来加。</figcaption>
</figure>

## 横向对比

| | **Pi** | **OpenClaw** | **DeepSeek Harness** | **Claude Code / Codex** |
|---|---|---|---|---|
| 核心 | 4 个工具（read、write、edit、bash），系统提示词不到 1k token | Pi，加上网关、记忆、skills、浏览器 | 很小的 Cordis 核心，连循环都是插件 | 功能完整，针对自家模型调优 |
| 功能由谁加 | 你自己——或让 agent 自己写 TypeScript 扩展 | 社区 skills | 可替换插件，YAML 配置 | 厂商提供，加上 MCP / 插件 |
| 模型 | 25+ 家厂商 | 很多，包括本地模型 | V4-Flash / Pro、其他厂商、自托管 | 主要是自家模型 |
| MCP | 有意不支持（保持缓存的提示词稳定） | 通过 skills / 插件 | 作为插件 | 内置 |
| 上下文策略 | 会话*树*：分支出去修东西，再回到主线 | 2.0 起每次回复前跑 Active Memory 子 agent | 只追加日志，报告的前缀缓存命中率 95–100% | 由产品管理（压缩、子 agent） |
| 界面 | 终端 | 你已经在用的聊天软件 | Web UI / CLI | 终端、IDE |
| 默认安全 | 没有：bash 以你的全部权限运行，沙箱是可选扩展 | 沙箱默认关闭 | 开发者预览；插件拥有你的权限 | 需要确认 / 沙箱模式 |
| 适合 | 想掌控每一行代码的人 | 住在聊天软件里的个人助手 | 便宜、可定制，适合自托管 | 用最少的配置把活干完 |

## 它们在四件事上达成了共识

**1. 缓存决定设计。** Pi 不做 MCP，部分原因是会话中途加载工具定义会破坏缓存的提示词；DeepSeek 则把整个运行时建立在只追加的日志上。这都不是偶然。当一个任务能烧掉几百万 token 时，能保持前缀稳定的 harness 在成本上能赢一个数量级。

**2. agent 自己写工具。** Pi 的理念——不去安装功能，而是让 agent 自己写扩展——正在扩散。这行得通，是因为写代码恰好是这些模型最擅长的事。反面是：你的工具集变成了没人审过的代码。

**3. 界面正在消失。** OpenClaw 证明了一个聊天窗口对大部分事情来说已经够用。Armin Ronacher 说的“干脆把 UI 去掉”，现在听起来已经不像是挑衅了。

**4. 权限是没解决的部分。** 看“默认安全”那一行。所有为自主性优化的 harness 出厂时几乎都没有边界；而有边界的，都要你一路点确认。还没有人做出既安全又无感的权限模型。

## 我会怎么选

- **想搞懂 agent 是怎么工作的：** Pi。四个工具加一段很短的提示词，一个下午就能读完。
- **个人助手：** 用 Claw 这种模式，但选带隔离的分支（NanoClaw、ZeroClaw），而不是原版 OpenClaw。
- **企业或本地部署：** 选一个把模型当作可替换适配器、成本模型又能配合你自己运行的缓存的 harness。等 DeepSeek Harness 结束预览，把它放在你自己的推理栈前面——在我的工作里就是 NIM——会是这个方向。
- **今天就要把代码写完：** Claude Code 或 Codex。当你不想自己搭 harness 时，“强主张”本身就是优点。

更大的结论是：现在选 agent，基本就是在选 harness；而 harness 决定了三件模型决定不了的事——**花多少钱、能碰什么、能不能搬到你自己的硬件上**。

### 参考

- [Pi: The Minimal Agent Within OpenClaw — Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [@mariozechner/pi-coding-agent — npm](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [Pi Coding Agent — Sandbox Analysis Report, Agent Safehouse](https://agent-safehouse.dev/docs/agent-investigations/pi)
- [OpenClaw — Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) · [MindStudio 对 DeepSeek Harness 的介绍](https://www.mindstudio.ai/blog/deepseek-harness-agentic-coding)

</div>

<div class="lang-block lang-ja" lang="ja" hidden markdown="1">

[DeepSeek Harness](/posts/2026/08/deepseek-harness/) と [Claw ファミリー](/posts/2026/09/claw-family/) について書いたあと、主要なエージェントを一つのページで並べたくなりました。一番役に立つ枠組みは DeepSeek がはっきり打ち出した **エージェント = モデル + ハーネス** です。ハーネスとは重み以外のすべて――ループ、ツール、コンテキストに入れるもの、権限、インターフェースです。モデルが似通ってきた今、製品の差が本当に出るのはハーネスです。

## 位置づけ

<figure class="post-figure">
{% include figures/harness-map.svg %}
<figcaption>分かれ目は 2 つの問い：コアに何を入れるか、残りを誰が足すか。</figcaption>
</figure>

## 横並び比較

| | **Pi** | **OpenClaw** | **DeepSeek Harness** | **Claude Code / Codex** |
|---|---|---|---|---|
| コア | 4 ツール（read・write・edit・bash）、システムプロンプト 1k トークン未満 | Pi＋ゲートウェイ、記憶、skills、ブラウザ | 小さな Cordis コア、ループまでプラグイン | 多機能、自社モデル向けに調整 |
| 機能を足すのは | 自分――またはエージェントが自分で TypeScript 拡張を書く | コミュニティの skills | 差し替え可能なプラグイン、YAML 設定 | ベンダー、加えて MCP／プラグイン |
| モデル | 25 社以上 | 多数、ローカルも可 | V4-Flash／Pro、他社、セルフホスト | 主に自社モデル |
| MCP | 意図的に非対応（キャッシュされたプロンプトを安定させるため） | skills／プラグイン経由 | プラグインとして | 組み込み |
| コンテキスト戦略 | セッションの*木*：分岐して直し、巻き戻す | 2.0 から返答前に Active Memory サブエージェント | 追記専用ログ、プレフィックスキャッシュヒット率 95〜100% と報告 | 製品側で管理（圧縮、サブエージェント） |
| インターフェース | ターミナル | 普段使いのチャットアプリ | Web UI／CLI | ターミナル、IDE |
| 既定の安全性 | なし：bash は利用者の全権限で実行、サンドボックスは任意の拡張 | サンドボックスは既定でオフ | 開発者プレビュー、プラグインは利用者の権限で動く | 承認プロンプト／サンドボックスモード |
| 向いている人 | すべての行を自分で持ちたい人 | チャットに住む個人アシスタント | 安く柔軟に、セルフホストで | 最小の準備で仕事を片付けたい人 |

## 4 つの共通点

**1. キャッシュが設計を決める。** Pi が MCP を入れないのは、セッション途中でツール定義を読み込むとキャッシュされたプロンプトが壊れることも理由の一つです。DeepSeek はランタイム全体を追記専用ログの上に作りました。どちらも偶然ではありません。1 タスクで数百万トークンを使う以上、プレフィックスを安定させられるハーネスがコストで一桁勝ちます。

**2. エージェントが自分の道具を書く。** 機能をインストールするのではなくエージェントに拡張を書かせる、という Pi の考え方が広がっています。コードこそがこれらのモデルの得意分野だから成り立つ。裏返せば、道具一式が誰もレビューしていないコードになります。

**3. UI が溶けていく。** OpenClaw は、たいていのことはチャットのスレッドで足りると示しました。「UI をまるごと取り除く」という Armin Ronacher の言葉も、もう挑発には聞こえません。

**4. 権限だけが未解決。** 「既定の安全性」の行を見てください。自律性を優先したハーネスはほぼ境界なしで出荷され、境界のあるものは確認をクリックし続けさせます。安全で、しかも意識させない権限モデルはまだ誰も作れていません。

## 私ならこう選ぶ

- **エージェントの仕組みを学びたい：** Pi。4 つのツールと短いプロンプトで、午後いっぱいあれば全部読めます。
- **個人アシスタント：** Claw 型のパターンを、素の OpenClaw ではなく分離のあるフォーク（NanoClaw、ZeroClaw）で。
- **企業・オンプレミス：** モデルを差し替え可能なアダプタとして扱い、自分で運用するキャッシュでコストが成り立つハーネス。プレビューを抜けたら、自前の推論基盤――私の仕事なら NIM――の前に DeepSeek Harness のようなものを置く方向です。
- **今日コードを出荷したい：** Claude Code か Codex。ハーネスを作りたくないときは、こだわりの強さがそのまま長所になります。

大きく言えば、エージェント選びはいまやほぼハーネス選びで、ハーネスはモデルには決められない 3 つのこと――**いくらかかるか、何に触れられるか、自分のハードウェアに移せるか**――を決めています。

### 参考

- [Pi: The Minimal Agent Within OpenClaw — Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [@mariozechner/pi-coding-agent — npm](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [Pi Coding Agent — Sandbox Analysis Report, Agent Safehouse](https://agent-safehouse.dev/docs/agent-investigations/pi)
- [OpenClaw — Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) · [MindStudio による DeepSeek Harness の解説](https://www.mindstudio.ai/blog/deepseek-harness-agentic-coding)

</div>
