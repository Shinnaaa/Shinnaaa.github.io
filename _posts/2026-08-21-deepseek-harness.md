---
title: 'DeepSeek Harness: when the agent loop becomes a plugin'
title_zh: 'DeepSeek Harness：当 agent loop 也变成插件'
title_ja: 'DeepSeek Harness：エージェントループまでプラグインになるとき'
date: 2026-08-21
permalink: /posts/2026/08/deepseek-harness/
excerpt: 'DeepSeek shipped a harness, not just a model. The interesting part is not "everything is a plugin" but the economics underneath: prefix-cache discipline turns a token-hungry agent into a cheap one.'
excerpt_zh: 'DeepSeek 这次发的不只是模型，还有 harness。真正有意思的不是“一切皆插件”，而是底下的经济账：前缀缓存纪律让一个极其耗 token 的 agent 变得便宜。'
excerpt_ja: 'DeepSeek が出したのはモデルだけでなくハーネスだった。面白いのは「すべてがプラグイン」よりも、その下の経済性――プレフィックスキャッシュの規律が、トークンを大量に食うエージェントを安くしている点だ。'
trilingual: true
tags:
  - AI Agents
  - DeepSeek
  - Agent Harness
  - LLM Cost
---

<div class="lang-block lang-en" lang="en" markdown="1">

On August 13 DeepSeek released V4 together with something I did not expect from a model lab: an entire agent runtime, **DeepSeek Harness** (`dsh`), MIT-licensed, in developer preview. The repository passed 95,000 stars within two days. I have spent the week since reading the code and the write-ups, and I think most of the coverage is looking at the wrong layer.

## What it is

The slogan is *everything is a plugin*. That is usually marketing, but here it is literal: the model adapter, the tool registry, the session log and **the agent loop itself** are plugins, composed on a framework called Cordis. The Cordis paper (*A Programming Paradigm for Spatiotemporal Composability*) is about adding and removing components from a live system and cleanly reversing their side effects.

<figure class="post-figure">
{% include figures/dsh-architecture.svg id="en" %}
<figcaption>DeepSeek Harness as I understand it: a small core, and every runtime service around it replaceable.</figcaption>
</figure>

A few practical details make it more than a framework demo:

- Shell, file editing and web search are separately toggleable, and there are four modes (full coding agent, code, minimal, creator).
- Models are configured in a YAML file: V4-Flash or V4-Pro with adjustable reasoning effort, other providers, or **self-hosted models**.
- It can call Claude Code or Codex as sub-agents.
- `npx @deepseek-ai/dsh web` starts a local web UI.

## The part that matters: the cache bill

An agent re-reads its whole context on every step. MindStudio's test of dsh burned **about 20 million tokens across two turns** (35 minutes, ~240k output tokens at ~130 tok/s). At that volume the price per token barely matters; what matters is how much of the input is served from cache.

That is what the "plugin" design is really for. If the session log is append-only and nothing rewrites the start of the prompt, every step hits the prefix cache. Reported hit rates are **95–100%**, and one analysis puts a task at **$0.045–0.09 on V4-Flash versus $0.195–0.65 with Claude Code on Opus**.

<figure class="post-figure">
{% include figures/prefix-cache.svg %}
<figcaption>Why "never touch the prefix" is an architectural rule, not a micro-optimisation.</figcaption>
</figure>

<figure class="post-figure">
{% include figures/dsh-cost.svg %}
<figcaption>Reported ranges, not my own benchmark; the gap is what matters, not the exact numbers.</figcaption>
</figure>

This also explains design choices that look arbitrary from outside. A timestamp in the system prompt, a tool list sorted differently on each run, a memory block injected at the top: each one silently turns a 99% cache hit into a miss. A harness written by the people who price the cache has every reason to make those mistakes impossible.

## What I take from it

**1. Model labs are becoming harness companies.** Anthropic has Claude Code, OpenAI has Codex, now DeepSeek has dsh. The model is increasingly sold *with* the loop that uses it well, and for a cheap model the harness is where the margin is protected.

**2. Two answers to the same problem.** Pi keeps the core tiny and lets the agent write its own extensions. dsh makes the core formally composable. Both are reactions to closed, opinionated agents, and both treat cache stability as a design constraint.

**3. It matters for private deployments.** In my day job, customers want agents that run against models in their own data centre. A harness that treats "self-hosted model" as just another adapter, and whose cost model assumes a prefix cache you can also run yourself, is much easier to bring on-premises than one welded to a single API.

**4. The caveats are real.** It is a developer preview, it is token-hungry by design (cheap only *because* of the cache), and every plugin you load is code with access to your shell. "Everything is swappable" also means "everything is attack surface".

My short version: the headline feature is composability, but the lasting idea is that **cache hit rate is the KPI of an agent harness**.

### Sources

- [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) (README, MIT)
- [What Is DeepSeek Harness? — MindStudio](https://www.mindstudio.ai/blog/deepseek-harness-agentic-coding)
- [DeepSeek Harness and the Rise of the Composable Agent Runtime — Adnan Masood](https://medium.com/@adnanmasood/deepseek-harness-and-the-rise-of-the-composable-agent-runtime-7ac7ae836380)
- [DeepSeek open sources an agent harness where everything is a plugin — The New Stack](https://thenewstack.io/deepseek-harness-open-source-plugins/)

</div>

<div class="lang-block lang-zh" lang="zh" hidden markdown="1">

8 月 13 日 DeepSeek 发布 V4 的同时，还发了一个我没想到会从模型公司出来的东西：一整套 agent 运行时 **DeepSeek Harness**（`dsh`），MIT 许可，开发者预览版。两天之内仓库就过了 9.5 万星。这一周我读了代码和几篇分析，感觉大部分讨论都盯错了层。

## 它是什么

口号是“一切皆插件”。这种话通常是营销，但这次是字面意思：模型适配器、工具注册表、会话日志，甚至 **agent loop 本身**都是插件，组合在一个叫 Cordis 的框架上。Cordis 的论文（*A Programming Paradigm for Spatiotemporal Composability*）讲的是在运行中的系统里增删组件，并且能干净地撤销它们的副作用。

<figure class="post-figure">
{% include figures/dsh-architecture.svg id="zh" %}
<figcaption>我理解的 DeepSeek Harness：一个很小的核心，周围所有运行时服务都可以替换。</figcaption>
</figure>

几个让它不只是“框架 demo”的实际细节：

- shell、文件编辑、网页搜索可以单独开关，有四种模式（完整编程 agent、code、minimal、creator）。
- 模型写在一个 YAML 里：V4-Flash 或 V4-Pro（推理强度可调）、其他厂商，或者**自托管模型**。
- 可以把 Claude Code 或 Codex 当作子 agent 调用。
- `npx @deepseek-ai/dsh web` 就能起一个本地 Web UI。

## 真正重要的部分：缓存这笔账

agent 每走一步都要把整个上下文重读一遍。MindStudio 测 dsh 时，**两轮对话烧了大约 2000 万 token**（35 分钟，约 24 万输出 token，每秒约 130 个）。到了这个量级，单价几乎不重要，重要的是输入里有多少能命中缓存。

这才是“插件化”设计真正服务的目标。只要会话日志是只追加的、没有任何东西去改写提示词开头，每一步都能命中前缀缓存。公开报告的命中率是 **95–100%**；有一篇分析算出单个任务在 **V4-Flash 上 0.045–0.09 美元，而 Claude Code + Opus 是 0.195–0.65 美元**。

<figure class="post-figure">
{% include figures/prefix-cache.svg %}
<figcaption>为什么“不要动前缀”是一条架构规则，而不是微优化。</figcaption>
</figure>

<figure class="post-figure">
{% include figures/dsh-cost.svg %}
<figcaption>引用的是公开报告的区间，不是我自己的测试；重要的是差距，不是精确数字。</figcaption>
</figure>

这也解释了一些从外面看很随意的设计取舍。系统提示词里放个时间戳、每次运行工具列表顺序不同、在最前面插入一段记忆——任何一个都会把 99% 的命中率悄悄变成未命中。由给缓存定价的人亲手写的 harness，最有动力让这些错误根本不可能发生。

## 我的几点理解

**1. 模型公司正在变成 harness 公司。** Anthropic 有 Claude Code，OpenAI 有 Codex，现在 DeepSeek 有 dsh。模型越来越多地和“能把它用好的那个循环”一起卖；对便宜的模型来说，harness 才是守住利润的地方。

**2. 同一个问题的两种答案。** Pi 把核心压到极小，让 agent 自己写扩展；dsh 让核心在形式上可组合。两者都是对封闭、强主张型 agent 的反应，也都把缓存稳定性当成设计约束。

**3. 这对私有化部署很重要。** 我现在的工作里，客户想要的是跑在自己机房模型上的 agent。一个把“自托管模型”当成普通适配器、成本模型又建立在“你自己也能跑的前缀缓存”之上的 harness，要比焊死在某个 API 上的方案容易落地得多。

**4. 风险也是真的。** 它还是开发者预览版；它天生很耗 token（便宜*全靠*缓存）；你加载的每个插件都是能碰到 shell 的代码。“一切都可替换”同时也意味着“一切都是攻击面”。

一句话总结：标题功能是可组合性，但真正会留下来的观念是——**缓存命中率才是 agent harness 的核心 KPI**。

### 参考

- [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（README，MIT）
- [What Is DeepSeek Harness? — MindStudio](https://www.mindstudio.ai/blog/deepseek-harness-agentic-coding)
- [DeepSeek Harness and the Rise of the Composable Agent Runtime — Adnan Masood](https://medium.com/@adnanmasood/deepseek-harness-and-the-rise-of-the-composable-agent-runtime-7ac7ae836380)
- [DeepSeek open sources an agent harness where everything is a plugin — The New Stack](https://thenewstack.io/deepseek-harness-open-source-plugins/)

</div>

<div class="lang-block lang-ja" lang="ja" hidden markdown="1">

8 月 13 日、DeepSeek は V4 と同時に、モデル企業から出てくるとは思っていなかったものを公開しました。エージェントのランタイム一式、**DeepSeek Harness**（`dsh`）です。MIT ライセンスの開発者プレビューで、リポジトリは 2 日で 9.5 万スターを超えました。この一週間コードと解説を読んできましたが、多くの議論は見るべきレイヤーを外している気がします。

## どういうものか

キャッチコピーは「すべてがプラグイン」。普通なら宣伝文句ですが、今回は文字どおりです。モデルアダプタ、ツールレジストリ、セッションログ、そして**エージェントループそのもの**までがプラグインで、Cordis というフレームワークの上で組み合わされます。Cordis の論文（*A Programming Paradigm for Spatiotemporal Composability*）は、稼働中のシステムにコンポーネントを追加・削除し、その副作用をきれいに巻き戻す話です。

<figure class="post-figure">
{% include figures/dsh-architecture.svg id="ja" %}
<figcaption>私の理解する DeepSeek Harness：小さなコアと、その周りの差し替え可能なランタイムサービス。</figcaption>
</figure>

フレームワークのデモで終わらない実用面の特徴：

- シェル、ファイル編集、Web 検索を個別に切り替えられ、4 つのモード（フル機能のコーディングエージェント、code、minimal、creator）があります。
- モデルは YAML に書くだけ。V4-Flash／V4-Pro（推論の強さを調整可能）、他社モデル、**セルフホストのモデル**も選べます。
- Claude Code や Codex をサブエージェントとして呼び出せます。
- `npx @deepseek-ai/dsh web` でローカルの Web UI が起動します。

## 本当に大事なところ：キャッシュの請求額

エージェントはステップごとにコンテキスト全体を読み直します。MindStudio が dsh を試したところ、**2 ターンで約 2,000 万トークン**（35 分、出力は約 24 万トークン、毎秒約 130 トークン）を消費しました。この規模ではトークン単価はほとんど問題ではなく、入力のどれだけがキャッシュから返るかがすべてです。

「プラグイン」設計が本当に仕えているのはここです。セッションログが追記専用で、プロンプトの先頭を書き換えるものが何もなければ、毎ステップがプレフィックスキャッシュに当たります。報告されているヒット率は **95〜100%**。ある分析では 1 タスクあたり **V4-Flash で 0.045〜0.09 ドル、Claude Code + Opus では 0.195〜0.65 ドル**です。

<figure class="post-figure">
{% include figures/prefix-cache.svg %}
<figcaption>「先頭に触れない」がマイクロ最適化ではなくアーキテクチャ上のルールである理由。</figcaption>
</figure>

<figure class="post-figure">
{% include figures/dsh-cost.svg %}
<figcaption>公開されている範囲の引用で、自分のベンチマークではありません。大事なのは正確な数字より差の大きさです。</figcaption>
</figure>

外から見ると恣意的に見える設計判断も、これで説明がつきます。システムプロンプトのタイムスタンプ、実行ごとに並び順が変わるツール一覧、先頭に差し込まれるメモリ――どれか一つで 99% のヒットが静かにミスに変わります。キャッシュの値段を決めている側が書いたハーネスには、こうしたミスを起こせなくする強い動機があります。

## 私の受け止め方

**1. モデル企業はハーネス企業になりつつある。** Anthropic には Claude Code、OpenAI には Codex、そして DeepSeek には dsh。モデルは「それをうまく使うループ」と一緒に売られるようになり、安価なモデルにとって利益を守る場所はハーネスです。

**2. 同じ問題への 2 つの答え。** Pi はコアを極小にしてエージェント自身に拡張を書かせ、dsh はコアを形式的に合成可能にしました。どちらも閉じた「こだわり型」エージェントへの反応で、どちらもキャッシュの安定性を設計上の制約として扱っています。

**3. プライベート環境への展開で効いてくる。** 私の今の仕事では、顧客は自社データセンターのモデルで動くエージェントを求めています。「セルフホストモデル」を普通のアダプタとして扱い、コストの前提が自分でも運用できるプレフィックスキャッシュにあるハーネスは、特定の API に溶接されたものよりずっとオンプレミスに持ち込みやすい。

**4. リスクも本物。** まだ開発者プレビューで、設計上トークンを大量に使い（安いのはキャッシュの*おかげ*）、読み込むプラグインはどれもシェルに触れるコードです。「すべて差し替え可能」は「すべてが攻撃面」でもあります。

短く言えば、目玉機能は合成可能性ですが、残る考え方は **キャッシュヒット率こそエージェントハーネスの KPI** だということです。

### 参考

- [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（README、MIT）
- [What Is DeepSeek Harness? — MindStudio](https://www.mindstudio.ai/blog/deepseek-harness-agentic-coding)
- [DeepSeek Harness and the Rise of the Composable Agent Runtime — Adnan Masood](https://medium.com/@adnanmasood/deepseek-harness-and-the-rise-of-the-composable-agent-runtime-7ac7ae836380)
- [DeepSeek open sources an agent harness where everything is a plugin — The New Stack](https://thenewstack.io/deepseek-harness-open-source-plugins/)

</div>
