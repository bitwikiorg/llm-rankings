import { VERIFIED_BENCHMARKS } from '../data/verified-benchmarks';
import { RECENT_SOURCE_RANKS } from '../data/recent-source-ranks';

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

function applyEvidenceLayer(model, layer) {
  if (!layer) return model;
  const { meta = {}, vendor, ...benchmarkOverrides } = layer;
  const mergedBenchmarks = { ...(model.benchmarks || {}) };

  for (const [key, value] of Object.entries(benchmarkOverrides)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      mergedBenchmarks[key] = { ...(mergedBenchmarks[key] || {}), ...value };
    } else {
      mergedBenchmarks[key] = value;
    }
  }

  if (vendor) {
    mergedBenchmarks.vendor = { ...(mergedBenchmarks.vendor || {}), ...vendor };
  }

  return {
    ...model,
    ...meta,
    benchmarks: mergedBenchmarks,
    researchSources: [
      ...(model.researchSources || []),
      ...(meta.researchSources || []),
    ],
  };
}

function prepareModel(model) {
  const verified = applyEvidenceLayer(model, VERIFIED_BENCHMARKS[model.id]);
  return applyEvidenceLayer(verified, RECENT_SOURCE_RANKS[model.id]);
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

function bestSourceRank(model) {
  const arenaRank = model.benchmarks?.arena?.rank;
  if (arenaRank) {
    return {
      source: 'arena',
      label: 'Arena',
      rank: arenaRank,
      score: model.benchmarks?.arena?.score ?? null,
      nativeScale: 'Bradley–Terry / Elo-like',
      confidence: 'human votes',
    };
  }

  const llmRank = model.benchmarks?.llmStats?.rank;
  if (llmRank) {
    return {
      source: 'llmStats',
      label: 'LLM Stats',
      rank: llmRank,
      score: model.benchmarks?.llmStats?.overall ?? null,
      nativeScale: 'LLM Stats native score',
      confidence: 'source-native rank',
    };
  }

  const aaRank = model.benchmarks?.artificialAnalysis?.rank;
  if (aaRank) {
    return {
      source: 'artificialAnalysis',
      label: 'Artificial Analysis',
      rank: aaRank,
      score: model.benchmarks?.artificialAnalysis?.intelligence ?? null,
      nativeScale: 'Intelligence Index',
      confidence: 'source-native rank',
    };
  }

  return null;
}

export function enrichRankings(models) {
  const prepared = models.map(model => ({ ...prepareModel(model), _blendedCost: blendedPrice(model) }));

  const scored = prepared.map(model => {
    const arenaRaw = model.benchmarks?.arena?.score ?? null;
    const aaRaw = model.benchmarks?.artificialAnalysis?.intelligence ?? null;
    const llmRaw = model.benchmarks?.llmStats?.overall ?? null;
    const arenaPct = percentile(prepared, 'benchmarks.arena.score', arenaRaw);
    const aaPct = percentile(prepared, 'benchmarks.artificialAnalysis.intelligence', aaRaw);
    const llmPct = percentile(prepared, 'benchmarks.llmStats.overall', llmRaw);

    const overallSources = [
      { key: 'arena', value: arenaPct, weight: 0.50 },
      { key: 'artificialAnalysis', value: aaPct, weight: 0.30 },
      { key: 'llmStats', value: llmPct, weight: 0.20 },
    ];
    const availableSources = overallSources.filter(source => source.value != null);
    const sourceCount = availableSources.length;

    // Research index remains a secondary internal analytic signal. It never replaces a
    // source-native rank in the UI and is not presented as a 0–100 model grade.
    const researchIndex = sourceCount ? weighted(overallSources) : null;

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
    const freshness = freshnessScore(model.releaseDate);
    const arenaRank = model.benchmarks?.arena?.rank || null;
    const primaryRank = bestSourceRank(model);
    const confidence = confidenceFor(sourceCount);

    return {
      ...model,
      provider: providerLabel(model),
      rank: arenaRank,
      primaryRank,
      ranking: {
        basis: primaryRank ? `${primaryRank.label} #${primaryRank.rank} · source-native` : sourceCount ? 'Independent evidence · no published source rank' : 'Awaiting independent evaluation',
        confidence,
        availableSources: availableSources.map(source => source.key),
        sourceCount,
        researchIndex: round(researchIndex),
        freshness: round(freshness),
        affordability: round(affordability),
        context: round(context),
        reasoning: round(reasoning),
        coding: round(coding),
        agent: round(agent),
        tier: arenaTier(arenaRank),
        tierBasis: arenaRank ? 'arena' : 'none',
      },
    };
  });

  const sourcePriority = { arena: 0, llmStats: 1, artificialAnalysis: 2 };

  return scored
    .map(model => ({
      ...model,
      displayRank: model.primaryRank ? `#${model.primaryRank.rank}` : null,
    }))
    .sort((a, b) => {
      if (a.primaryRank && b.primaryRank) {
        const byRank = a.primaryRank.rank - b.primaryRank.rank;
        if (byRank) return byRank;
        const bySource = (sourcePriority[a.primaryRank.source] ?? 9) - (sourcePriority[b.primaryRank.source] ?? 9);
        if (bySource) return bySource;
      }
      if (a.primaryRank) return -1;
      if (b.primaryRank) return 1;
      if (a.ranking.researchIndex != null && b.ranking.researchIndex != null) return b.ranking.researchIndex - a.ranking.researchIndex;
      if (a.ranking.researchIndex != null) return -1;
      if (b.ranking.researchIndex != null) return 1;
      return a.name.localeCompare(b.name);
    })
    .map(({ _blendedCost, ...model }) => ({ ...model, blendedCost: _blendedCost }));
}
