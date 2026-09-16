import { seedModels } from '../data/models';

const normalize = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const usd = (input, output, context, privacy = null) => ({ input, output, context, privacy, currency: 'USD', unit: '1M tokens' });

// Current provider-documented frontier models that are newer than the original
// seed snapshot. Live provider APIs still take precedence when configured.
const CURRENT_PROVIDER_SNAPSHOT = [
  {
    id: 'claude-opus-4-6', name: 'Claude Opus 4.6', organization: 'Anthropic', releaseDate: null,
    providerIds: { venice: ['claude-opus-4-6'], morpheus: [] }, providers: { venice: true, morpheus: false },
    context: 1000000, openness: 'Proprietary', license: 'Closed', capabilities: ['reasoning', 'coding', 'tools', 'vision'],
    prices: { venice: usd(6, 30, 1000000, 'Anonymized') }, benchmarks: {}, sourceKeys: ['veniceModels', 'venicePricing', 'arena'],
  },
  {
    id: 'claude-opus-4-7', name: 'Claude Opus 4.7', organization: 'Anthropic', releaseDate: null,
    providerIds: { venice: ['claude-opus-4-7'], morpheus: [] }, providers: { venice: true, morpheus: false },
    context: 1000000, openness: 'Proprietary', license: 'Closed', capabilities: ['reasoning', 'coding', 'tools', 'vision'],
    prices: { venice: usd(6, 30, 1000000, 'Anonymized') }, benchmarks: {}, sourceKeys: ['veniceModels', 'venicePricing', 'arena'],
  },
  {
    id: 'claude-fable-5-1', name: 'Claude Fable 5.1', organization: 'Anthropic', releaseDate: '2026-09-01',
    providerIds: { venice: ['claude-fable-5-1'], morpheus: [] }, providers: { venice: true, morpheus: false },
    context: 1000000, openness: 'Proprietary', license: 'Closed', capabilities: ['reasoning', 'coding', 'tools', 'vision'],
    prices: { venice: usd(12, 60, 1000000, 'Anonymized') }, benchmarks: {}, sourceKeys: ['veniceModels', 'venicePricing', 'arena', 'artificialAnalysis', 'llmStats'],
  },
  {
    id: 'gemini-3-8-flash', name: 'Gemini 3.8 Flash', organization: 'Google', releaseDate: '2026-09-02',
    providerIds: { venice: ['gemini-3-8-flash'], morpheus: [] }, providers: { venice: true, morpheus: false },
    context: 1000000, openness: 'Proprietary', license: 'Closed', capabilities: ['reasoning', 'tools', 'vision'],
    prices: { venice: usd(0.94, 4.69, 1000000, 'Anonymized') }, benchmarks: {}, sourceKeys: ['veniceModels', 'venicePricing', 'arena', 'artificialAnalysis', 'llmStats'],
  },
  {
    id: 'glm-5-3-flash', name: 'GLM 5.3 Flash', organization: 'Z.ai', releaseDate: '2026-08-26',
    providerIds: { venice: ['z-ai-glm-5-3-flash', 'e2ee-glm-5-3-flash'], morpheus: [] }, providers: { venice: true, morpheus: false },
    context: 1049000, openness: 'Open weights', license: 'MIT', capabilities: ['reasoning', 'coding', 'tools', 'vision'],
    prices: { venice: usd(0.15, 0.50, 1049000, 'Private') }, benchmarks: {}, sourceKeys: ['veniceModels', 'venicePricing', 'arena', 'artificialAnalysis', 'llmStats'],
  },
  {
    id: 'gpt-6-astra', name: 'GPT-6 Astra', organization: 'OpenAI', releaseDate: '2026-09-04',
    providerIds: { venice: ['openai-gpt-6-astra', 'openai-gpt-6-astra-pro'], morpheus: [] }, providers: { venice: true, morpheus: false },
    context: 1050000, openness: 'Proprietary', license: 'Closed', capabilities: ['reasoning', 'tools', 'vision'],
    prices: { venice: usd(10, 50, 1050000, 'Anonymized') }, benchmarks: {}, sourceKeys: ['veniceModels', 'venicePricing', 'arena', 'artificialAnalysis'],
  },
  {
    id: 'xiaomi-mimo-v2-5', name: 'MiMo-V2.5', organization: 'Xiaomi', releaseDate: null,
    providerIds: { venice: ['xiaomi-mimo-v2-5'], morpheus: [] }, providers: { venice: true, morpheus: false },
    context: 1000000, openness: 'Open weights', license: 'MIT', capabilities: ['reasoning', 'coding', 'tools', 'vision'],
    prices: { venice: usd(0.40, 2.00, 1000000, 'Private') }, benchmarks: {}, sourceKeys: ['veniceModels', 'venicePricing', 'arena'],
  },
];

const PROVIDER_ID_CORRECTIONS = {
  'glm-5-3': { venice: ['z-ai-glm-5-3', 'e2ee-glm-5-3-p'] },
  'kimi-k3': { venice: ['kimi-k3', 'e2ee-kimi-k3-p', 'kimi-k3-fast-api'] },
  'gpt-5-5': { venice: ['openai-gpt-55', 'openai-gpt-55-pro'], morpheus: ['GPT-5.5', 'GPT-5.5-Pro'] },
  'minimax-m2-7': { morpheus: ['MiniMax-M2.7'] },
};

function mergeIds(existing = [], additions = []) {
  return [...new Set([...existing, ...additions].filter(Boolean))];
}

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
    providerIds: {
      venice: mergeIds(current.providerIds?.venice, provider === 'venice' ? [overlay.providerId] : []),
      morpheus: mergeIds(current.providerIds?.morpheus, provider === 'morpheus' ? [overlay.providerId] : []),
    },
    prices: { ...current.prices, ...overlay.prices },
    sourceKeys: mergeIds(current.sourceKeys, provider === 'venice' ? ['veniceModels'] : ['morModels']),
  };
}

export async function getModelCatalog() {
  const base = [...seedModels, ...CURRENT_PROVIDER_SNAPSHOT].map(model => ({
    ...model,
    providers: { ...model.providers },
    providerIds: { venice: [...(model.providerIds?.venice || [])], morpheus: [...(model.providerIds?.morpheus || [])] },
    prices: { ...model.prices },
    benchmarks: { ...model.benchmarks },
    sourceKeys: [...(model.sourceKeys || [])],
  }));

  for (const model of base) {
    const corrections = PROVIDER_ID_CORRECTIONS[model.id];
    if (!corrections) continue;
    model.providerIds = {
      venice: mergeIds(model.providerIds?.venice, corrections.venice || []),
      morpheus: mergeIds(model.providerIds?.morpheus, corrections.morpheus || []),
    };
    model.providers = {
      venice: model.providers?.venice || model.providerIds.venice.length > 0,
      morpheus: model.providers?.morpheus || model.providerIds.morpheus.length > 0,
    };
  }

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
