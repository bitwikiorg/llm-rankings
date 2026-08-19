# LLM Index — Product Contract

## Purpose

A small, single-page ranking tool for understanding text models available through Venice and Morpheus.

## Invariants

1. One page.
2. One site-owned normalized rank per selected metric.
3. External leaderboard ranks remain labeled evidence, never interchangeable rank positions.
4. Every displayed evidence source must be directly followable when a source URL exists.
5. Missing measurements remain visible as missing; they are not silently replaced with family proxies or zeros.
6. Dense information must remain legible: model identity, rank, score, providers, core specs, price, evidence, and references have distinct visual hierarchy.
7. The default surface is a ranking tool, not a research essay or dashboard of decorative widgets.

## Primary ranking lenses

- Overall
- Reasoning
- Coding
- Agents
- Value
- Price
- Context

## Overall normalization

- Arena: 45%
- Artificial Analysis: 30%
- LLM Stats: 25%

Each source measurement is percentile-normalized over the tracked Venice + Morpheus model set. Missing measurements receive a neutral prior while evidence coverage remains explicit.

## Provenance

Provider documentation, benchmark leaderboards, official model announcements, and model cards/Hugging Face pages remain directly linked from the interface whenever available.
