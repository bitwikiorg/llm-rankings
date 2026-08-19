import { VERIFIED_BENCHMARKS } from '../data/verified-benchmarks';

const round = value => value == null ? null : Math.round(value * 10) / 10;

const weighted = entries => {
  const usable = entries.filter(entry => entry.value != null && Number.isFinite(Number(entry.value)));
  if (!usable.length) return null;
  const total = usable.reduce((sum, entry) => sum + entry.weight, 0);
  return usable.reduce((sum, entry) => sum + Number(entry.value) * entry.weight, 0) / total;
};

const get = (model, path) => path.split('.').reduce((value, key) => value?.[key], model);

function percentile(models, path, value, direction = 'high') {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const values = models.map(model => Number(get(model, path))).filter(Number.isFinite).sort((a, b) => a - b);
  if (!values.length) return null;
  if (values.length === 1) return 100;
  const lower = values.filter(item => item < Number(value)).length;
  const equal = values.filter(item => item === Number(value)).length;
  const position = lower + Math.max(0, equal - 1) / 2;
  const pct = position / (values.length - 1) * 100;
  return direction === 'low' ? 100 - pct : pct;
}

function freshnessScore(date) {
  if (!date) return null;
  const released = new Date(`${date}T00:00:00Z`).getTime();
  if (!Number.isFinite(released)) return null;
  const ageDays = Math.max(0, (Date.now() - released) / 86400000);
  return Math.max(0, Math.min(100, 100 - ageDays / 180 * 100));
}

function blendedPrice(model) {
  const offers = Object.values(model.prices || {}).filter(price => price?.input != null || price?.output != null);
  if (!offers.length) return null;
  const costs = offers.map(price => (Number(price.input || 0) * 0.35) + (Number(price.output || 0) * 0.65));
  return costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
}

function providerLabel(model) {
  if (model.providers?.venice && model.providers?.morpheus) return 'both';
  if (model.providers?.venice) return 'venice';
  if (model.providers?.morpheus) return 'morpheus';
  return 'none';
}

function mergeVerified(model) {
  const verified = VERIFIED_BENCHMARKS[model.id];
  if (!verified) return model;
  const { meta = {}, ...benchmarkOverrides } = verified;
  return {
    ...model,
    ...meta,
    benchmarks: {
      ...(model.benchmarks || {}),
      ...benchmarkOverrides,
      vendor: {
        ...(model.benchmarks?.vendor || {}),
        ...(benchmarkOverrides.vendor || {}),
      },
    },
  };
}

function arenaTier(rank) {
  if (!rank) return null;
  if (rank <= 10) return 'S';
  if (rank <= 25) return 'A';
  if (rank <= 50) return 'B';
  if (rank <= 100) return 'C';
  return 'D';
}

function confidenceFor(sourceCount) {
  if (sourceCount >= 3) return 'high';
  if (sourceCount === 2) return 'medium';
  if (sourceCount === 1) return 'low';
  return 'none';
}

export function enrichRankings(models) {
  const prepared = models.map(model => ({ ...mergeVerified(model), _blendedCost: blendedPrice(model) }));

  const scored = prepared.map(model => {
    const arenaRaw = model.benchmarks?.arena?.score ?? null;
    const aaRaw = model.benchmarks?.artificialAnalysis?.intelligence ?? null;
    const llmRaw = model.benchmarks?.llmStats?.overall ?? null;
    const arenaPct = percentile(prepared, 'benchmarks.arena.score', arenaRaw);
    const aaPct = percentile(prepared, 'benchmarks.artificialAnalysis.intelligence', aaRaw);
    const llmPct = percentile(prepared, 'benchmarks.llmStats.overall', llmRaw);

    const overallSources = [
      { key: 'arena', label: model.benchmarks?.arena?.rank ? 'Arena Overall' : 'Arena AutoEval / score', raw: arenaRaw, value: arenaPct, weight: 0.50 },
      { key: 'artificialAnalysis', label: 'Artificial Analysis Intelligence Index', raw: aaRaw, value: aaPct, weight: 0.30 },
      { key: 'llmStats', label: 'LLM Stats Score', raw: llmRaw, value: llmPct, weight: 0.20 },
    ];
    const availableSources = overallSources.filter(source => source.value != null);
    const sourceCount = availableSources.length;
    const availableWeight = availableSources.reduce((sum, source) => sum + source.weight, 0);

    // The beta fallback is a site-derived 0–100 percentile index. Raw source values are
    // never averaged directly because Arena, AA and LLM Stats use different scales.
    // Missing sources are omitted and the remaining nominal weights are re-normalized.
    const aggregate = sourceCount ? weighted(overallSources) : null;
    const aggregateComponents = availableSources.map(source => ({
      key: source.key,
      label: source.label,
      raw: source.raw,
      percentile: round(source.value),
      nominalWeight: source.weight,
      effectiveWeight: round(source.weight / availableWeight * 100),
    }));

    const kiloPct = percentile(prepared, 'benchmarks.kilo.completion', model.benchmarks?.kilo?.completion);
    const reasoning = weighted([
      { value: percentile(prepared, 'benchmarks.llmStats.reasoning', model.benchmarks?.llmStats?.reasoning), weight: 0.50 },
      { value: aaPct, weight: 0.30 },
      { value: percentile(prepared, 'benchmarks.vendor.gpqa', model.benchmarks?.vendor?.gpqa), weight: 0.20 },
    ]);
    const coding = weighted([
      { value: kiloPct, weight: 0.50 },
      { value: percentile(prepared, 'benchmarks.llmStats.coding', model.benchmarks?.llmStats?.coding), weight: 0.30 },
      { value: percentile(prepared, 'benchmarks.vendor.terminalBench', model.benchmarks?.vendor?.terminalBench), weight: 0.10 },
      { value: percentile(prepared, 'benchmarks.vendor.sweBenchPro', model.benchmarks?.vendor?.sweBenchPro), weight: 0.10 },
    ]);
    const agent = weighted([
      { value: percentile(prepared, 'benchmarks.llmStats.agent', model.benchmarks?.llmStats?.agent), weight: 0.50 },
      { value: percentile(prepared, 'benchmarks.vendor.agentsLastExam', model.benchmarks?.vendor?.agentsLastExam), weight: 0.25 },
      { value: percentile(prepared, 'benchmarks.vendor.automationBench', model.benchmarks?.vendor?.automationBench), weight: 0.15 },
      { value: percentile(prepared, 'benchmarks.vendor.osWorldVerified', model.benchmarks?.vendor?.osWorldVerified), weight: 0.10 },
    ]);

    const affordability = percentile(prepared, '_blendedCost', model._blendedCost, 'low');
    const context = percentile(prepared, 'context', model.context);
    const value = aggregate == null ? null : weighted([
      { value: aggregate, weight: 0.72 },
      { value: affordability, weight: 0.28 },
    ]);
    const freshness = freshnessScore(model.releaseDate);
    const arenaRank = model.benchmarks?.arena?.rank || null;
    const confidence = confidenceFor(sourceCount);

    return {
      ...model,
      provider: providerLabel(model),
      rank: arenaRank,
      ranking: {
        aggregate: round(aggregate),
        aggregateScale: '0–100 percentile index',
        aggregateComponents,
        consensus: round(aggregate),
        power: round(aggregate),
        basis: arenaRank ? 'Arena Overall human rank' : sourceCount ? `β fallback · ${sourceCount} source${sourceCount === 1 ? '' : 's'}` : 'Awaiting independent evaluation',
        confidence,
        availableSources: availableSources.map(source => source.key),
        freshness: round(freshness),
        evidence: Math.round(sourceCount / 3 * 100),
        sourceCount,
        affordability: round(affordability),
        value: round(value),
        context: round(context),
        reasoning: round(reasoning),
        coding: round(coding),
        agent: round(agent),
        tier: arenaTier(arenaRank),
        tierBasis: arenaRank ? 'arena' : 'none',
      },
    };
  });

  const fallbackOrdered = scored
    .filter(model => !model.rank && model.ranking.aggregate != null)
    .sort((a, b) => b.ranking.aggregate - a.ranking.aggregate || a.name.localeCompare(b.name));
  const fallbackRank = new Map(fallbackOrdered.map((model, index) => [model.id, index + 1]));

  return scored
    .map(model => ({
      ...model,
      fallbackRank: fallbackRank.get(model.id) || null,
      displayRank: model.rank ? `#${model.rank}` : fallbackRank.has(model.id) ? `β${fallbackRank.get(model.id)}` : null,
    }))
    .sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.rank) return -1;
      if (b.rank) return 1;
      if (a.fallbackRank && b.fallbackRank) return a.fallbackRank - b.fallbackRank;
      if (a.fallbackRank) return -1;
      if (b.fallbackRank) return 1;
      return a.name.localeCompare(b.name);
    })
    .map(({ _blendedCost, ...model }) => ({ ...model, blendedCost: _blendedCost }));
}
