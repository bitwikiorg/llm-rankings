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
      defaultView: 'primary',
      primaryOrder: 'Arena Overall rank when available; otherwise a clearly marked beta fallback aggregate.',
      tiers: { S: 'Top 10 / top aggregate band', A: 'Top 25 / strong aggregate band', B: 'Top 50 / competitive aggregate band', C: 'Top 100 / established aggregate band', D: 'Arena ranked below 100 / lower aggregate band' },
      fallbackAggregate: {
        benchmarkWeights: { arena: 0.50, artificialAnalysis: 0.30, llmStats: 0.20 },
        availableSourcesAreRenormalized: true,
        minimumIndependentSources: 1,
        confidence: { high: '3 source families', medium: '2 source families', low: '1 source family', none: 'no independent overall benchmark evidence' },
        releaseDateWeight: 0,
      },
      coding: { kilo: 0.50, llmStatsCoding: 0.30, terminalBench: 0.10, sweBenchPro: 0.10 },
      note: 'There is no U grade. Arena Overall remains the source-native default. If a model lacks an exact human Arena rank, the site may show a beta aggregate from whatever independent overall benchmark families are available, with its basis, source count and confidence exposed. Models with no independent overall evidence remain Pending rather than receiving a grade.',
    },
  });
}
