---
title: 'The Claw family: every fork fixes one way OpenClaw fails'
title_zh: 'Claw 家族：每一个分支都在修 OpenClaw 的一种失败方式'
title_ja: 'Claw ファミリー：どのフォークも OpenClaw の失敗モードを一つずつ直している'
date: 2026-09-04
permalink: /posts/2026/09/claw-family/
excerpt: 'OpenClaw 2.0 shipped last week with its sandbox still off by default. Meanwhile NanoClaw, ZeroClaw, PicoClaw, IronClaw and Nanobot each rebuilt the same idea around one of its weaknesses. Read together, they are a map of what a personal agent actually needs.'
excerpt_zh: 'OpenClaw 2.0 上周发布，沙箱依然默认关闭。与此同时，NanoClaw、ZeroClaw、PicoClaw、IronClaw、Nanobot 各自围绕它的一个弱点重做了同一个想法。放在一起看，它们就是一张“个人 agent 到底需要什么”的地图。'
excerpt_ja: '先週リリースされた OpenClaw 2.0 でも、サンドボックスは既定でオフのまま。一方で NanoClaw、ZeroClaw、PicoClaw、IronClaw、Nanobot は、それぞれ弱点の一つを軸に同じアイデアを作り直した。並べると、個人エージェントに本当に必要なものの地図になる。'
trilingual: true
tags:
  - AI Agents
  - OpenClaw
  - Security
  - Personal AI
---

<div class="lang-block lang-en" lang="en" markdown="1">

OpenClaw 2.0 (`v2026.8.1`) came out on August 30: faster setup, a new UI, shared cloud sessions, and an *Active Memory* plugin that runs a memory sub-agent before every reply. The Register's review focused on what did not change: no network or file-system boundary, secrets stored unencrypted, and the sandbox **off by default**.

That review made me go back over the whole "claw" family. In ten months one side project turned into a genre, and I think the forks explain OpenClaw better than OpenClaw does.

## Ten months in one picture

<figure class="post-figure">
{% include figures/claw-timeline.svg %}
<figcaption>From a side project to 389k stars. Red dots are the security events.</figcaption>
</figure>

Two lines run through this timeline. One is growth: Moltbook, the renames, 247k stars in March, 389k in September, Tencent and Z.ai building services on it. The other is security: a skill caught exfiltrating data in January, **CVE-2026-25253** (a one-click RCE through a token leaked over a WebSocket, CVSS 8.8, 40,000+ instances exposed when it was disclosed), and Chinese state enterprises being told to stay away in March.

## What OpenClaw actually is

Strip the lobster branding and OpenClaw is a pattern: **a long-running process on a machine you own, with persistent memory and your credentials, that you talk to through the chat apps you already use**, and that acts by writing and running code. The coding core is Mario Zechner's Pi (read, write, edit, bash). The product is everything around it: gateways to 20+ messaging platforms, skills, memory, browser control.

That pattern is powerful precisely because it has *ambient authority*: the agent can do whatever you can do. Every fork below is a different answer to "how much of that authority should it have, and at what cost?"

## The forks

<figure class="post-figure">
{% include figures/claw-map.svg %}
<figcaption>Each fork moves away from OpenClaw along one axis. Positions are my reading of each project's own claims.</figcaption>
</figure>

| Project | What it fixes | How | Trade-off |
|---|---|---|---|
| **NanoClaw** | blast radius | a Docker container per chat group, separate memory and filesystem | WhatsApp only; containers to operate |
| **IronClaw** | trust in the host | TEE-backed execution, AES-256-GCM credential vault, leak scanning | needs TEE-capable hardware |
| **ZeroClaw** | footprint and defaults | Rust rewrite, 3.4 MB binary, encrypted secrets, workspace scoping | younger ecosystem |
| **PicoClaw** | where it can run | Go, under 10 MB RAM, runs on ~$10 boards | minimal security model |
| **Nanobot** | comprehensibility | ~4,000 lines of Python, MCP support | per-chat isolation not built in |

*(Figures are as published by each project or in comparison write-ups; I have not benchmarked them.)*

## What I take from it

**1. The forks are a requirements document.** Put them together and you get the spec OpenClaw never wrote: isolation per conversation, secrets that are encrypted at rest, a footprint small enough to run anywhere, and a codebase small enough to audit. No single project has all four yet.

**2. Security is a default, not a feature.** OpenClaw *has* sandboxing; it is just off. Most users never change a default, so the default is the security model. NanoClaw and ZeroClaw's real contribution is that the safe path is the one you get without reading the docs.

**3. For companies, the question is authority, not capability.** In private-AI projects the first thing a security team asks is not "what can the agent do?" but "what can it touch, and who can prove that?" IronClaw's TEE story and NanoClaw's containers answer that; OpenClaw's allowlists mostly don't. China's restriction in March was blunt, but it was asking the same question.

**4. The interface won.** Whatever happens to OpenClaw itself, "talk to your agent in the chat app you already have open" is now the default expectation. The next fight is about the permission model behind the chat window.

### Sources

- [OpenClaw — Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [openclaw/openclaw releases](https://github.com/openclaw/openclaw/releases)
- [OpenClaw RCE vulnerability: CVE-2026-25253 — runZero](https://www.runzero.com/blog/openclaw/)
- [Pi: The Minimal Agent Within OpenClaw — Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [ZeroClaw vs OpenClaw vs NanoClaw vs Nanobot vs PicoClaw vs IronClaw — Lushbinary](https://lushbinary.com/blog/zeroclaw-openclaw-personal-ai-agents-compared-2026/)

</div>

<div class="lang-block lang-zh" lang="zh" hidden markdown="1">

OpenClaw 2.0（`v2026.8.1`）8 月 30 日发布：安装更快、新 UI、云端共享会话，还有一个 *Active Memory* 插件，每次回复前先跑一个记忆子 agent。The Register 的评测盯的却是没变的地方：没有网络和文件系统边界，密钥明文存储，沙箱**默认关闭**。

这篇评测让我把整个“claw”家族重新梳理了一遍。十个月里，一个业余项目变成了一个品类；而我觉得，那些分支比 OpenClaw 本身更能说明 OpenClaw 是什么。

## 一张图看十个月

<figure class="post-figure">
{% include figures/claw-timeline.svg %}
<figcaption>从业余项目到 38.9 万星。红点是安全事件。</figcaption>
</figure>

这条时间线上有两条线。一条是增长：Moltbook、两次改名、3 月 24.7 万星、9 月 38.9 万星，腾讯和智谱在它上面做服务。另一条是安全：1 月发现有 skill 在偷数据；**CVE-2026-25253**（通过 WebSocket 泄露 token 实现一键远程代码执行，CVSS 8.8，披露时有 4 万多个实例暴露在公网）；3 月中国要求国企和政府机构不要使用。

## OpenClaw 到底是什么

去掉龙虾品牌，OpenClaw 是一种模式：**一个跑在你自己机器上的常驻进程，带着持久记忆和你的各种凭据，你通过已经在用的聊天软件跟它说话**，它靠写代码、跑代码来做事。编程内核是 Mario Zechner 的 Pi（read、write、edit、bash 四个工具），产品则是它周围的一切：20 多个聊天平台的网关、skills、记忆、浏览器控制。

这个模式强大，恰恰是因为它拥有*环境权限（ambient authority）*：你能做的事它都能做。下面每一个分支，都是对“它该拥有多少权限、代价是什么”这个问题的不同回答。

## 各个分支

<figure class="post-figure">
{% include figures/claw-map.svg %}
<figcaption>每个分支都沿着某一个轴离开 OpenClaw。位置是我根据各项目自己的说法做的大致判断。</figcaption>
</figure>

| 项目 | 修的是什么 | 怎么修 | 代价 |
|---|---|---|---|
| **NanoClaw** | 爆炸半径 | 每个聊天群一个 Docker 容器，记忆和文件系统隔离 | 只支持 WhatsApp；要运维容器 |
| **IronClaw** | 对宿主机的信任 | TEE 执行、AES-256-GCM 凭据保险库、泄露扫描 | 需要支持 TEE 的硬件 |
| **ZeroClaw** | 体积和默认值 | Rust 重写，3.4 MB 二进制，密钥加密，工作区隔离 | 生态还年轻 |
| **PicoClaw** | 能跑在哪里 | Go 编写，内存不到 10 MB，能跑在约 10 美元的开发板上 | 安全模型很简单 |
| **Nanobot** | 可理解性 | 约 4000 行 Python，支持 MCP | 没有内置按会话隔离 |

*（数字来自各项目自己的说明或对比文章，我没有自己测过。）*

## 我的几点理解

**1. 这些分支合起来就是一份需求文档。** 把它们放在一起，就得到了 OpenClaw 从来没写出来的规格：按会话隔离、密钥静态加密、小到哪里都能跑的体积、小到可以审计的代码量。目前还没有一个项目同时做到这四点。

**2. 安全是默认值，不是功能。** OpenClaw *有*沙箱，只是默认关着。大多数用户从不改默认值，所以默认值就是它的安全模型。NanoClaw 和 ZeroClaw 真正的贡献是：不看文档也能走在安全的路上。

**3. 对企业来说，问题是权限，不是能力。** 在私有化 AI 项目里，安全团队问的第一个问题从来不是“这个 agent 能做什么”，而是“它能碰到什么，谁能证明这一点”。IronClaw 的 TEE 和 NanoClaw 的容器能回答这个问题，OpenClaw 的白名单大多回答不了。3 月中国的限制虽然简单粗暴，问的其实是同一个问题。

**4. 交互方式已经赢了。** 不管 OpenClaw 本身以后怎样，“在你本来就开着的聊天软件里跟 agent 说话”已经成了默认预期。下一场竞争，在聊天窗口背后的权限模型上。

### 参考

- [OpenClaw — Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [openclaw/openclaw releases](https://github.com/openclaw/openclaw/releases)
- [OpenClaw RCE vulnerability: CVE-2026-25253 — runZero](https://www.runzero.com/blog/openclaw/)
- [Pi: The Minimal Agent Within OpenClaw — Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [ZeroClaw vs OpenClaw vs NanoClaw vs Nanobot vs PicoClaw vs IronClaw — Lushbinary](https://lushbinary.com/blog/zeroclaw-openclaw-personal-ai-agents-compared-2026/)

</div>

<div class="lang-block lang-ja" lang="ja" hidden markdown="1">

OpenClaw 2.0（`v2026.8.1`）が 8 月 30 日に出ました。セットアップの高速化、新しい UI、クラウドでの共有セッション、そして返答のたびに先にメモリ用サブエージェントを走らせる *Active Memory* プラグイン。一方 The Register のレビューが注目したのは変わらなかった点でした。ネットワークとファイルシステムの境界がなく、シークレットは平文保存、サンドボックスは**既定でオフ**。

このレビューをきっかけに「claw」ファミリー全体を見直しました。10 か月で一つの個人プロジェクトがジャンルになりましたが、OpenClaw が何なのかは、本体よりもフォークのほうがよく語っていると思います。

## 10 か月を一枚で

<figure class="post-figure">
{% include figures/claw-timeline.svg %}
<figcaption>個人プロジェクトから 38.9 万スターへ。赤い点はセキュリティ上の出来事。</figcaption>
</figure>

このタイムラインには 2 本の線があります。一つは成長：Moltbook、2 度の改名、3 月に 24.7 万スター、9 月に 38.9 万スター、Tencent や Z.ai によるサービス化。もう一つはセキュリティ：1 月にデータを持ち出す skill が見つかり、**CVE-2026-25253**（WebSocket 経由のトークン漏えいによるワンクリック RCE、CVSS 8.8、公表時点で 4 万以上のインスタンスが公開状態）、3 月には中国の国有企業に利用を控えるよう通達。

## OpenClaw の正体

ロブスターのブランディングを外すと、OpenClaw は一つのパターンです。**自分のマシンで常時動くプロセスが、永続的な記憶とあなたの認証情報を持ち、普段使っているチャットアプリ越しに話しかけられ、コードを書いて実行することで動く。** コーディングの中核は Mario Zechner の Pi（read・write・edit・bash）で、製品はその周り全部――20 以上のメッセージング基盤へのゲートウェイ、skills、記憶、ブラウザ操作です。

このパターンが強力なのは、まさに*アンビエント権限*を持つからです。あなたにできることはエージェントにもできる。以下のフォークはどれも、「どこまでの権限を、どんなコストで持たせるか」への別々の答えです。

## フォークたち

<figure class="post-figure">
{% include figures/claw-map.svg %}
<figcaption>各フォークは一つの軸に沿って OpenClaw から離れていく。位置は各プロジェクト自身の説明に基づく私の大まかな判断です。</figcaption>
</figure>

| プロジェクト | 直しているもの | 方法 | トレードオフ |
|---|---|---|---|
| **NanoClaw** | 被害範囲 | チャットグループごとに Docker コンテナ、記憶とファイルシステムを分離 | WhatsApp のみ、コンテナの運用が必要 |
| **IronClaw** | ホストへの信頼 | TEE での実行、AES-256-GCM の認証情報保管庫、漏えいスキャン | TEE 対応ハードウェアが必要 |
| **ZeroClaw** | サイズと既定値 | Rust で書き直し、3.4 MB のバイナリ、シークレット暗号化、ワークスペース制限 | エコシステムがまだ若い |
| **PicoClaw** | 動かせる場所 | Go 製、メモリ 10 MB 未満、約 10 ドルのボードで動作 | セキュリティモデルは最小限 |
| **Nanobot** | 理解しやすさ | 約 4,000 行の Python、MCP 対応 | 会話ごとの分離は組み込みでない |

*（数値は各プロジェクトの公表値や比較記事によるもので、自分では計測していません。）*

## 私の受け止め方

**1. フォークを合わせると要件定義書になる。** 並べると、OpenClaw が書かなかった仕様が見えてきます。会話ごとの分離、保存時に暗号化されたシークレット、どこでも動く小ささ、監査できる程度のコード量。まだ 4 つすべてを満たすプロジェクトはありません。

**2. セキュリティは機能ではなく既定値。** OpenClaw にもサンドボックスは*あります*。オフになっているだけです。ほとんどの利用者は既定値を変えないので、既定値こそがセキュリティモデルです。NanoClaw と ZeroClaw の本当の貢献は、ドキュメントを読まなくても安全な道を歩けることです。

**3. 企業にとって問うべきは能力ではなく権限。** プライベート AI の案件でセキュリティチームが最初に聞くのは「何ができるか」ではなく「何に触れられて、それを誰が証明できるか」です。IronClaw の TEE と NanoClaw のコンテナはそれに答えられますが、OpenClaw の許可リストではほぼ答えられません。3 月の中国の制限は乱暴でしたが、問うていることは同じです。

**4. インターフェースは勝負がついた。** OpenClaw 自体がどうなろうと、「いつも開いているチャットアプリでエージェントと話す」はもう当たり前の期待になりました。次の競争は、チャット画面の裏にある権限モデルです。

### 参考

- [OpenClaw — Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [openclaw/openclaw releases](https://github.com/openclaw/openclaw/releases)
- [OpenClaw RCE vulnerability: CVE-2026-25253 — runZero](https://www.runzero.com/blog/openclaw/)
- [Pi: The Minimal Agent Within OpenClaw — Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [ZeroClaw vs OpenClaw vs NanoClaw vs Nanobot vs PicoClaw vs IronClaw — Lushbinary](https://lushbinary.com/blog/zeroclaw-openclaw-personal-ai-agents-compared-2026/)

</div>
