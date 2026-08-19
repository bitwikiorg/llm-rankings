import { NextResponse } from 'next/server';
import { getModelCatalog } from '../../../lib/providers';
import { enrichRankings, INDEX_WEIGHTS } from '../../../lib/rankings';
import { sources } from '../../../data/models';
import { BENCHMARK_SNAPSHOT } from '../../../data/verified-benchmarks';

export const revalidate = 3600;

export async function GET() {
  const { models, status } = await getModelCatalog();
  const providerModels = models.filter(model => model.providers?.venice || model.providers?.morpheus);
  const ranked = enrichRankings(providerModels).map(({ evaluationState, ...model }) => model);

  return NextResponse.json({
    updated: '2026-08-19',
    status,
    models: ranked,
    sources,
    benchmarkSnapshot: BENCHMARK_SNAPSHOT,
    methodology: {
      defaultView: 'normalized-overall-index',
      population: 'Text models available through Venice and/or Morpheus in the current catalog.',
      normalization: 'Every benchmark signal is converted to a 0-100 percentile inside the tracked provider-model population before heterogeneous sources are combined.',
      missingEvidence: 'A missing component receives a neutral percentile of 50 in the conservative site score. Coverage is reported separately so missing evidence is uncertainty rather than a zero score.',
      estimateBands: 'For Overall, Reasoning, Coding, and Agent metrics with at least 55% but less than 100% observed evidence, the available components are renormalized to an evidence-only score. That score is compared against conservative site scores to produce a labeled estimate rank or rank band. It never replaces the primary rank or a source-native rank.',
      weights: INDEX_WEIGHTS,
      publishedEvidence: 'Arena, Artificial Analysis, LLM Stats, Kilo and task benchmarks remain visible on their native scales with direct source links. Their published ranks are evidence, not the site rank.',
      provenance: 'Independent measurements, vendor-reported measurements, estimates, and pending evidence are labeled separately. Measurements from incompatible benchmark versions are not silently substituted into the scoring formula.',
      metrics: {
        overall: 'Arena + Artificial Analysis + LLM Stats',
        reasoning: 'LLM Stats reasoning + Artificial Analysis + GPQA',
        coding: 'Kilo + LLM Stats coding + Terminal-Bench + SWE-bench Pro',
        agent: "LLM Stats agent + Agents' Last Exam + AutomationBench + OSWorld",
        value: '70% normalized overall capability + 30% affordability',
        affordability: 'Blended provider token cost, lower is better',
        context: 'Published context window, larger is better',
      },
    },
  });
}
