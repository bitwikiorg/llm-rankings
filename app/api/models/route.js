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
      tiers: { S: 'Arena top 10', A: 'Arena top 25', B: 'Arena top 50', C: 'Arena top 100', D: 'Arena ranked', U: 'Not evaluated by Arena' },
      consensus: {
        benchmarkWeights: { arena: 0.50, artificialAnalysis: 0.30, llmStats: 0.20 },
        minimumIndependentSources: 2,
        releaseDateWeight: 0,
      },
      coding: { kilo: 0.50, llmStatsCoding: 0.30, terminalBench: 0.10, sweBenchPro: 0.10 },
      note: 'Arena Overall is the default source-native rank. Experimental consensus is evidence-only and secondary. Release date is metadata and never changes benchmark rank.',
    },
  });
}
