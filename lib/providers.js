import { seedModels } from '../data/models';

function normalize(s = '') {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function findSeed(id) {
  const n = normalize(id);
  return seedModels.find(m => [m.id, ...(m.aliases || [])].some(x => normalize(x) === n));
}

async function fetchVenice() {
  if (!process.env.VENICE_API_KEY) return { models: [], live: false, reason: 'VENICE_API_KEY not configured' };
  const res = await fetch('https://api.venice.ai/api/v1/models?type=text', {
    headers: { Authorization: `Bearer ${process.env.VENICE_API_KEY}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Venice models: ${res.status}`);
  const json = await res.json();
  const rows = json.data || [];
  return {
    live: true,
    models: rows.map(row => {
      const spec = row.model_spec || {};
      return {
        providerId: row.id,
        id: normalize(row.id),
        name: spec.name || row.id,
        organization: null,
        providers: { venice: true, morpheus: false },
        context: spec.availableContextTokens ?? null,
        quantization: spec.capabilities?.quantization ?? null,
        capabilities: [
          spec.capabilities?.supportsReasoning && 'reasoning',
          spec.capabilities?.optimizedForCode && 'coding',
          spec.capabilities?.supportsFunctionCalling && 'tools',
          spec.capabilities?.supportsVision && 'vision',
          spec.capabilities?.supportsWebSearch && 'web-search',
        ].filter(Boolean),
        prices: spec.pricing ? { venice: { input: spec.pricing.input?.usd ?? null, output: spec.pricing.output?.usd ?? null, currency: 'USD', unit: '1M tokens' } } : {},
        huggingFace: spec.modelSource?.includes('huggingface.co') ? spec.modelSource : null,
        privacy: spec.privacy || null,
        description: spec.description || null,
      };
    }),
  };
}

async function fetchMorpheus() {
  if (!process.env.MORPHEUS_API_KEY) return { models: [], live: false, reason: 'MORPHEUS_API_KEY not configured' };
  const res = await fetch('https://api.mor.org/api/v1/models/allmodels', {
    headers: { Authorization: `Bearer ${process.env.MORPHEUS_API_KEY}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Morpheus models: ${res.status}`);
  const json = await res.json();
  return {
    live: true,
    models: (json.data || []).filter(row => !String(row.id).includes(':web')).map(row => ({
      providerId: row.id,
      id: normalize(row.id),
      name: row.id,
      organization: row.owned_by || null,
      providers: { venice: false, morpheus: true },
      providerCreated: row.created ? new Date(row.created * 1000).toISOString().slice(0, 10) : null,
      capabilities: [], prices: {},
    })),
  };
}

function mergeOverlay(base, overlay, provider) {
  const target = findSeed(overlay.providerId || overlay.id) || base.find(m => m.id === overlay.id);
  if (!target) {
    base.push({
      ...overlay,
      aliases: [overlay.providerId], releaseDate: overlay.providerCreated || null, openness: 'Unknown', license: 'Unknown',
      paramsTotalB: null, paramsActiveB: null, benchmarks: {},
    });
    return;
  }
  const index = base.findIndex(m => m.id === target.id);
  const current = base[index];
  base[index] = {
    ...current,
    name: current.name || overlay.name,
    organization: current.organization || overlay.organization,
    context: overlay.context ?? current.context,
    quantization: overlay.quantization ?? current.quantization,
    huggingFace: overlay.huggingFace || current.huggingFace,
    description: overlay.description || current.description,
    privacy: overlay.privacy || current.privacy,
    capabilities: [...new Set([...(current.capabilities || []), ...(overlay.capabilities || [])])],
    providers: { ...current.providers, [provider]: true },
    prices: { ...current.prices, ...overlay.prices },
  };
}

export async function getModelCatalog() {
  const base = seedModels.map(m => ({ ...m, providers: { ...m.providers }, prices: { ...m.prices } }));
  const status = { venice: { live: false }, morpheus: { live: false } };
  try {
    const v = await fetchVenice(); status.venice = { live: v.live, reason: v.reason || null }; v.models.forEach(m => mergeOverlay(base, m, 'venice'));
  } catch (error) { status.venice = { live: false, reason: error.message }; }
  try {
    const m = await fetchMorpheus(); status.morpheus = { live: m.live, reason: m.reason || null }; m.models.forEach(x => mergeOverlay(base, x, 'morpheus'));
  } catch (error) { status.morpheus = { live: false, reason: error.message }; }
  return { models: base, status };
}
