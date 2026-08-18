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
      defaultView: 'arena',
      consensus: {
        benchmarkConsensus: 0.90,
        freshness: 0.10,
        benchmarkWeights: { arena: 0.50, artificialAnalysis: 0.30, llmStats: 0.20 },
        minimumIndependentSources: 2,
      },
      coding: { kilo: 0.50, llmStatsCoding: 0.30, terminalBench: 0.10, sweBenchPro: 0.10 },
      note: 'Arena is the default leaderboard view. Consensus is a derived secondary view. Kilo is coding-specific and is not used in the general consensus score. Recent releases receive a 10% tie-breaking weight, never enough to override benchmark consensus by themselves.',
    },
  });
}
