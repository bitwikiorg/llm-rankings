# Ranking Audit

## Corrected structural errors

- External ranks from Arena, LLM Stats, and Artificial Analysis were previously eligible to become a shared primary ordering even though the leaderboards have different populations and scales.
- The interface previously exposed too many competing concepts: source rank, source score, grade, evidence state, price, and fallback logic without a clear hierarchy.
- References existed in the dataset but were not sufficiently prominent or directly useful from the ranking surface.
- Methodology occupied a separate page despite the product being most useful as a compact single-page tool.

## Current contract

- one normalized site rank per selected metric;
- source-native external evidence retained and linked;
- explicit evidence coverage;
- direct references in expanded model rows;
- one-page product surface;
- no provisional/fallback rank label.
