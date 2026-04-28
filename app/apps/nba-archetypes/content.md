# NBA Player Archetypes

> Cluster 322 NBA players on per-100-possession and advanced stats. Eight archetypes show up. None of them line up cleanly with the traditional PG / SG / SF / PF / C labels.

**[Try the live app →](https://nba-archetypes.streamlit.app/)**

---

## What the data shows

K-means on 11 features (shot mix, scoring efficiency, playmaking, rebounding split, defense, usage) finds eight distinct player types in the 2024-25 season:

| Archetype | n | Tells | Reps |
|---|---|---|---|
| Primary Star | 41 | Highest usage and FT rate, big assist + turnover load | Booker, Brown, Fox, Wagner |
| Secondary Creator | 47 | High 3PA with real playmaking, mid-tier usage | Beal, Murray, LeVert |
| Heavy-Usage PG | 30 | High passing volume, low efficiency, high TOV | Scoot Henderson, Cole Anthony |
| 3&D Wing | 80 | High 3PA, low usage, low TOV | Aaron Wiggins, Nickeil Alexander-Walker |
| Low-Efficiency Wing | 35 | Shoots threes at low percentages | Patrick Williams, Terry Rozier |
| Defensive Forward | 28 | Highest STL rate, high BLK, modest offense | Jaden McDaniels, Toumani Camara |
| Stretch Big | 38 | Mix of perimeter and interior, hybrid 4/5 | Bam Adebayo, Vučević |
| Rim-Protecting Big | 23 | Almost zero 3PA, elite efficiency at the rim, top BLK | Gobert, Poeltl, Edey |

Position labels hide most of this. Within "wing" alone there are four flavors. Within "big" there are two. The 3&D Wing cluster is the largest at 80 players, which says something about where the modern game has gone.

---

## Why I built it

I wanted an unsupervised project to round out a portfolio that was mostly classification and dashboards. NBA stats are public, the domain doesn't need explaining to anyone who has watched a game, and the result is something you can argue about over a beer.

---

## Method

- 11 features pulled from stats.nba.com via the `nba_api` package
- Features: 3PA per 100, FTA per 100, TS%, eFG%, AST per 100, TOV per 100, OREB%, DREB%, STL per 100, BLK per 100, USG%
- Filter to qualifying players: 30 games minimum, 15 MPG minimum. Drops random call-ups and end-of-bench guys whose stats are too noisy to cluster on.
- StandardScaler then K-means
- Searched K from 4 to 12 on silhouette + inertia. K=4 had the highest silhouette (0.20) but produced boring position-shaped clusters. K=8 (silhouette 0.15) gives the eight archetypes above, which actually mean something.

The silhouette tradeoff is worth naming. NBA players sit on a continuum, not in clean boxes. A guy halfway between Stretch Big and Defensive Forward doesn't fit either cleanly. Higher K gives lower silhouette but more useful archetypes. Picking K on interpretability beats picking it on the metric, at least for this data.

---

## Stack

| Layer | Tool |
|---|---|
| Data | nba_api (official stats.nba.com wrapper) |
| Modeling | scikit-learn (KMeans, StandardScaler, PCA) |
| App | Streamlit |
| Hosting | Streamlit Community Cloud |

I'd planned to scrape basketball-reference, but their site blocks datacenter IPs with a 403. nba_api turned out to be cleaner anyway.

---

## What's next

- Compare 2014 vs 2024 with the same features. That comparison is where the "positionless basketball" claim actually proves itself empirically.
- Try hierarchical clustering and DBSCAN. K-means assumes spherical clusters and player archetypes probably aren't spherical.
- Add a player similarity search (already in the Streamlit app: pick a player, see the five closest within their cluster).

---

## Source

Repo: [github.com/rjcb-commits/nba_archetypes](https://github.com/rjcb-commits/nba_archetypes)
