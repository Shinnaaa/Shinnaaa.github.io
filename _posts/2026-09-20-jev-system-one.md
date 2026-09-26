---
title: 'Jev, the AI that does not talk: notes on a "System One" model'
title_zh: 'Jev，一个不说话的 AI：关于“System One 模型”的笔记'
title_ja: '話さない AI、Jev：「System One モデル」についてのメモ'
date: 2026-09-20
permalink: /posts/2026/09/jev-system-one/
excerpt: 'TypeSafe AI''s Jev returns a typed decision and a probability instead of text, in 70–500 ms. "Zero hallucinations" is the headline; I think the real product is calibration — and calibrated probabilities are exactly what cost-sensitive decisions need.'
excerpt_zh: 'TypeSafe AI 的 Jev 不输出文字，而是在 70–500 毫秒内返回一个有类型的决策和一个概率。“零幻觉”是标题，但我认为真正的产品是校准——而校准过的概率，正是考虑代价的决策最需要的东西。'
excerpt_ja: 'TypeSafe AI の Jev は文章ではなく、型付きの判断と確率を 70〜500 ms で返す。見出しは「ハルシネーションゼロ」だが、本当の製品はキャリブレーションだと思う。そしてキャリブレーションされた確率こそ、コストを考慮した意思決定に必要なものだ。'
trilingual: true
tags:
  - Jev
  - Decision Models
  - Calibration
  - AI Agents
---

<div class="lang-block lang-en" lang="en" markdown="1">

On September 15 a startup called TypeSafe AI came out of stealth with **Jev**, which it calls the first *System One model*. Its CEO, Diogo Almeida, is a former OpenAI researcher and a co-author of the InstructGPT paper; the company has a $40M seed round. Jev is in early access through a hosted API.

The pitch is unusual enough that I spent the week trying to decide whether it is a new category or a well-packaged classifier. My answer is "both", and the interesting part is not the one on the landing page.

## What it does

Jev never writes text. You send it a piece of context (a "state") and one or more typed questions, and it returns values of those types:

- **choice** — one option from a list, with a probability for every option and a confidence;
- **score** — a value on a defined scale, with probabilities;
- **yes/no** — a probability between 0 and 1.

Several questions about the same state are answered **in a single parallel pass**. TypeSafe quotes **70–500 ms** end to end, **$0.042 per million input tokens**, output free, and "40–200× faster than frontier LLMs" on this kind of task. It was trained with what they call **RLCD — Reinforcement Learning for Calibrated Decisions**: the goal is that when Jev says 95%, it is right 95% of the time. There is no image, audio or video input yet.

<figure class="post-figure">
{% include figures/jev-architecture.svg id="en" %}
<figcaption>How I would place it: a fast decision layer that sends each case to code, an LLM or a person.</figcaption>
</figure>

## Reading the claims carefully

**"Zero hallucinations"** is true by construction and a little misleading. Jev cannot produce an option that does not exist, so it cannot break your schema. It can still pick the *wrong* option. Typed output removes format errors, not judgement errors.

**The benchmarks are against LLMs.** According to heise, the reference labels in TypeSafe's evaluation are the average of GPT-6 Astra's and Claude Fable 5.1's answers; Wavect's review notes the vendor's own four-workflow test and its "444.6× cheaper" figure. So Jev is, at best, a model that agrees with frontier LLMs at a fraction of the latency and cost. That is valuable — but it is distillation economics, not a claim to be *more correct* than them.

**The real product is calibration.** A router that is right 90% of the time is useful. A router that *knows which* 10% it is unsure about is far more useful, because you can send exactly those cases elsewhere. That is the promise of RLCD, and it is also the claim you have to verify yourself, because calibration only holds on the distribution it was measured on.

<figure class="post-figure">
{% include figures/calibration.svg %}
<figcaption>What "calibrated" means. Before trusting a threshold, draw this chart on your own traffic.</figcaption>
</figure>

## Where it fits: the small decisions inside agents

In my [harness comparison](/posts/2026/09/agent-harness-comparison/) I argued that the harness is now where agents differ. Look inside any harness and you find dozens of tiny decisions per task: which tool, whether to retry, whether a step failed, whether to ask the human, whether an output is safe to show. Today most of those are either hard-coded rules or another full LLM call that takes seconds and costs as much as the real work.

That is the gap Jev targets: **System 1 for the reflexes, System 2 for the thinking, code for the rules**. The sensible pattern — also what Wavect recommends — is to keep arithmetic, permissions and side effects in code, run Jev in shadow mode against your current logic first, and set the confidence threshold per risk: a wrong FAQ route and a wrong refund decision do not deserve the same bar.

## A connection to my own research

My graduate research was on hierarchical emotion labels, where predicting *amusement* for a *joy* example is a smaller mistake than predicting *sadness* ([EEMD](/publications/)). Routing has the same structure: sending a billing question to the *refunds* queue is a near miss; sending it to *security* is not.

A model that only returns its top choice cannot use that. A model that returns **calibrated probabilities over all options** can: instead of taking the most likely option, you choose the one with the **lowest expected cost**, using a cost matrix built from the label hierarchy.

| Option | Jev probability | Cost if the true class is *billing* | Cost if *refunds* | Cost if *security* | **Expected cost if chosen** |
|---|---|---|---|---|---|
| billing | 0.46 | 0 | 1 | 4 | **0.96** |
| refunds | 0.40 | 1 | 0 | 4 | **1.02** |
| security | 0.14 | 4 | 4 | 0 | **3.44** |

*(Illustrative numbers.)* Here "billing" and "refunds" are close, so the expected cost of choosing either is low, while a confident-looking but wrong jump to "security" is expensive. This only works if the probabilities mean what they say — which is exactly the property TypeSafe is selling.

## My reservations

- **Hosted only, for now.** In private-AI work, the first question is where the data goes. A small, fast decision model is the ideal thing to run on-premises (it is the kind of workload that fits a NIM-style container well); until that exists, regulated customers will not put their tickets through it.
- **Weak on numbers.** Dates, prices and exact calculations are not what it is for.
- **Adversarial input.** The state is user text. A decision model that routes support tickets is also a target for people who want to be routed somewhere.
- **Confidence is not permission.** 99% sure is still not authorised.

Jev feels like the first product built on an idea I have had for a while: that most "AI decisions" in production should not be generated at all, only *chosen* — quickly, from a known set, with an honest probability attached.

### Sources

- [Jev — TypeSafe AI](https://jevai.net/)
- [AI model "Jev" to make machines decide faster — heise online](https://www.heise.de/en/news/AI-model-Jev-to-make-machines-decide-faster-11457071.html)
- [What Is Jev AI? A Practical Guide — Hugging Face blog](https://huggingface.co/blog/sora-2/what-is-jev-ai-a-practical-guide-to-system-one-and)
- [Jev AI Review: Decision Models for Agent Workflows — Wavect](https://wavect.io/blog/jev-ai-decision-model-review/)

</div>

<div class="lang-block lang-zh" lang="zh" hidden markdown="1">

9 月 15 日，一家叫 TypeSafe AI 的初创公司结束隐身，发布了 **Jev**，称之为第一个 *System One 模型*。CEO Diogo Almeida 曾是 OpenAI 研究员、InstructGPT 论文的作者之一；公司拿了 4000 万美元种子轮。Jev 目前通过托管 API 提供早期访问。

它的定位足够特别，我这一周一直在想：它到底是一个新品类，还是一个包装得很好的分类器？我的答案是“两者都是”，而真正有意思的部分并不在它的官网首页上。

## 它做什么

Jev 从不输出文字。你给它一段上下文（称为 state）和一个或多个带类型的问题，它返回对应类型的值：

- **choice**——从列表中选一个选项，同时给出每个选项的概率和置信度；
- **score**——在给定刻度上打分，附带概率；
- **yes/no**——一个 0 到 1 之间的概率。

针对同一个 state 的多个问题，**在一次并行推理里全部回答**。TypeSafe 给出的数字是端到端 **70–500 毫秒**、**每百万输入 token 0.042 美元**、输出免费，在这类任务上“比前沿 LLM 快 40–200 倍”。训练方法叫 **RLCD（Reinforcement Learning for Calibrated Decisions，面向校准决策的强化学习）**：目标是当 Jev 说 95% 时，它确实有 95% 的时候是对的。目前还不支持图像、音频、视频输入。

<figure class="post-figure">
{% include figures/jev-architecture.svg id="zh" %}
<figcaption>我会这样定位它：一个快速的决策层，把每个情况分给代码、LLM 或人。</figcaption>
</figure>

## 仔细读它的说法

**“零幻觉”**在结构上成立，但有点误导。Jev 不可能输出不存在的选项，所以不会破坏你的 schema；但它仍然可能选*错*。有类型的输出消除的是格式错误，不是判断错误。

**基准是拿 LLM 当标准的。** 据 heise 报道，TypeSafe 评估里的参考标签是 GPT-6 Astra 和 Claude Fable 5.1 答案的平均；Wavect 的评测也指出，“便宜 444.6 倍”这个数字来自厂商自己设计的四个工作流测试。所以 Jev 最好的情况，是一个在延迟和成本只有零头的前提下与前沿 LLM 保持一致的模型。这很有价值，但它是蒸馏的经济学，而不是声称比它们*更正确*。

**真正的产品是校准。** 一个 90% 时候都对的路由器是有用的；一个*知道自己哪 10% 没把握*的路由器要有用得多，因为你可以只把这部分情况转给别处。这就是 RLCD 的承诺，也是你必须自己验证的那部分——因为校准只在它被测量的那个数据分布上成立。

<figure class="post-figure">
{% include figures/calibration.svg %}
<figcaption>“校准”是什么意思。在相信某个阈值之前，先用你自己的流量画出这张图。</figcaption>
</figure>

## 它适合放在哪里：agent 内部的小决策

我在 [harness 横向对比](/posts/2026/09/agent-harness-comparison/)里说过，现在 agent 之间的差别在 harness。打开任何一个 harness，每个任务里都有几十个小决策：用哪个工具、要不要重试、这一步是不是失败了、要不要问人、这个输出能不能展示。今天这些要么是写死的规则，要么是再调一次完整的 LLM——花几秒钟，成本和真正干活的那一步差不多。

Jev 瞄准的就是这个空档：**System 1 负责反射，System 2 负责思考，代码负责规则**。比较稳妥的做法——也是 Wavect 建议的——是把算术、权限和副作用留在代码里；先让 Jev 以影子模式和现有逻辑并行跑；再按风险分别设置置信度阈值：FAQ 路由错了和退款决策错了，不值得用同一条线。

## 和我自己研究的联系

我读研期间做的是层级情感标签：把 *joy* 预测成 *amusement*，比预测成 *sadness* 错得轻（[EEMD](/publications/)）。路由也有同样的结构：把账单问题转到*退款*队列是“差一点”，转到*安全*队列就不是了。

只返回最优选项的模型用不上这一点；而返回**所有选项上校准过的概率**的模型可以：不选概率最高的，而是用按标签层级构造的代价矩阵，选**期望代价最低**的那个。

| 选项 | Jev 概率 | 真实类别为*账单*时的代价 | 为*退款*时 | 为*安全*时 | **选它的期望代价** |
|---|---|---|---|---|---|
| 账单 | 0.46 | 0 | 1 | 4 | **0.96** |
| 退款 | 0.40 | 1 | 0 | 4 | **1.02** |
| 安全 | 0.14 | 4 | 4 | 0 | **3.44** |

*（示意数字。）* 这里“账单”和“退款”很接近，选其中任何一个的期望代价都低；而看起来很自信、实际错误地跳到“安全”，代价就很高。这一切的前提是概率真的名副其实——而这恰恰是 TypeSafe 在卖的那个性质。

## 我的保留意见

- **目前只有托管版。** 做私有化 AI，第一个问题永远是数据去哪里。一个小而快的决策模型本来是最适合本地部署的东西（这类负载很适合装进 NIM 这样的容器）；在那之前，受监管的客户不会把工单交给它。
- **不擅长数字。** 日期、价格、精确计算不是它的用途。
- **对抗性输入。** state 是用户写的文字。一个负责给客服工单分流的决策模型，也会成为想被分到某个地方的人的攻击目标。
- **置信度不等于授权。** 99% 确定，也依然不等于被允许。

Jev 让我觉得，终于有产品建立在我一直以来的一个想法上：生产环境里大多数“AI 决策”根本不该被*生成*，而应该被*选择*——快速地、从一个已知集合里选，并附上一个诚实的概率。

### 参考

- [Jev — TypeSafe AI](https://jevai.net/)
- [AI model "Jev" to make machines decide faster — heise online](https://www.heise.de/en/news/AI-model-Jev-to-make-machines-decide-faster-11457071.html)
- [What Is Jev AI? A Practical Guide — Hugging Face blog](https://huggingface.co/blog/sora-2/what-is-jev-ai-a-practical-guide-to-system-one-and)
- [Jev AI Review: Decision Models for Agent Workflows — Wavect](https://wavect.io/blog/jev-ai-decision-model-review/)

</div>

<div class="lang-block lang-ja" lang="ja" hidden markdown="1">

9 月 15 日、TypeSafe AI というスタートアップがステルスを抜けて **Jev** を発表しました。「最初の *System One モデル*」だそうです。CEO の Diogo Almeida は元 OpenAI の研究者で InstructGPT 論文の共著者、会社は 4,000 万ドルのシードラウンドを調達しています。Jev はホスト型 API のアーリーアクセスで提供されています。

打ち出し方が変わっているので、この一週間、新しいカテゴリなのか、よくできた分類器なのかを考えていました。答えは「両方」で、面白いのはランディングページに書かれていない部分です。

## 何をするのか

Jev は文章を一切書きません。コンテキスト（state）と、型の付いた問いを一つ以上渡すと、その型の値が返ってきます。

- **choice**――リストから一つを選び、すべての選択肢の確率と確信度を付ける
- **score**――決められた尺度での値と確率
- **yes/no**――0 から 1 の確率

同じ state に対する複数の問いは **一度の並列パスでまとめて** 答えます。TypeSafe の公表値は、エンドツーエンドで **70〜500 ms**、**入力 100 万トークンあたり 0.042 ドル**、出力は無料、この種のタスクでは「最先端 LLM より 40〜200 倍速い」。学習手法は **RLCD（Reinforcement Learning for Calibrated Decisions）** で、Jev が 95% と言えば 95% の確率で正しい、という状態を目指しています。画像・音声・動画の入力にはまだ対応していません。

<figure class="post-figure">
{% include figures/jev-architecture.svg id="ja" %}
<figcaption>私ならこう位置づける：各ケースをコード・LLM・人に振り分ける高速な判断レイヤー。</figcaption>
</figure>

## 主張を丁寧に読む

**「ハルシネーションゼロ」** は構造上は正しいものの、少し誤解を招きます。存在しない選択肢は出せないのでスキーマは壊れませんが、*間違った*選択肢は選べます。型付きの出力がなくすのは形式の誤りで、判断の誤りではありません。

**ベンチマークの基準は LLM。** heise によれば、TypeSafe の評価の参照ラベルは GPT-6 Astra と Claude Fable 5.1 の回答の平均です。Wavect のレビューも「444.6 倍安い」がベンダー自身の 4 つのワークフローでの数字だと指摘しています。つまり Jev は、うまくいって「最先端 LLM と同じ判断を、ごく一部の遅延とコストで出すモデル」。これは価値がありますが、蒸留の経済学であって、LLM より*正しい*という主張ではありません。

**本当の製品はキャリブレーション。** 9 割当たるルーターは役に立ちます。*どの 1 割に自信がないかを分かっている*ルーターは、はるかに役に立ちます。その 1 割だけを別の経路に回せるからです。それが RLCD の約束であり、自分で確かめる必要がある主張でもあります。キャリブレーションは測定した分布の上でしか成り立たないからです。

<figure class="post-figure">
{% include figures/calibration.svg %}
<figcaption>「キャリブレーションされている」とはこういうこと。しきい値を信じる前に、自分のトラフィックでこの図を描くこと。</figcaption>
</figure>

## どこに置くか：エージェントの中の小さな判断

[ハーネスの比較](/posts/2026/09/agent-harness-comparison/)で、エージェントの差はいまやハーネスに出ると書きました。どのハーネスの中にも、タスクごとに何十もの小さな判断があります。どのツールを使うか、再試行するか、このステップは失敗か、人に聞くか、この出力を見せてよいか。今それらは、ハードコードされたルールか、数秒かかって本題と同じくらいコストのかかるもう一回の LLM 呼び出しのどちらかです。

Jev が狙うのはその隙間です。**反射は System 1、思考は System 2、ルールはコード。** 堅実なのは（Wavect の推奨でもありますが）、計算・権限・副作用はコードに残し、まずシャドーモードで既存のロジックと並走させ、確信度のしきい値はリスクごとに決めることです。FAQ の振り分けミスと返金判断のミスに同じ基準は要りません。

## 自分の研究とのつながり

大学院では階層的な感情ラベルを研究していました。*joy* の例を *amusement* と予測するのは、*sadness* と予測するより小さな誤りです（[EEMD](/publications/)）。ルーティングも同じ構造を持っています。請求の問い合わせを*返金*キューに回すのは惜しい誤りですが、*セキュリティ*に回すのはそうではありません。

最上位の選択肢しか返さないモデルでは、これを活かせません。**すべての選択肢にキャリブレーションされた確率**を返すモデルなら活かせます。最も確率の高い選択肢を取るのではなく、ラベルの階層から作ったコスト行列を使って **期待コストが最小** のものを選ぶのです。

| 選択肢 | Jev の確率 | 正解が*請求*のときのコスト | *返金*のとき | *セキュリティ*のとき | **選んだときの期待コスト** |
|---|---|---|---|---|---|
| 請求 | 0.46 | 0 | 1 | 4 | **0.96** |
| 返金 | 0.40 | 1 | 0 | 4 | **1.02** |
| セキュリティ | 0.14 | 4 | 4 | 0 | **3.44** |

*（例示用の数字です。）* 「請求」と「返金」は近いので、どちらを選んでも期待コストは小さい。一方、自信ありげに見えて実は誤った「セキュリティ」への飛躍は高くつきます。これが成り立つのは確率が額面どおりの意味を持つときだけで、それこそ TypeSafe が売っている性質です。

## 気になっている点

- **今はホスト型のみ。** プライベート AI の仕事で最初に聞かれるのは、データがどこへ行くかです。小さく速い判断モデルはオンプレミスで動かすのに理想的なはず（NIM のようなコンテナに収まりやすい負荷です）。それが出るまでは、規制業種の顧客はチケットを流さないでしょう。
- **数値に弱い。** 日付、価格、正確な計算は用途外です。
- **敵対的な入力。** state は利用者の書いた文章です。サポートチケットを振り分ける判断モデルは、特定の窓口に回されたい人の攻撃対象にもなります。
- **確信度は許可ではない。** 99% 確かでも、許可されたことにはなりません。

Jev は、私がしばらく考えていたことの上に作られた最初の製品のように感じます。本番環境の「AI による判断」の多くは*生成*されるべきではなく、既知の集合から素早く*選ばれ*、正直な確率が添えられるべきだ、という考えです。

### 参考

- [Jev — TypeSafe AI](https://jevai.net/)
- [AI model "Jev" to make machines decide faster — heise online](https://www.heise.de/en/news/AI-model-Jev-to-make-machines-decide-faster-11457071.html)
- [What Is Jev AI? A Practical Guide — Hugging Face blog](https://huggingface.co/blog/sora-2/what-is-jev-ai-a-practical-guide-to-system-one-and)
- [Jev AI Review: Decision Models for Agent Workflows — Wavect](https://wavect.io/blog/jev-ai-decision-model-review/)

</div>
