import { NextResponse } from 'next/server';
import { getModelCatalog } from '../../../lib/providers';
import { enrichRankings } from '../../../lib/rankings';
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
      defaultView: 'best-available-source-rank',
      primaryOrder: 'Arena Overall human rank first; otherwise LLM Stats overall rank; otherwise Artificial Analysis model rank; otherwise Pending.',
      scales: {
        arena: 'Bradley-Terry human-preference score displayed on an Elo-like scale; source-native and not a percentage.',
        artificialAnalysis: 'Artificial Analysis Intelligence Index; 0-100 source-native composite.',
        llmStats: 'LLM Stats source-native score and published overall rank; not numerically interchangeable with Arena or AA.',
        providerPrice: 'USD per 1M tokens, input / output.',
      },
      tiers: { S: 'Arena Overall top 10', A: 'Arena Overall top 25', B: 'Arena Overall top 50', C: 'Arena Overall top 100', D: 'Arena Overall ranked below 100' },
      newModelPolicy: 'A newly released model is not treated as unranked when another tracked independent source already publishes an exact-model overall rank. That source rank is shown with its name until Arena human coverage exists.',
      internalResearchIndex: 'A percentile-normalized research index may be retained for secondary analysis, but it is not displayed as the model rank or as a 0-100 grade.',
      legacyCoverage: 'MMLU, HumanEval, MT-Bench and BBH remain omitted until exact model/configuration measurements can be sourced; no family-level proxy scores are synthesized.',
      note: 'There is no U grade and no beta fallback number in the primary UI. S/A/B/C/D grades are Arena rank bands only. Every displayed rank names its source.',
    },
  });
}
