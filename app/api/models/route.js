import { NextResponse } from 'next/server';
import { getModelCatalog } from '../../../lib/providers';
import { enrichRankings, INDEX_WEIGHTS } from '../../../lib/rankings';
import { RESEARCH_UPDATED, sources } from '../../../data/models';
import { BENCHMARK_SNAPSHOT } from '../../../data/verified-benchmarks';

export const revalidate = 3600;

export async function GET() {
  const { models, status } = await getModelCatalog();
  const providerModels = models.filter(model => model.providers?.venice || model.providers?.morpheus);
  const ranked = enrichRankings(providerModels);

  return NextResponse.json({
    updated: RESEARCH_UPDATED,
    status,
    models: ranked,
    sources,
    benchmarkSnapshot: BENCHMARK_SNAPSHOT,
    methodology: {
      defaultView: 'normalized-overall-index',
      population: 'Text models available through Venice and/or Morpheus in the current catalog.',
      normalization: 'Every benchmark signal is converted to a 0-100 percentile inside the tracked provider-model population before heterogeneous sources are combined.',
      missingEvidence: 'A missing component receives a neutral percentile of 50. Coverage is reported separately so missing evidence is uncertainty rather than a zero score.',
      weights: INDEX_WEIGHTS,
      publishedEvidence: 'Arena, Artificial Analysis, LLM Stats, Kilo and task benchmarks remain visible on their native scales with direct source links. Their published ranks are evidence, not the site rank.',
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
