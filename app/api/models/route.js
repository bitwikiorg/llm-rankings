import { NextResponse } from 'next/server';
import { getModelCatalog } from '../../../lib/providers';
import { enrichRankings } from '../../../lib/rankings';
import { RESEARCH_UPDATED, sources } from '../../../data/models';

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
    methodology: {
      power: { capability: 0.70, freshness: 0.25, evidence: 0.05 },
      capability: { arena: 0.40, llmStats: 0.25, artificialAnalysis: 0.20, kilo: 0.15 },
      note: 'Benchmark families are percentile-normalized before aggregation. Missing signals are excluded, not treated as zero.',
    },
  });
}
