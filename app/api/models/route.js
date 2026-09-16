import { NextResponse } from 'next/server';
import { getModelCatalog } from '../../../lib/providers';
import { enrichRankings, INDEX_WEIGHTS } from '../../../lib/rankings';
import { sources } from '../../../data/models';
import { BENCHMARK_SNAPSHOT } from '../../../data/verified-benchmarks';

export const revalidate = 3600;

export async function GET() {
  const { models, status } = await getModelCatalog();
  const providerModels = models.filter(model => model.providers?.venice || model.providers?.morpheus);
  const evaluated = enrichRankings(providerModels).map(({ evaluationState, ...model }) => model);
  const ranked = evaluated.filter(model => model.scores?.overall != null);
  const catalogOnly = evaluated
    .filter(model => model.scores?.overall == null)
    .map(model => ({ id: model.id, name: model.name, providers: model.providers, providerIds: model.providerIds }));

  return NextResponse.json({
    updated: '2026-09-16',
    status,
    models: ranked,
    catalogOnly,
    sources,
    benchmarkSnapshot: BENCHMARK_SNAPSHOT,
    methodology: {
      defaultView: 'evidence-only-overall-index',
      population: 'Text models available through Venice and/or Morpheus in the current catalog with at least one usable independent Overall source result.',
      normalization: 'Published Arena, Artificial Analysis and LLM Stats measurements are converted to 0-100 percentiles within the provider-model population for that same source, then combined with the stated weights.',
      missingEvidence: 'Missing benchmark measurements are not imputed. The composite is renormalized across measurements that actually exist; evidence coverage shows how much of the intended source weight is present.',
      catalogOnly: 'Provider models with no usable Arena, Artificial Analysis or LLM Stats Overall result remain in catalogOnly and are not assigned a ranking or rendered as ranked cards.',
      weights: INDEX_WEIGHTS,
      publishedEvidence: 'Native source scores and ranks remain visible with direct source links. Class-scoped ranks are not presented as global ranks.',
      provenance: 'Third-party, developer-reported and pending results are identified separately so users can judge evidence strength.',
      metrics: {
        overall: 'Arena + Artificial Analysis + LLM Stats; available evidence only',
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
