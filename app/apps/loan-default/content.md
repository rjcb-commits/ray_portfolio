# Loan Default Predictor

> LightGBM model that estimates default probability for Lending Club personal loans, with a live Streamlit app you can poke at.

**[Try the live demo →](https://loandefaultpredictor-rayjackcb.streamlit.app)**

---

## Why I built it

Most of my professional ML work is on regulated banking data and can't go on a portfolio. This project rebuilds the same shape of problem on a public dataset: tabular credit features at origination, gradient-boosted tree, binary default outcome.

---

## Stack

| Layer | What |
|---|---|
| Language | Python 3.12 |
| Modeling | LightGBM 4.5 |
| Tooling | scikit-learn, pandas, numpy |
| App | Streamlit |
| Hosting | Streamlit Community Cloud |

---

## The dataset

Lending Club's accepted-loans dataset on Kaggle. About 2.2M approved loans from 2007 through 2018 Q4, with final outcomes and the features that were known at origination. Roughly 80% paid off, 20% charged off.

---

## Feature engineering

The whole project lives or dies here.

**The leakage trap.** Lending Club's data includes columns like `total_pymnt`, `recoveries`, `last_pymnt_d`, `out_prncp`. These only get populated *after* a loan defaults. Leave them in and the model just reads them off, "predicts" 0.99 AUC, and is completely useless on a real loan that hasn't defaulted yet. Dropping them before the model ever sees the data is the single most important thing the training script does.

**Filter to settled loans.** `Current` and `In Grace Period` rows go in the bin. We don't know yet what happened to them, so they're noise.

**Parse the text-encoded numerics.** Lending Club stores `term` as `"36 months"`, `int_rate` as `"13.5%"`, `emp_length` as `"10+ years"`. Cast to numbers up front.

**Twenty features kept**, all known at origination: loan amount, term, interest rate, FICO range, DTI, employment length, home ownership, purpose, state, and the usual credit-history columns.

**Subsample to 10%.** Around 135K rows is more than enough. Full data trains ten times slower and the AUC barely budges.

---

## Modeling

LightGBM classifier, 500 trees, learning rate 0.05, num_leaves 63, early stopping on validation AUC. Categoricals (term, grade, home ownership, verification status, purpose, state) go in raw — LightGBM handles them natively, no one-hot, no target encoding. 80/20 train/test split, stratified.

### Results

| Metric | Value |
|---|---|
| AUC | 0.714 |
| Accuracy at 0.5 threshold | 0.804 |
| Test set size | 26,907 |
| Default rate (test) | 19.96% |

0.714 AUC is right where the published Lending Club work lands (0.70–0.75 is the usual range). If I were getting 0.85+ I'd assume I missed a leakage column and start over.

### Plots

<p align="center">
  <img src="/apps/loan-default/roc.png" width="48%" alt="ROC curve">
  <img src="/apps/loan-default/confusion.png" width="48%" alt="Confusion matrix">
</p>

<p align="center">
  <img src="/apps/loan-default/importance.png" width="80%" alt="Top 20 features by importance">
</p>

---

## About that importance chart

`addr_state` looks like the top feature. It's not, really. That's a known quirk where LightGBM's gain importance overcounts high-cardinality categoricals. With 50 states the model gets a lot of splits from that one feature, and gain just adds them all together. SHAP values would give a more honest per-prediction story. On the list.

---

## Source

[github.com/rjcb-commits/loan_default_predictor](https://github.com/rjcb-commits/loan_default_predictor)
