# CFPB Consumer Complaints Dashboard

> Five years of CFPB data on payment-product complaints. P2P / money-transfer disputes close with monetary relief at a fraction of the rate card disputes do, and the gap doesn't budge.

**[View the live dashboard →](https://public.tableau.com/app/profile/raymond.jack6785/viz/CFPBP2PResolutionGap/CFPBP2PComplaints)**

---

## The finding

P2P / money-transfer disputes close with monetary relief 4.96% of the time. Credit card sits at 14.5%, debit at 18.0%, prepaid at 23.0%. That gap has been roughly the same for five years and isn't trending toward closure.

Part of it is regulatory. P2P transfers live under Reg-E, which gives consumers narrower chargeback rights for authorized transactions than Reg-Z gives card users. So the floor is lower by design. But the floor doesn't fully explain the gap. The bottom of the company chart is dominated by P2P-native platforms (Block / Cash App, Early Warning Services / Zelle, Robinhood) that effectively never resolve a complaint with monetary relief, while traditional banks running smaller P2P volumes resolve at 5-25%.

## The Cash App quarter

Q1 2025 P2P volume jumped 13x, from ~4,200 per quarter to 58,903. The trigger is on the record: in January 2025, the CFPB ordered Block to pay $120M+ in restitution and a $55M penalty over Cash App fraud handling. Consumers piled in with grievances they hadn't surfaced before. Block alone was 60% of the quarter's P2P complaints and closed 99% of them with explanation only.

The restitution flowed through the enforcement order. Individual complaint outcomes didn't move. That asymmetry is the whole story for Block in one chart.

## Why I built it

I work dispute analytics at a top-10 US bank. The disputes I handle internally are the ones that *don't* make it to the CFPB. This dashboard is the other side of that funnel: what does escalate, who it's filed against, and how it ends. Building it on public data is the only way I can show this kind of analytical work without anything internal leaving the building.

## What's in the dashboard

Four panels, single screen.

**Headline callout.** The 4.96% number with a one-paragraph takeaway. The hook.

**Monetary relief rate by product.** Horizontal bars, P2P highlighted in red against the three card products in gray. Vertical reference line at the credit-card rate as the benchmark.

**Quarterly trend.** Same color treatment, same four products, five years of quarters. End-of-line labels so the chart is readable without a legend.

**Top 10 P2P companies.** Scatter plot, complaint volume on the x-axis and relief rate on the y-axis. Dot size encodes volume. The three zero-relief platforms render in red. Block sits as a giant red dot at the bottom-right with an inline annotation explaining the 2025 enforcement context.

## Data and method

Source: [CFPB Consumer Complaint Database](https://www.consumerfinance.gov/data-research/consumer-complaints/), the federal regulator's public database of every consumer complaint filed against a US bank since 2012.

Window: April 2021 through December 2025. ~493K complaints across the four product categories.

A few definitional choices that matter:

**"Monetary relief"** is `Company response to consumer == "Closed with monetary relief"`. Non-monetary relief and explanation-only outcomes don't count. This is the single field that drives the entire dashboard, so it's worth being precise.

**"P2P / money transfer"** is the CFPB product `"Money transfer, virtual currency, or money service"`. That category mostly captures Cash App, Zelle, PayPal, Venmo, and the crypto exchanges; it doesn't capture bank-app-internal transfers between two checking accounts at the same bank.

**"Debit card / unauthorized"** isn't a native CFPB product. It's a calculated subset of `"Checking or savings account"` complaints filtered to debit/ATM-card-specific issue codes. The CFPB doesn't break debit out as its own product, so this slice is mine.

**"Credit card"** combines `"Credit card"` and the historical `"Credit card or prepaid card"` dual-label category, which CFPB used until late 2023.

**Top 10 P2P companies** is computed inside a Tableau context filter. Without that, the Top-N filter ranks by overall complaint volume across all products, and legacy banks like JPMorgan dominate the list because of their mortgage and credit-card complaints. Promoting the Product filter to context makes the ranking P2P-native.

The prepaid line shows a clear spike in late 2023 / early 2024. That's American Express resolving a wave of Serve and Bluebird wind-down complaints with monetary refunds, not a regulatory event. I left it visible without an annotation because the dashboard's main story doesn't depend on it, and an interviewer asking "what's that bump?" is a feature, not a bug.

## Stack

| Layer | Tool |
|---|---|
| Data prep | Python (pandas, pyarrow) |
| Storage | Parquet for Tableau, CSV fallback |
| Dashboard | Tableau Public Desktop |
| Hosting | Tableau Public |

## Source

[github.com/rjcb-commits/cfpb_complaints_dashboard](https://github.com/rjcb-commits/cfpb_complaints_dashboard)
