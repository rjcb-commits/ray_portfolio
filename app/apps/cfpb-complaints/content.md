# CFPB Consumer Complaints Dashboard

> Five years of CFPB data on payment-product complaints. P2P / money-transfer disputes close with monetary relief at a fraction of the rate card disputes do, and they sit below every card product in every year of the window.

**[View the live dashboard →](https://public.tableau.com/app/profile/raymond.jack6785/viz/CFPBP2PResolutionGap/CFPBP2PComplaints)**

---

## The finding

Pooled across the full window, P2P / money-transfer disputes close with monetary relief 4.96% of the time. Credit card sits at 14.5%, debit at 18.0%, prepaid at 23.0%.

One caveat belongs right next to that headline. The 4.96% is a pooled rate, and a single quarter (Q1 2025, covered below) supplies 42.8% of the entire P2P denominator. Drop that quarter and P2P pools to 8.07%; a typical quarter in the window runs 6-9%. So 4.96% is arithmetically correct for the five years as a whole, but it is not the rate a P2P complaint faced in an ordinary quarter.

The gap is robust to that correction. Year by year, P2P is below every card product in the window without exception:

| Year | P2P | Credit | Debit | Prepaid |
|---|---|---|---|---|
| 2021 | 12.3% | 16.9% | 22.2% | - |
| 2022 | 9.2% | 18.6% | 19.1% | - |
| 2023 | 7.6% | 15.4% | 18.4% | 35.6% |
| 2024 | 8.5% | 13.2% | 18.7% | 26.7% |
| 2025 | 2.4% | 12.6% | 15.9% | 14.9% |

Every rate drifts down over the period, P2P included. P2P remains the lowest-rate group in every year shown.

A regulatory floor is part of the story, though that part is domain context rather than something this dashboard demonstrates. P2P transfers fall under Reg E, which gives consumers narrower recourse on authorized transactions than Reg Z gives card users. The complaint data shows the outcome, not the mechanism.

What the data does show is that the spread inside the P2P category is very wide. The bottom of the company chart is P2P-native platforms that almost never close a complaint with monetary relief: Early Warning Services / Zelle at 0.00% across 21,527 complaints, Robinhood at 0.00% across 1,832, Block / Cash App at 0.04% across 47,669. Traditional banks running smaller P2P volumes land higher: JPMorgan 4.7%, Wells Fargo 7.0%, Bank of America 20.0%. PayPal, also P2P-native, sits at 11.6%. So "P2P-native" alone does not predict the floor.

## The Cash App quarter

In Q1 2025, P2P complaint volume went from 4,597 the prior quarter to 58,903, a 12.8x jump in the category.

Two companies account for nearly all of it. Block went from 551 complaints in Q4 2024 to 35,262, a 64x increase, and 59.9% of the quarter's P2P total. All 35,262 closed with explanation; zero closed with monetary relief. Early Warning Services added 18,058 more (30.7% of the quarter), also entirely explanation-only.

The arithmetic of the rate drop is worth being precise about, because it runs the opposite way to the intuition. Monetary-relief outcomes did not fall. They rose, from 386 in Q4 2024 to 488 in Q1 2025. The rate fell from 8.40% to 0.83% because the denominator grew 12.8x while the numerator grew 1.3x.

On timing: in January 2025 the CFPB ordered Block to pay $120M+ in restitution and a $55M penalty over Cash App fraud handling. The order is a matter of public record and it lines up with the quarter. The complaint data alone cannot establish that the order caused the filings, and it says nothing about whether restitution under the order reached consumers. What it does show is that individual complaint outcomes in that quarter did not move: none of Block's 35,262 were closed with monetary relief.

## Why I built it

I work dispute analytics at a top-10 US bank, which is why the CFPB database interests me: it's the part of the dispute picture that's public. This dashboard looks at what gets escalated to the regulator, who it's filed against, and how it's recorded as closing. Building it on public data is the only way I can show this kind of work without anything internal leaving the building.

## What's in the dashboard

Four panels, single screen.

**Headline callout.** The 4.96% pooled number with a one-paragraph summary of the product comparison.

**Monetary relief rate by product.** Horizontal bars, P2P highlighted in red against the three card products in gray. Each bar is labelled with its complaint volume and relief rate.

**Quarterly trend.** Same color treatment, same four products, five years of quarters. End-of-line labels so the chart is readable without a legend.

**Top 10 P2P companies.** Scatter plot, complaint volume on the x-axis and relief rate on the y-axis. Dot size encodes volume. The three near-zero-relief platforms render in red. Block sits as a giant red dot at the bottom-right with an inline annotation on the 2025 enforcement context.

## Data and method

Source: [CFPB Consumer Complaint Database](https://www.consumerfinance.gov/data-research/consumer-complaints/), the federal regulator's public database of consumer complaints filed against US financial companies.

Window: 2021-04-27 through 2025-12-31. 493,454 complaints across the four product groups. (The underlying extract runs to April 2026; the dashboard filter stops at year-end 2025.)

A few definitional choices that matter:

**"Monetary relief"** is `Company response to consumer == "Closed with monetary relief"`. This is the company's own recorded response code. It is not a finding of what the consumer was legally owed, and it is not a full accounting of compensation, which can also arrive outside the complaint channel. Non-monetary relief and explanation-only outcomes don't count. This single field drives the entire dashboard.

**"P2P / money transfer"** is the CFPB product `"Money transfer, virtual currency, or money service"`. It is broader than peer-to-peer payments: it covers Cash App, Zelle, PayPal and Venmo, but also crypto exchanges, remittance and other money-service businesses. "P2P" is my shorthand for the category, not a precise description of it. It excludes bank-app-internal transfers between two accounts at the same bank.

**"Debit card / unauthorized"** isn't a native CFPB product; the CFPB doesn't break debit out, so this slice is mine. It is `"Checking or savings account"` filtered to two issue codes: the debit-specific `"Managing an account" / "Problem using a debit or ATM card"` (28,759 complaints), and the broader `"Problem with a lender or other company charging your account"` (28,124). The second is roughly half the slice and is not debit-card-specific, so read this group as unauthorized-charge complaints on deposit accounts rather than as a clean debit-card cut.

**"Credit card"** combines `"Credit card"` and the historical `"Credit card or prepaid card"` dual-label category. CFPB used the dual label through late August 2023 and standalone `"Prepaid card"` only appears from 2023-08-18. So prepaid is separable from Q3 2023 onward only; before that it is folded into the credit line. The four groups are not cleanly separated across the whole five years, which is why the prepaid row in the table above starts at 2023.

**Top 10 P2P companies** is computed inside a Tableau context filter. Without that, the Top-N filter ranks by overall complaint volume across all products, and legacy banks like JPMorgan dominate the list because of their mortgage and credit-card complaints. Promoting the Product filter to context makes the ranking P2P-native.

**The prepaid spike** in late 2023 / early 2024 is a company-composition effect. American Express supplied most of the monetary-relief records at the peak: in Q1 2024 the overall prepaid rate was 36.97%, and excluding Amex it was 13.39% (Q4 2023: 37.91% overall, 15.72% excluding Amex). What drove Amex's behavior in those quarters is not something the response data can identify. It is left unannotated on the chart because the product-level comparison doesn't depend on it; the explanation belongs here rather than on a panel about something else.

## What this doesn't show

Worth stating plainly, because the numbers invite over-reading:

- These are complaint counts, not transactions or customers. A relief rate among complaints filed does not estimate a platform's fraud rate or how often it reimburses customers overall.
- Companies self-report the response code. There is no independent verification in the dataset.
- Complaint volume reflects who files, which is shaped by publicity, prompting and platform size, not just underlying harm. The Q1 2025 spike is the clearest example.
- Nothing here isolates cause. The dashboard is descriptive: it shows what was filed, against whom, and how it was recorded as closing.

## Stack

| Layer | Tool |
|---|---|
| Data prep | Python (pandas, pyarrow) |
| Storage | Parquet for Tableau, CSV fallback |
| Dashboard | Tableau Public Desktop |
| Hosting | Tableau Public |

## Source

[github.com/rjcb-commits/cfpb_complaints_dashboard](https://github.com/rjcb-commits/cfpb_complaints_dashboard)
