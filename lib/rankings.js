const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export function computeScore(model) {
  const signals = [];
  const b = model.benchmarks || {};
  if (b.llmStats?.overall != null) signals.push({ key: 'LLM Stats', value: clamp(b.llmStats.overall / 100), weight: 0.35 });
  if (b.artificialAnalysis?.intelligence != null) signals.push({ key: 'Artificial Analysis', value: clamp(b.artificialAnalysis.intelligence / 100), weight: 0.35 });
  if (b.kilo?.completion != null) signals.push({ key: 'KiloBench', value: clamp(b.kilo.completion / 100), weight: 0.15 });
  if (b.arena?.score != null) signals.push({ key: 'Arena', value: clamp((b.arena.score - 1300) / 300), weight: 0.15 });
  if (!signals.length) return { score: null, tier: 'U', confidence: 0, signals: [] };
  const totalWeight = signals.reduce((s, x) => s + x.weight, 0);
  const score = signals.reduce((s, x) => s + x.value * x.weight, 0) / totalWeight;
  const pct = Math.round(score * 1000) / 10;
  const tier = pct >= 57 ? 'S' : pct >= 51 ? 'A' : pct >= 44 ? 'B' : pct >= 36 ? 'C' : 'D';
  const confidence = Math.round((signals.length / 4) * 100);
  return { score: pct, tier, confidence, signals: signals.map(s => s.key) };
}

export function enrichRankings(models) {
  return models
    .map(model => ({ ...model, ranking: computeScore(model) }))
    .sort((a, b) => (b.ranking.score ?? -1) - (a.ranking.score ?? -1))
    .map((model, index) => ({ ...model, rank: model.ranking.score == null ? null : index + 1 }));
}
