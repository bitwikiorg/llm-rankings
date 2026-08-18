# LLM Power Rankings

Research-backed text-model rankings for models available through **Venice** and **Morpheus**, designed for Vercel.

## What it does

- text models only
- S/A/B/C/D/U tier ranking
- compare up to four models
- provider filters for Venice and Morpheus
- release date, context, total/active parameters, openness/license, Hugging Face links
- serving quantization from the Venice model API when available
- curated open-weight checkpoint precision where confirmed
- provider pricing and capability metadata
- benchmark evidence from LLM Stats, Artificial Analysis, Arena, and KiloBench
- server-side live provider overlays when API keys are configured

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add provider API keys if you want live model-catalog overlays.

## Data architecture

`provider APIs -> canonical aliases -> curated research metadata -> benchmark normalization -> tier UI`

Provider availability is dynamic. Research metadata is deliberately reviewable and checked in rather than silently guessed.

See `/methodology` for ranking weights and provenance policy.
