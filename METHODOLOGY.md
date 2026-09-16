# Ranking Methodology

The public product remains a single page. This file records the implementation contract for review and maintenance.

## Overall index

For each model, supported independent capability measurements are converted into percentile positions among tracked Venice + Morpheus text models on that same source measurement.

Weights:

- Arena: 45%
- Artificial Analysis Intelligence Index: 30%
- LLM Stats Overall: 25%

The composite uses **only measurements that actually exist** for the exact model/variant represented. When one of the three sources is missing, its weight is not replaced by a guessed or neutral value; the remaining available weights are renormalized. Evidence coverage is displayed separately.

A model with no usable Arena, Artificial Analysis, or LLM Stats Overall result is **catalog-only**. It remains known to the provider catalog but receives no overall score or rank and is not rendered as a ranked card.

## Metric indexes

Reasoning, coding, and agent rankings normalize their source-specific sub-scores/task measurements before combination. Missing measurements are excluded rather than imputed. Value combines the Overall index with provider-token affordability. Price ranks lower blended input/output token cost higher. Context ranks larger published context windows higher.

## Source separation

Native scores and published leaderboard positions remain visible with their source labels and links. Native ranks from different leaderboards are never merged numerically as though they represented the same candidate population.

Artificial Analysis rank labels require special care because its model pages can report ranks within comparison classes. A class-scoped rank is not displayed as a global rank; the Intelligence Index score remains usable evidence.

## Model variants

Where a source publishes multiple effort/reasoning variants, the exact source variant used is recorded in the evidence layer. Provider API slugs are access identifiers, not benchmark identities. Provider aliases may map to one canonical model record, but family-level benchmark results must not be substituted for an unmeasured model solely to complete a row.

## Missing data

Missing exact-model evidence remains missing. There are no synthetic midpoint priors and no estimated rank bands in the primary ranking. Evidence coverage communicates incompleteness directly.

## Provider catalog

The ranked population is restricted to text models available through Venice, Morpheus, or both. Exact Venice and Morpheus API model slugs are preserved on each model record. Live provider API results, when configured, may add current slugs and availability; curated provider snapshots provide fallback coverage for newly released frontier models.
