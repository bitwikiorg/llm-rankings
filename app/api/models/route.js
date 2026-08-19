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
      normalization: 'Benchmark results are converted to 0-100 percentiles within the models in this index before they are combined.',
      missingEvidence: 'When a benchmark result is unavailable, that component uses a neutral percentile of 50. Evidence coverage shows how much of the metric is supported by available results.',
      estimateBands: 'For Overall, Reasoning, Coding, and Agent metrics with at least 55% but less than 100% evidence coverage, available results are also used to calculate an estimated placement. The primary rank remains conservative while the estimate shows the likely range.',
      weights: INDEX_WEIGHTS,
      publishedEvidence: 'Arena, Artificial Analysis, LLM Stats, Kilo and task-benchmark results are shown with direct source links and keep their original published values.',
      provenance: 'Third-party, developer-reported, estimated and pending results are identified separately so users can judge the strength of the available evidence.',
      metrics: {
        overall: 'Arena + Artificial Analysis + LLM Stats',
        reasoning: 'LLM Stats reasoning + Artificial Analysis + GPQA',
        coding: 'Kilo + LLM Stats coding + Terminal-Bench + SWE-bench Pro',
        agent: "LLM Stats agent + Agents' Last Exam + AutomationBench + OSWorld",
        value: '70% overall capability + 30% affordability',
        affordability: 'Blended provider token cost, lower is better',
        context: 'Published context window, larger is better',
      },
    },
  });
}
