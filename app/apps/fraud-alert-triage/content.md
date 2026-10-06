# Fraud Alert Triage: Ranking, Reviewers & a Guardrailed AI Assistant

> 30,622 bank account-opening fraud alerts. Working the queue in risk-score order turns a 12% hit rate into 74% at the top. Fifty reviewers looking at the same alerts range from 33% to 96% accuracy. And a local AI assistant drafts investigator notes, with guardrails in code that kept invented facts away from every reviewer.

**[View the live dashboard →](https://public.tableau.com/app/profile/ray.jack/viz/FraudAlertTriage/1-Queue)**

---

## The findings

### 1. Ranking the queue matters, and capacity is the real lever

Of 30,622 alerts, 12.1% are fraud. An investigator who works them in risk-score order finds:

| Alerts reviewed per day | Share that is fraud (risk-ranked) | Random order |
|---|---|---|
| 100 | 74% | 12% |
| 500 | 53% | 12% |
| 2,000 | 37% | 12% |

The top 100 are about 6x richer in fraud than random order. But the score distribution hides a catch: **two-thirds of all the fraud sits in alerts scoring under 0.2**, where only 7-13% of cases are fraud. High scores are dense with fraud; low scores hold most of it. "Only work the high scores" misses most of the losses, so the real decision is how deep the team can go with the capacity it has.

### 2. Same alerts, 50 reviewers, wildly different calls

The dataset includes the decisions of 50 synthetic analysts on every alert. Accuracy runs from **33% to 96%**, average 71%.

- The most accurate reviewer (96%) catches 79% of fraud and flags just **1.5%** of legitimate applicants.
- The reviewer who catches the most fraud (99%) also flags **45%** of legitimate applicants.
- The least accurate (33%) catches 99% too, but flags **76%** of good customers.

Plotted as fraud caught vs. good customers flagged, the trade-off every fraud team manages, losses vs. customer friction, shows up in one picture. Consistent case notes and clear reason codes are one way to narrow a spread like that.

### 3. An AI assistant that explains, not decides

A local LLM (Qwen 2.5 7B, running on a Mac mini through Ollama) drafts a short investigator note for each alert. The risk model sets priority; the AI only explains; a human decides.

On 250 cases (150 from the top of the queue plus 100 random):

- **98%** of AI notes passed every guardrail on the first try
- **0** invented facts reached an investigator
- **2%** fell back to a deterministic template instead of showing an unchecked note
- **4.4 seconds** per case, fully local; no application data leaves the machine

Example (case 935250, score 0.90, rank 3 in the queue):

> Flags: housing status BA; device OS windows; name and email don't match (similarity 0.03). *Start with Confirm email ownership: name and email don't match (similarity 0.03). Then Check for linked applications.*

## How the guardrails got there

The first version didn't work as well as it looked, and that turned out to be the most useful part of the project.

| Run | Design | Valid on first try | Fallback |
|---|---|---|---|
| 1 | Prompt-only rules; the AI writes the summary and sets priority | 89% | 2% |
| 2 | Added code checks for unsupported claims | 57% | 40% |
| 3 | AI narrowed to explaining; facts filled in by code; every number must exist in the case | **98%** | **2%** |

Run 1 looked fine on paper, but reading the output showed most summaries describing values as "low credit score" or "high limit", which the anonymized data can't support. The prompt told the model not to do that; it did it anyway. Run 2 enforced the rule in code, which caught it, and also caught the model copying numbers from the prompt's example into real cases.

The fix was architectural rather than better wording: take priority away from the model, show it only the score, rank and reason codes, fill the facts in with code, and let the AI write only a short "what to check first, and why" note that must be grounded in the case. **Enforce the rules in code instead of trusting the prompt.**

## Why I built it

I work dispute and fraud-adjacent analytics at a top-10 US bank: monitoring dispute abuse, measuring controls, prioritizing review work. Fraud operations teams are now asking a new question: where can AI take manual work off investigators without creating new risk? This project is my answer on public data. It shows the queue math, the reviewer trade-off, and what it takes to put an LLM in front of an investigator responsibly: grounding, validation, fallbacks, and an audit trail.

## What's in the dashboard

Three pages, with navigation buttons.

**Queue.** Fraud share at each daily review capacity, worked in risk-score order, against a dashed 12% random-order baseline. KPI tiles: 30,622 alerts, 74% fraud in the top 100, 6x better than random.

**Reviewers.** Fifty analysts as bubbles: false alarms (good customers flagged) on the x-axis, fraud caught on the y-axis, color and size by accuracy. The most accurate, the highest-catching and the least accurate reviewers are called out.

**AI Triage.** KPI tiles for the guardrail results, an investigator queue showing top-scored alerts with their AI notes and actual outcomes, and the three design runs side by side.

## Data and method

Source: **FiFAR (Financial Fraud Alert Review)** on figshare (CC BY), built on Feedzai's **Bank Account Fraud (BAF)** suite (NeurIPS 2022): 1 million synthetic bank account-opening applications generated from real data, of which 30,622 were flagged by an alert model and reviewed by 50 synthetic analysts.

**Scoring and reason codes.** I trained an XGBoost model on months 0-2 (397,039 applications, never the alert months) and computed per-case reason codes from TreeSHAP contributions, translated into plain language ("name and email don't match (similarity 0.03)", "device used with 2 different emails in 8 weeks"). My model did **not** beat the dataset's own alert score inside the alert set (AUC 0.659 vs 0.677), so the queue ranks by the provided score and uses my model for the explanations.

**Guardrails.** Fixed JSON schema with one retry and a deterministic fallback; every cited signal must match the case's own reason codes; every number in a note must appear in the case data; pattern checks block value judgments on anonymized fields; actions come from an approved list, and "approve" can't be combined with investigation steps; priority always comes from the risk model. Every call is logged with input, prompt hash, model, raw output, validation result, status and the human decision.

## What this doesn't show

- The applications and the analysts are synthetic. The patterns are realistic; the people aren't real.
- Several fields are anonymized codes (housing status "BA", for example), so some reasons read as codes rather than plain language.
- The 7B model's notes are formulaic and sometimes pair a check with a flag imprecisely. A larger model or a fixed flag-to-check mapping would improve this.
- The AI evaluation covers 250 cases, not the full alert set, and a synthetic analyst stands in for the human reviewer.

## Stack

| Layer | Tool |
|---|---|
| Data prep and modeling | Python (pandas, DuckDB, XGBoost, scikit-learn) |
| Local LLM | Ollama, Qwen 2.5 7B |
| Dashboard | Tableau Public Desktop |
| Hosting | Tableau Public, GitHub |

## Source

[github.com/rjcb-commits/fraud_alert_triage](https://github.com/rjcb-commits/fraud_alert_triage)
