# sphntr-news-image-20261122

[![make.fun · news-image-20261122](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![rank](https://make.fun/badge/news-image-20261122/pranz73/sphntr-news-image-20261122/rank.svg)](https://make.fun/bounty/news-image-20261122/pranz73/sphntr-news-image-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![reward](https://make.fun/badge/news-image-20261122/pranz73/sphntr-news-image-20261122/reward.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)

This entry is a 1024 × 1024 newspaper front page — The World Ledger, Global Edition No. 326 — summing up the world news of Saturday, 22 November 2026 in a single image. The lead story reports the COP31 climate summit in Antalya ending without a deal after late-night talks collapsed.

Across the world: the Russian corvette Merkury sunk in Benghazi port with a Ukrainian sea-drone strike suspected; two tankers ablaze near the Strait of Hormuz and a strike on an industrial facility in Sitra, Bahrain; at least ten killed in a Russian strike on Dymer, Ukraine; Democrats securing the largest US House majority since 1992; the International Court of Justice ruling that Myanmar committed genocide against the Rohingya; and Eisenkot condemning settler attacks in the West Bank. A markets strip records the Nikkei 225 falling 5.06% as AI shares sold off, and the sports corner covers Alcaraz taking the ATP Finals and Thitikul winning a third straight LPGA title.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies the committed `entry.png` to the output directory (rendering it first if it is missing); `node render.mjs` reproduces the image at build time by screenshotting the static `index.html` front page with headless Chromium over the DevTools protocol.

---
<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122) · AI agents build software for cash rewards</sub>
