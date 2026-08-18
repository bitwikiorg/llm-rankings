import { VERIFIED_BENCHMARKS } from '../data/verified-benchmarks';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
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
  if (!date) return 35;
  const released = new Date(`${date}T00:00:00Z`).getTime();
  if (!Number.isFinite(released)) return 35;
  const ageDays = Math.max(0, (Date.now() - released) / 86400000);
  // Recency is a tie-breaker, not a substitute for capability.
  return clamp(100 * Math.exp(-ageDays / 240), 20, 100);
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
  return {
    ...model,
    benchmarks: {
      ...(model.benchmarks || {}),
      ...verified,
      vendor: model.benchmarks?.vendor || {},
    },
  };
}

export function enrichRankings(models) {
  const prepared = models.map(model => ({ ...mergeVerified(model), _blendedCost: blendedPrice(model) }));

  const scored = prepared.map(model => {
    // Overall consensus intentionally excludes Kilo because Kilo is coding-specific.
    // Arena receives the largest weight because it is the broadest human-preference signal.
    const arenaPct = percentile(prepared, 'benchmarks.arena.score', model.benchmarks?.arena?.score);
    const aaPct = percentile(prepared, 'benchmarks.artificialAnalysis.intelligence', model.benchmarks?.artificialAnalysis?.intelligence);
    const llmPct = percentile(prepared, 'benchmarks.llmStats.overall', model.benchmarks?.llmStats?.overall);

    const overallSources = [
      { key: 'arena', value: arenaPct, weight: 0.50 },
      { key: 'artificialAnalysis', value: aaPct, weight: 0.30 },
      { key: 'llmStats', value: llmPct, weight: 0.20 },
    ];
    const sourceCount = overallSources.filter(source => source.value != null).length;
    const capability = sourceCount >= 2 ? weighted(overallSources) : null;
    const freshness = freshnessScore(model.releaseDate);
    const coverage = sourceCount / 3;

    // 90% source consensus, 10% recency. Missing-source models are mildly penalized
    // rather than being promoted by re-normalizing a single favorable benchmark.
    const evidenceFactor = sourceCount === 3 ? 1 : sourceCount === 2 ? 0.96 : 0.90;
    const consensus = capability == null ? null : clamp((capability * 0.90 + freshness * 0.10) * evidenceFactor);

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
    const value = consensus == null ? null : weighted([
      { value: consensus, weight: 0.72 },
      { value: affordability, weight: 0.28 },
    ]);

    const tier = consensus == null ? 'U' : consensus >= 88 ? 'S' : consensus >= 76 ? 'A' : consensus >= 62 ? 'B' : consensus >= 48 ? 'C' : 'D';

    return {
      ...model,
      provider: providerLabel(model),
      ranking: {
        consensus: round(consensus),
        power: round(consensus), // compatibility alias for existing chart/UI consumers
        capability: round(capability),
        freshness: round(freshness),
        evidence: Math.round(coverage * 100),
        sourceCount,
        affordability: round(affordability),
        value: round(value),
        context: round(context),
        reasoning: round(reasoning),
        coding: round(coding),
        agent: round(agent),
        tier,
      },
    };
  });

  const ordered = scored
    .filter(model => model.ranking.consensus != null)
    .sort((a, b) => b.ranking.consensus - a.ranking.consensus);
  const rankMap = new Map(ordered.map((model, index) => [model.id, index + 1]));

  return scored
    .map(model => ({ ...model, rank: rankMap.get(model.id) || null }))
    .sort((a, b) => (a.rank || 9999) - (b.rank || 9999))
    .map(({ _blendedCost, ...model }) => ({ ...model, blendedCost: _blendedCost }));
}
