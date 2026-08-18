const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const weighted = entries => {
  const usable = entries.filter(entry => entry.value != null && Number.isFinite(entry.value));
  if (!usable.length) return null;
  const weight = usable.reduce((sum, entry) => sum + entry.weight, 0);
  return usable.reduce((sum, entry) => sum + entry.value * entry.weight, 0) / weight;
};

const get = (model, path) => path.split('.').reduce((value, key) => value?.[key], model);

function percentile(models, path, value, direction = 'high') {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const values = models.map(model => Number(get(model, path))).filter(Number.isFinite).sort((a, b) => a - b);
  if (values.length < 2) return values.length ? 100 : null;
  const lower = values.filter(item => item < Number(value)).length;
  const equal = values.filter(item => item === Number(value)).length;
  const position = lower + Math.max(0, equal - 1) / 2;
  const pct = position / (values.length - 1) * 100;
  return direction === 'low' ? 100 - pct : pct;
}

function freshnessScore(date) {
  if (!date) return 45;
  const released = new Date(`${date}T00:00:00Z`).getTime();
  if (!Number.isFinite(released)) return 45;
  const ageDays = Math.max(0, (Date.now() - released) / 86400000);
  return clamp(Math.max(20, 100 * Math.exp(-ageDays / 365)));
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

export function enrichRankings(models) {
  const pricedModels = models.map(model => ({ ...model, _blendedCost: blendedPrice(model) }));

  const ranked = pricedModels.map(model => {
    const arenaPct = percentile(pricedModels, 'benchmarks.arena.score', model.benchmarks?.arena?.score);
    const llmPct = percentile(pricedModels, 'benchmarks.llmStats.overall', model.benchmarks?.llmStats?.overall);
    const aaPct = percentile(pricedModels, 'benchmarks.artificialAnalysis.intelligence', model.benchmarks?.artificialAnalysis?.intelligence);
    const kiloPct = percentile(pricedModels, 'benchmarks.kilo.completion', model.benchmarks?.kilo?.completion);

    const capability = weighted([
      { value: arenaPct, weight: 0.40 },
      { value: llmPct, weight: 0.25 },
      { value: aaPct, weight: 0.20 },
      { value: kiloPct, weight: 0.15 },
    ]);

    const reasoning = weighted([
      { value: percentile(pricedModels, 'benchmarks.llmStats.reasoning', model.benchmarks?.llmStats?.reasoning), weight: 0.50 },
      { value: percentile(pricedModels, 'benchmarks.vendor.gpqa', model.benchmarks?.vendor?.gpqa), weight: 0.35 },
      { value: aaPct, weight: 0.15 },
    ]);

    const coding = weighted([
      { value: percentile(pricedModels, 'benchmarks.llmStats.coding', model.benchmarks?.llmStats?.coding), weight: 0.35 },
      { value: kiloPct, weight: 0.35 },
      { value: percentile(pricedModels, 'benchmarks.vendor.terminalBench', model.benchmarks?.vendor?.terminalBench), weight: 0.15 },
      { value: percentile(pricedModels, 'benchmarks.vendor.sweBenchPro', model.benchmarks?.vendor?.sweBenchPro), weight: 0.15 },
    ]);

    const agent = weighted([
      { value: percentile(pricedModels, 'benchmarks.llmStats.agent', model.benchmarks?.llmStats?.agent), weight: 0.40 },
      { value: percentile(pricedModels, 'benchmarks.vendor.agentsLastExam', model.benchmarks?.vendor?.agentsLastExam), weight: 0.30 },
      { value: percentile(pricedModels, 'benchmarks.vendor.automationBench', model.benchmarks?.vendor?.automationBench), weight: 0.15 },
      { value: percentile(pricedModels, 'benchmarks.vendor.osWorldVerified', model.benchmarks?.vendor?.osWorldVerified), weight: 0.15 },
    ]);

    const freshness = freshnessScore(model.releaseDate);
    const familyCount = ['arena', 'llmStats', 'artificialAnalysis', 'kilo'].filter(key => model.benchmarks?.[key] && Object.keys(model.benchmarks[key]).length).length;
    const evidence = familyCount * 25;
    const affordability = percentile(pricedModels, '_blendedCost', model._blendedCost, 'low');
    const context = percentile(pricedModels, 'context', model.context);

    const power = capability == null ? null : clamp(capability * 0.70 + freshness * 0.25 + evidence * 0.05);
    const value = power == null ? null : weighted([
      { value: power, weight: 0.72 },
      { value: affordability, weight: 0.28 },
    ]);

    const tier = power == null ? 'U' : power >= 80 ? 'S' : power >= 68 ? 'A' : power >= 55 ? 'B' : power >= 42 ? 'C' : 'D';

    return {
      ...model,
      provider: providerLabel(model),
      ranking: {
        power: power == null ? null : Math.round(power * 10) / 10,
        capability: capability == null ? null : Math.round(capability * 10) / 10,
        freshness: Math.round(freshness * 10) / 10,
        evidence,
        affordability: affordability == null ? null : Math.round(affordability * 10) / 10,
        value: value == null ? null : Math.round(value * 10) / 10,
        context: context == null ? null : Math.round(context * 10) / 10,
        reasoning: reasoning == null ? null : Math.round(reasoning * 10) / 10,
        coding: coding == null ? null : Math.round(coding * 10) / 10,
        agent: agent == null ? null : Math.round(agent * 10) / 10,
        tier,
        benchmarkFamilies: familyCount,
      },
    };
  });

  const ordered = [...ranked].filter(model => model.ranking.power != null).sort((a, b) => b.ranking.power - a.ranking.power);
  const rankMap = new Map(ordered.map((model, index) => [model.id, index + 1]));

  return ranked
    .map(model => ({ ...model, rank: rankMap.get(model.id) || null }))
    .sort((a, b) => (a.rank || 9999) - (b.rank || 9999))
    .map(({ _blendedCost, ...model }) => ({ ...model, blendedCost: _blendedCost }));
}
