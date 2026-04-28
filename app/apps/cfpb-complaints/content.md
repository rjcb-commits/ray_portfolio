# CFPB Consumer Complaints Dashboard

> Five years of CFPB complaint data show monetary relief converging across card products, but P2P sits structurally lower. The dashboard surfaces the gap, traces its persistence, and ranks the companies driving it.

**[View the live dashboard →](https://public.tableau.com/app/profile/raymond.jack6785/viz/CFPBP2PResolutionGap/CFPBP2PComplaints)**

---

## The finding

P2P / money-transfer disputes close with monetary relief just **4.96% of the time**. Credit card disputes resolve at 14.5%, debit at 18.0%, prepaid at 23.0%. The gap is not new and not closing. It has held for the full five years of data.

The mechanism is plausible. P2P transactions live under Reg-E (electronic fund transfers), which gives consumers narrower chargeback rights for authorized transfers than Reg-Z gives card users. The legal floor for relief is genuinely lower. But the gap is wider than that alone explains, and the bottom of the company-level chart is dominated by P2P-native platforms (Block / Cash App, Early Warning Services / Zelle, Robinhood) that resolve almost zero complaints with monetary relief.

---

## The Cash App anomaly

Q1 2025 P2P complaint volume surged 13x, from roughly 4,200 per quarter to 58,903. The cause was specific and on the record: in January 2025, the CFPB ordered Block to pay $120M+ in restitution and a $55M penalty for failing to investigate Cash App fraud. The action was widely reported and consumers flooded in with previously unsurfaced grievances. Block alone accounted for 60% of P2P complaints that quarter, and Block closed 99% of them with explanation only. The quarterly relief rate dropped to 0.8%.

Macro restitution flowed through the enforcement channel. Individual complaint outcomes did not move. That asymmetry is the point.

---

## Why I built it

I work consumer dispute analytics at a top-10 US bank. The bank-internal disputes I handle are the volume that *doesn't* escalate to the CFPB. This dashboard surfaces what does, with a focus on the products my Reg-E modeling work actually touches. Building it on public data lets me show the analytical thinking I apply at work without exposing anything internal.

---

## What's in the dashboard

Single-screen, four panels.

- **Headline callout** — the 4.96% number with a key-takeaway summary
- **Monetary relief rate by product** — horizontal bar chart, P2P highlighted in red, the three card products in gray
- **Monetary relief rate trend** — quarterly line chart over five years, same color treatment, with direct end-of-line labels
- **P2P-native platforms rarely give consumers their money back** — scatter of the top 10 P2P companies by complaint volume, dot size encoding volume, the three zero-relief outliers in red, an inline annotation explaining the Block / Cash App story

---

## Data and method

Source: [CFPB Consumer Complaint Database](https://www.consumerfinance.gov/data-research/consumer-complaints/), the federal regulator's public-record database of every consumer complaint filed against a US bank since 2012.

Window: April 2021 through December 2025. Roughly 493,000 payment-product complaints across the four product categories analyzed.

Definitions:
- **Monetary relief** = `Company response to consumer == "Closed with monetary relief"`. Excludes non-monetary relief and explanation-only outcomes.
- **P2P / money transfer** = CFPB product category `"Money transfer, virtual currency, or money service"`.
- **Debit card / unauthorized** = a calculated subset of `"Checking or savings account"` complaints filtered to debit/ATM-card-specific issue codes.
- **Credit card** combines `"Credit card"` and the dual-label `"Credit card or prepaid card"` category.
- **Top 10 P2P companies** computed within a context filter so the ranking is by P2P-only volume, not overall complaint volume (otherwise legacy banks dominate the ranking).

The prepaid product category shows a visible spike in late 2023 / early 2024. That is American Express resolving a wave of Serve and Bluebird wind-down complaints with monetary refunds, not a regulatory event. It is left visible without an annotation because the dashboard's narrative does not depend on it, and an interviewer asking "what's that?" is a feature, not a bug.

---

## Stack

| Layer | Tool |
|---|---|
| Data prep | Python (pandas, pyarrow) |
| Storage | Parquet for Tableau, CSV fallback |
| Dashboard | Tableau Public Desktop |
| Hosting | Tableau Public |

---

## Source

Repo: [github.com/rjcb-commits/cfpb-complaints-dashboard](https://github.com/rjcb-commits/cfpb-complaints-dashboard)
