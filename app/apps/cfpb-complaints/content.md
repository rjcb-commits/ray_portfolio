# CFPB Consumer Complaints Dashboard

> Tableau dashboard built on the public CFPB Consumer Complaint Database. Surfaces the products, issues, and companies driving consumer financial complaints from 2012 to present.

**[View the live dashboard →](https://public.tableau.com/views/REPLACE_WITH_PUBLIC_URL)** _(coming soon — currently building)_

---

## Why I built it

I work consumer dispute analytics at a top-10 US bank. The bank-internal disputes I handle are the volume that *doesn't* escalate to the CFPB. This dashboard surfaces what does — the products and complaint types that drive regulatory escalation, and how outcomes vary by company.

Electronic-fund-transfer complaints (the ones that map to my Reg-E modeling work at the bank) have grown sharply since 2018. The dashboard makes that trend explicit and provides a public-data complement to the internal volume I see day to day.

---

## What's in the dashboard

- **Headline metric** — total complaints in the selected period with year-over-year trend
- **Volume over time** — monthly time series, with overlay support for comparing 2-3 specific companies
- **Top issues** — sorted bar chart of complaint sub-issues, filterable by product
- **Geographic distribution** — state-level choropleth, normalized per 100K population so it surfaces real patterns rather than just population effects
- **Resolution outcomes** — stacked bar by company showing the fraction of complaints closed with monetary relief, non-monetary relief, or explanation only

Filter strip at the top: date range, product, company, state.

---

## Data

Source: [CFPB Consumer Complaint Database](https://www.consumerfinance.gov/data-research/consumer-complaints/), the federal regulator's public-record database of every consumer complaint filed against a US bank since 2012.

Roughly 5 million complaints in the full file. The dashboard uses a 5-year window (~2 million complaints) for performance.

---

## Stack

| Layer | Tool |
|---|---|
| Data prep | Python (pandas, pyarrow) |
| Storage | Parquet for Tableau, CSV for inspection |
| Dashboard | Tableau Public Desktop |
| Hosting | Tableau Public (free public hosting) |

---

## Source

Repo: [github.com/rjcb-commits/cfpb-complaints-dashboard](https://github.com/rjcb-commits/cfpb-complaints-dashboard)
