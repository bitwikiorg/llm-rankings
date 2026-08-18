import { NextResponse } from 'next/server';
import { getModelCatalog } from '../../../lib/providers';
import { enrichRankings } from '../../../lib/rankings';
import { RESEARCH_UPDATED } from '../../../data/models';

export const revalidate = 3600;

export async function GET() {
  const { models, status } = await getModelCatalog();
  const providerModels = models.filter(m => m.providers?.venice || m.providers?.morpheus);
  const ranked = enrichRankings(providerModels);
  return NextResponse.json({ updated: RESEARCH_UPDATED, status, models: ranked });
}
