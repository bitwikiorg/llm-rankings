import { VERIFIED_BENCHMARKS } from '../data/verified-benchmarks';
import { RECENT_SOURCE_RANKS } from '../data/recent-source-ranks';

const round = value => value == null ? null : Math.round(value * 10) / 10;
const get = (model, path) => path.split('.').reduce((value, key) => value?.[key], model);

function weighted(entries) {
  const usable = entries.filter(entry => entry.value != null && Number.isFinite(Number(entry.value)));
  if (!usable.length) return null;
  const total = usable.reduce((sum, entry) => sum + entry.weight, 0);
  return usable.reduce((sum, entry) => sum + Number(entry.value) * entry.weight, 0) / total;
}

function neutralComposite(entries, neutral = 50) {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  const available = entries.filter(entry => entry.value != null && Number.isFinite(Number(entry.value)));
  if (!available.length || !totalWeight) return { score: null, coverage: 0 };

  const score = entries.reduce((sum, entry) => {
    const value = entry.value != null && Number.isFinite(Number(entry.value)) ? Number(entry.value) : neutral;
    return sum + value * entry.weight;
  }, 0) / totalWeight;

  const coverage = available.reduce((sum, entry) => sum + entry.weight, 0) / totalWeight;
  return { score, coverage };
}

function percentile(models, path, value, direction = 'high') {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const values = models
    .map(model => Number(get(model, path)))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  if (!values.length) return null;
  if (values.length === 1) return 100;

  const target = Number(value);
  const lower = values.filter(item => item < target).length;
  const equal = values.filter(item => item === target).length;
  const midpoint = lower + Math.max(0, equal - 1) / 2;
  const pct = midpoint / (values.length - 1) * 100;
  return direction === 'low' ? 100 - pct : pct;
}

function blendedPrice(model) {
  const offers = Object.values(model.prices || {}).filter(price => price?.input != null || price?.output != null);
  if (!offers.length) return null;
  const costs = offers.map(price => Number(price.input || 0) * 0.35 + Number(price.output || 0) * 0.65);
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

  if (vendor) mergedBenchmarks.vendor = { ...(mergedBenchmarks.vendor || {}), ...vendor };

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

function coverageLabel(value) {
  if (value >= 0.85) return 'high';
  if (value >= 0.55) return 'medium';
  return 'low';
}

function publishedRanks(model) {
  const arena = model.benchmarks?.arena;
  const llmStats = model.benchmarks?.llmStats;
  const aa = model.benchmarks?.artificialAnalysis;

  return {
    arena: arena?.rank ? { rank: arena.rank, score: arena.score ?? null, votes: arena.votes ?? null, spread: arena.spread ?? null } : arena?.score != null ? { rank: null, score: arena.score, votes: arena.votes ?? null, spread: arena.spread ?? null } : null,
    llmStats: llmStats?.rank ? { rank: llmStats.rank, score: llmStats.overall ?? null } : llmStats?.overall != null ? { rank: null, score: llmStats.overall } : null,
    artificialAnalysis: aa?.rank ? { rank: aa.rank, score: aa.intelligence ?? null } : aa?.intelligence != null ? { rank: null, score: aa.intelligence } : null,
  };
}

function rankMetric(models, metric) {
  const eligible = models
    .filter(model => model.scores?.[metric] != null && Number.isFinite(Number(model.scores[metric])))
    .sort((a, b) => Number(b.scores[metric]) - Number(a.scores[metric]) || a.name.localeCompare(b.name));

  const ranks = new Map();
  let previousScore = null;
  let previousRank = 0;

  eligible.forEach((model, index) => {
    const score = Number(model.scores[metric]);
    const rank = previousScore != null && score === previousScore ? previousRank : index + 1;
    ranks.set(model.id, rank);
    previousScore = score;
    previousRank = rank;
  });

  return ranks;
}

export const INDEX_WEIGHTS = {
  overall: { arena: 0.45, artificialAnalysis: 0.30, llmStats: 0.25 },
  reasoning: { llmStatsReasoning: 0.55, artificialAnalysis: 0.25, gpqa: 0.20 },
  coding: { kilo: 0.45, llmStatsCoding: 0.35, terminalBench: 0.10, sweBenchPro: 0.10 },
  agent: { llmStatsAgent: 0.55, agentsLastExam: 0.20, automationBench: 0.15, osWorldVerified: 0.10 },
  value: { overall: 0.70, affordability: 0.30 },
};

export function enrichRankings(models) {
  const prepared = models.map(model => ({ ...prepareModel(model), _blendedCost: blendedPrice(model) }));
  const humanArena = prepared.filter(model => model.benchmarks?.arena?.rank != null);

  const scored = prepared.map(model => {
    const hasHumanArenaRank = model.benchmarks?.arena?.rank != null;
    const arenaPct = hasHumanArenaRank
      ? percentile(humanArena, 'benchmarks.arena.score', model.benchmarks?.arena?.score)
      : null;
    const aaPct = percentile(prepared, 'benchmarks.artificialAnalysis.intelligence', model.benchmarks?.artificialAnalysis?.intelligence);
    const llmPct = percentile(prepared, 'benchmarks.llmStats.overall', model.benchmarks?.llmStats?.overall);

    const overall = neutralComposite([
      { value: arenaPct, weight: INDEX_WEIGHTS.overall.arena },
      { value: aaPct, weight: INDEX_WEIGHTS.overall.artificialAnalysis },
      { value: llmPct, weight: INDEX_WEIGHTS.overall.llmStats },
    ]);

    const reasoning = neutralComposite([
      { value: percentile(prepared, 'benchmarks.llmStats.reasoning', model.benchmarks?.llmStats?.reasoning), weight: INDEX_WEIGHTS.reasoning.llmStatsReasoning },
      { value: aaPct, weight: INDEX_WEIGHTS.reasoning.artificialAnalysis },
      { value: percentile(prepared, 'benchmarks.vendor.gpqa', model.benchmarks?.vendor?.gpqa), weight: INDEX_WEIGHTS.reasoning.gpqa },
    ]);

    const coding = neutralComposite([
      { value: percentile(prepared, 'benchmarks.kilo.completion', model.benchmarks?.kilo?.completion), weight: INDEX_WEIGHTS.coding.kilo },
      { value: percentile(prepared, 'benchmarks.llmStats.coding', model.benchmarks?.llmStats?.coding), weight: INDEX_WEIGHTS.coding.llmStatsCoding },
      { value: percentile(prepared, 'benchmarks.vendor.terminalBench', model.benchmarks?.vendor?.terminalBench), weight: INDEX_WEIGHTS.coding.terminalBench },
      { value: percentile(prepared, 'benchmarks.vendor.sweBenchPro', model.benchmarks?.vendor?.sweBenchPro), weight: INDEX_WEIGHTS.coding.sweBenchPro },
    ]);

    const agent = neutralComposite([
      { value: percentile(prepared, 'benchmarks.llmStats.agent', model.benchmarks?.llmStats?.agent), weight: INDEX_WEIGHTS.agent.llmStatsAgent },
      { value: percentile(prepared, 'benchmarks.vendor.agentsLastExam', model.benchmarks?.vendor?.agentsLastExam), weight: INDEX_WEIGHTS.agent.agentsLastExam },
      { value: percentile(prepared, 'benchmarks.vendor.automationBench', model.benchmarks?.vendor?.automationBench), weight: INDEX_WEIGHTS.agent.automationBench },
      { value: percentile(prepared, 'benchmarks.vendor.osWorldVerified', model.benchmarks?.vendor?.osWorldVerified), weight: INDEX_WEIGHTS.agent.osWorldVerified },
    ]);

    const affordability = percentile(prepared, '_blendedCost', model._blendedCost, 'low');
    const context = percentile(prepared, 'context', model.context);
    const value = overall.score == null ? null : weighted([
      { value: overall.score, weight: INDEX_WEIGHTS.value.overall },
      { value: affordability, weight: INDEX_WEIGHTS.value.affordability },
    ]);

    const independentSources = [arenaPct, aaPct, llmPct].filter(value => value != null).length;

    return {
      ...model,
      provider: providerLabel(model),
      blendedCost: model._blendedCost,
      publishedRanks: publishedRanks(model),
      scores: {
        overall: round(overall.score),
        reasoning: round(reasoning.score),
        coding: round(coding.score),
        agent: round(agent.score),
        value: round(value),
        affordability: round(affordability),
        context: round(context),
      },
      coverage: {
        overall: round(overall.coverage * 100),
        reasoning: round(reasoning.coverage * 100),
        coding: round(coding.coverage * 100),
        agent: round(agent.coverage * 100),
        independentSources,
        independentSourceTotal: 3,
        confidence: overall.score == null ? 'none' : coverageLabel(overall.coverage),
      },
    };
  });

  const metrics = ['overall', 'reasoning', 'coding', 'agent', 'value', 'affordability', 'context'];
  const rankMaps = Object.fromEntries(metrics.map(metric => [metric, rankMetric(scored, metric)]));

  return scored
    .map(({ _blendedCost, ...model }) => ({
      ...model,
      metricRanks: Object.fromEntries(metrics.map(metric => [metric, rankMaps[metric].get(model.id) ?? null])),
    }))
    .sort((a, b) => {
      const rankA = a.metricRanks.overall ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.metricRanks.overall ?? Number.MAX_SAFE_INTEGER;
      return rankA - rankB || a.name.localeCompare(b.name);
    });
}
