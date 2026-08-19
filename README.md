# LLM Index

A compact ranking tool for **text models available through Venice and Morpheus**.

The product is intentionally narrow: one page that helps users understand, rank, and compare the text-model catalogs exposed by those two providers without hunting across provider dashboards and unrelated benchmark sites.

## Ranking views

The same tracked model set can be ranked by:

- Overall
- Reasoning
- Coding
- Agents
- Value
- Price
- Context

## Ranking method

The site owns one transparent normalized ranking instead of mixing unrelated external leaderboard rank numbers.

For the Overall index, available measurements are percentile-normalized within the tracked Venice + Morpheus model set and combined as:

- **45% Arena**
- **30% Artificial Analysis**
- **25% LLM Stats**

Missing measurements use a neutral prior rather than being treated as zero. Evidence coverage remains visible so a sparse model is distinguishable from a well-measured one.

External leaderboard ranks and scores remain source-native evidence. They are displayed with direct links and are not treated as if Arena #10, LLM Stats #10, and another source's #10 describe the same population or scale.

Task-specific views use their relevant available signals, including LLM Stats sub-scores, Kilo, and sourced task benchmarks. Price and context views use provider/model metadata.

## Evidence and provenance

The interface links directly to tracked sources including:

- Arena
- Artificial Analysis
- LLM Stats
- Kilo
- Venice models and pricing
- Morpheus models and pricing
- official model announcements and Hugging Face/model cards when available

Exact-model measurements remain missing when they have not been sourced. Family-level proxy values are not substituted simply to fill cells.

## Data architecture

`provider catalogs → canonical model aliases → reviewed research metadata → source-specific normalization → metric rankings`

Provider availability can be overlaid from live Venice and Morpheus APIs when credentials are configured. The checked-in research snapshot remains reviewable and source-linked.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add provider API keys to enable live provider-catalog overlays.
