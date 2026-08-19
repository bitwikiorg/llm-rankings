# LLM Index PRD

## Goal

Give users one compact place to rank and understand text models available through Venice and Morpheus.

## User problem

Provider catalogs expose model availability and pricing unevenly, while capability evidence is scattered across independent benchmark sites. Comparing models requires unnecessary cross-site research and incompatible rank scales are easy to misread.

## Product

A single-page ranking surface that:

- tracks Venice and Morpheus text models;
- owns one transparent normalized rank for the selected metric;
- supports Overall, Reasoning, Coding, Agents, Value, Price, and Context views;
- exposes provider availability and pricing;
- displays source-native benchmark evidence without conflating rank scales;
- links directly to benchmark, provider, official model, and model-card sources;
- expands each model in place for technical context and references.

## Ranking principle

Normalize comparable source measurements into an explicit site index. External leaderboard positions are evidence, not interchangeable positions in the site ranking.

Missing evidence is uncertainty, not failure: do not convert absence into zero or use family-level proxy measurements merely to fill cells.

## Interface constraints

- one product page;
- ranking first;
- high legibility at dense information levels;
- minimal decorative chrome;
- mobile-safe;
- references reachable from the ranking surface;
- methodology visible on the same page.
