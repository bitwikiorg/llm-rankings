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
      primaryOrder: 'Exact Arena Overall human rank when available; otherwise a clearly marked beta fallback rank within the fallback subset.',
      scales: {
        arena: 'Bradley-Terry human-preference score displayed on an Elo-like scale; source-native and not a percentage.',
        artificialAnalysis: 'Artificial Analysis Intelligence Index; 0-100 source-native composite.',
        llmStats: 'LLM Stats Score; TrueSkill-derived conservative rating on its own source-native scale.',
        betaFallback: 'Site-derived 0-100 percentile index. Raw source values are converted to within-source percentiles before weighted aggregation.',
        providerPrice: 'USD per 1M tokens, input / output.',
      },
      tiers: { S: 'Arena Overall top 10', A: 'Arena Overall top 25', B: 'Arena Overall top 50', C: 'Arena Overall top 100', D: 'Arena Overall ranked below 100' },
      fallbackAggregate: {
        benchmarkWeights: { arena: 0.50, artificialAnalysis: 0.30, llmStats: 0.20 },
        rawValuesAreNeverAveragedDirectly: true,
        availableSourcesAreRenormalized: true,
        minimumIndependentSources: 1,
        scale: '0-100 within-source percentile aggregate',
        confidence: { high: '3 source families', medium: '2 source families', low: '1 source family', none: 'no independent overall benchmark evidence' },
        releaseDateWeight: 0,
      },
      coding: { kilo: 0.50, llmStatsCoding: 0.30, terminalBench: 0.10, sweBenchPro: 0.10 },
      legacyCoverage: 'MMLU, HumanEval, MT-Bench and BBH are not currently in the checked snapshot. They remain omitted until exact model/configuration measurements can be sourced; no family-level proxy scores are synthesized.',
      note: 'There is no U grade. S/A/B/C/D grades are Arena rank bands only. A beta fallback rank is a separate ranking regime and is never presented as an Arena grade or overall Arena placement.',
    },
  });
}
