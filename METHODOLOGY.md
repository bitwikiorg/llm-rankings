# Ranking Methodology

The public product remains a single page. This file records the implementation contract for review and maintenance.

## Overall index

For each model, supported independent capability measurements are converted into percentile positions among tracked Venice + Morpheus text models on that same source measurement.

Weights:

- Arena: 45%
- Artificial Analysis Intelligence Index: 30%
- LLM Stats Overall: 25%

A missing measurement receives a neutral percentile prior of 50 for the composite rather than zero. Weighted evidence coverage is displayed separately.

## Metric indexes

Reasoning, coding, and agent rankings normalize their source-specific sub-scores/task measurements before combination. Value combines the Overall index with provider-token affordability. Price ranks lower blended input/output token cost higher. Context ranks larger published context windows higher.

## Source separation

Native scores and published leaderboard positions remain visible with their source labels and links. Native ranks from different leaderboards are never merged numerically as though they represented the same candidate population.

## Missing data

Missing exact-model evidence remains missing. Do not substitute family-level results solely to complete a row.
