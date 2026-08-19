# LLM Index

A compact ranking tool for **text models available through Venice and Morpheus**.

LLM Index brings model capability, reasoning, coding, agent performance, value, price and context into one page so users do not have to compare several provider dashboards and benchmark sites manually.

## Ranking views

Models can be ranked by:

- Overall
- Reasoning
- Coding
- Agents
- Value
- Price
- Context

## How the ranking works

Different benchmark sites use different score scales and model populations. LLM Index converts each result to a percentile among the models tracked here before combining them.

The Overall ranking uses:

- **45% Arena**
- **30% Artificial Analysis**
- **25% LLM Stats**

When a benchmark result is unavailable, that part of the score uses a neutral midpoint instead of treating the model as if it failed the benchmark. Evidence coverage shows how much published data is currently available for each metric.

Arena, Artificial Analysis, LLM Stats and other external results are also shown directly so users can compare the LLM Index ranking with the underlying published measurements.

Reasoning, Coding and Agents use their relevant benchmark results. Value combines capability with token affordability. Price and Context use provider/model information.

## Sources and uncertainty

The interface links directly to sources including:

- Arena
- Artificial Analysis
- LLM Stats
- Kilo
- Venice models and pricing
- Morpheus models and pricing
- official model documentation
- model cards and Hugging Face pages when available

If a result is not available, it is shown as pending. When enough data exists to make a useful estimate, the interface may also show an estimated rank range. A wider range indicates more uncertainty.

Third-party, developer-reported and estimated results are identified separately so users can see what kind of evidence supports each claim.

## Data flow

`provider catalogs → model matching → benchmark and model information → normalized metrics → rankings`

Provider availability can be refreshed from Venice and Morpheus APIs when credentials are configured. The repository also includes the benchmark and model information used by the public index.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add provider API keys to enable live provider-catalog updates.
