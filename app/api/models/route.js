import { NextResponse } from 'next/server';
import { getModelCatalog } from '../../../lib/providers';
import { enrichRankings, INDEX_WEIGHTS } from '../../../lib/rankings';
import { sources } from '../../../data/models';
import { BENCHMARK_SNAPSHOT } from '../../../data/verified-benchmarks';

export const revalidate = 3600;

export async function GET() {
  const { models, status } = await getModelCatalog();
  const providerModels = models.filter(model => model.providers?.venice || model.providers?.morpheus);

  // First pass identifies evidence coverage without inventing missing values.
  // A primary Overall rank requires at least two independent capability sources
  // from Arena, Artificial Analysis and LLM Stats. One-source models remain
  // tracked in the provider catalog but cannot become INDEX #1 from one signal.
  const evaluated = enrichRankings(providerModels).map(({ evaluationState, ...model }) => model);
  const rankCandidates = evaluated.filter(model => model.coverage?.independentSources >= 2);

  // Recompute percentiles/ranks only inside the defensible ranked population.
  const ranked = enrichRankings(rankCandidates).map(({ evaluationState, ...model }) => model);
  const rankedIds = new Set(ranked.map(model => model.id));
  const catalogOnly = evaluated
    .filter(model => !rankedIds.has(model.id))
    .map(model => ({
      id: model.id,
      name: model.name,
      providers: model.providers,
      providerIds: model.providerIds,
      evidenceSources: model.coverage?.independentSources ?? 0,
      publishedRanks: model.publishedRanks,
    }));

  return NextResponse.json({
    updated: '2026-09-16',
    status,
    models: ranked,
    catalogOnly,
    sources,
    benchmarkSnapshot: BENCHMARK_SNAPSHOT,
    methodology: {
      defaultView: 'evidence-qualified-overall-index',
      population: 'Text models available through Venice and/or Morpheus with usable Overall results from at least two independent sources among Arena, Artificial Analysis and LLM Stats.',
      qualification: 'At least two independent Overall sources are required for a primary INDEX rank. One-source and zero-source models remain tracked as catalog/provisional entries and receive no primary Overall rank.',
      normalization: 'Published Arena, Artificial Analysis and LLM Stats measurements are converted to 0-100 percentiles within the evidence-qualified provider-model population for that same source, then combined with the stated weights.',
      missingEvidence: 'Missing benchmark measurements are not imputed. The composite is renormalized across measurements that actually exist; evidence coverage shows how much of the intended source weight is present.',
      catalogOnly: 'Provider models that do not meet the two-source Overall evidence threshold remain in catalogOnly and are not rendered as ranked cards.',
      weights: INDEX_WEIGHTS,
      publishedEvidence: 'Native source scores and ranks remain visible with direct source links. Class-scoped ranks are not presented as global ranks.',
      provenance: 'Third-party, developer-reported and pending results are identified separately so users can judge evidence strength.',
      metrics: {
        overall: 'Arena + Artificial Analysis + LLM Stats; minimum two independent sources',
        reasoning: 'LLM Stats reasoning + Artificial Analysis + GPQA; available evidence only',
        coding: 'Kilo + LLM Stats coding + Terminal-Bench + SWE-bench Pro; available evidence only',
        agent: "LLM Stats agent + Agents' Last Exam + AutomationBench + OSWorld; available evidence only",
        value: '70% overall capability + 30% affordability',
        affordability: 'Blended provider token cost, lower is better',
        context: 'Published context window, larger is better',
      },
    },
  });
}
