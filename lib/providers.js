import { seedModels } from '../data/models';

const normalize = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function allIds(model) {
  return [model.id, ...(model.aliases || []), ...(model.providerIds?.venice || []), ...(model.providerIds?.morpheus || [])].map(normalize);
}

function findSeed(id, base = seedModels) {
  const needle = normalize(id);
  return base.find(model => allIds(model).includes(needle));
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
      const caps = spec.capabilities || {};
      const pricing = spec.pricing || {};
      return {
        providerId: row.id,
        id: normalize(row.id),
        name: spec.name || row.id,
        organization: null,
        providers: { venice: true, morpheus: false },
        providerCreated: row.created ? new Date(row.created * 1000).toISOString().slice(0, 10) : null,
        context: spec.availableContextTokens ?? null,
        quantization: caps.quantization ?? null,
        capabilities: [
          caps.supportsReasoning && 'reasoning',
          caps.optimizedForCode && 'coding',
          caps.supportsFunctionCalling && 'tools',
          caps.supportsVision && 'vision',
          caps.supportsWebSearch && 'web-search',
        ].filter(Boolean),
        prices: pricing.input || pricing.output ? {
          venice: {
            input: pricing.input?.usd ?? pricing.input ?? null,
            output: pricing.output?.usd ?? pricing.output ?? null,
            context: spec.availableContextTokens ?? null,
            privacy: spec.privacy || null,
            currency: 'USD', unit: '1M tokens',
          },
        } : {},
        huggingFace: String(spec.modelSource || '').includes('huggingface.co') ? spec.modelSource : null,
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
  const rows = json.data || [];
  return {
    live: true,
    models: rows
      .filter(row => !String(row.id).includes(':web'))
      .map(row => ({
        providerId: row.id,
        id: normalize(row.id),
        name: row.id,
        organization: row.owned_by || null,
        providers: { venice: false, morpheus: true },
        providerCreated: row.created ? new Date(row.created * 1000).toISOString().slice(0, 10) : null,
        capabilities: [],
        prices: {},
      })),
  };
}

function mergeOverlay(base, overlay, provider) {
  const target = findSeed(overlay.providerId || overlay.id, base) || base.find(model => model.id === overlay.id);
  if (!target) {
    base.push({
      ...overlay,
      aliases: [overlay.providerId],
      providerIds: { venice: provider === 'venice' ? [overlay.providerId] : [], morpheus: provider === 'morpheus' ? [overlay.providerId] : [] },
      releaseDate: null,
      openness: 'Unknown', license: 'Unknown', paramsTotalB: null, paramsActiveB: null,
      benchmarks: {}, sourceKeys: provider === 'venice' ? ['veniceModels'] : ['morModels'],
    });
    return;
  }

  const index = base.findIndex(model => model.id === target.id);
  const current = base[index];
  base[index] = {
    ...current,
    organization: current.organization || overlay.organization,
    providerCreated: overlay.providerCreated || current.providerCreated,
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
  const base = seedModels.map(model => ({
    ...model,
    providers: { ...model.providers },
    providerIds: { venice: [...(model.providerIds?.venice || [])], morpheus: [...(model.providerIds?.morpheus || [])] },
    prices: { ...model.prices },
    benchmarks: { ...model.benchmarks },
    sourceKeys: [...(model.sourceKeys || [])],
  }));

  const status = {
    venice: { live: false, mode: 'snapshot', reason: null },
    morpheus: { live: false, mode: 'snapshot', reason: null },
  };

  try {
    const result = await fetchVenice();
    status.venice = { live: result.live, mode: result.live ? 'live' : 'snapshot', reason: result.reason || null, liveCount: result.models.length };
    result.models.forEach(model => mergeOverlay(base, model, 'venice'));
  } catch (error) {
    status.venice = { live: false, mode: 'snapshot', reason: error.message };
  }

  try {
    const result = await fetchMorpheus();
    status.morpheus = { live: result.live, mode: result.live ? 'live' : 'snapshot', reason: result.reason || null, liveCount: result.models.length };
    result.models.forEach(model => mergeOverlay(base, model, 'morpheus'));
  } catch (error) {
    status.morpheus = { live: false, mode: 'snapshot', reason: error.message };
  }

  status.venice.documentedCount = base.filter(model => model.providers?.venice).length;
  status.morpheus.documentedCount = base.filter(model => model.providers?.morpheus).length;
  status.bothCount = base.filter(model => model.providers?.venice && model.providers?.morpheus).length;

  return { models: base, status };
}
