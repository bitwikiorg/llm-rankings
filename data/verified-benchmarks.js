export const BENCHMARK_SNAPSHOT = {
  retrieved: '2026-08-18',
  arena: {
    url: 'https://arena.ai/leaderboard/text',
    sourceDate: '2026-08-12',
    rechecked: '2026-08-18',
    note: 'Arena Overall text leaderboard. Rank, score, vote count and rank spread are source-native. Exact lower-ranked rows were rechecked against the live Arena page on 2026-08-18.',
  },
  artificialAnalysis: {
    url: 'https://artificialanalysis.ai/leaderboards/models',
    sourceDate: '2026-08-18',
    note: 'Artificial Analysis Intelligence Index. Values are source-native and may correspond to max/high reasoning configurations.',
  },
  llmStats: {
    url: 'https://llm-stats.com/leaderboards/llm-leaderboard',
    sourceDate: '2026-08-18',
    note: 'LLM Stats composite and task indices. Used as an independent aggregate signal, not as vendor truth.',
  },
  kilo: {
    url: 'https://kilo.ai/leaderboard',
    sourceDate: '2026-08-18',
    note: 'Kilo coding benchmark. Used for coding, not the general aggregate rank.',
  },
};

// Checked observations override older seed data. Provider availability and provider
// pricing remain sourced separately from Venice/Morpheus. `meta` contains researched
// model facts or explicit evaluation-state notes and is never treated as a benchmark.
export const VERIFIED_BENCHMARKS = {
  'claude-fable-5': {
    arena: { score: 1506, rank: 1, votes: 21533, spread: '1–4', variant: 'claude-fable-5' },
    artificialAnalysis: { intelligence: 60, variant: 'Adaptive Reasoning, Max Effort, Opus 4.8 fallback' },
    llmStats: { overall: 56.7, reasoning: 54.3, coding: 47.2, agent: 43.6 },
    kilo: { completion: 71.0, costPerAttempt: 87.52, rank: 5 },
  },
  'claude-opus-5': {
    arena: { score: 1493, rank: 7, votes: 20030, spread: '3–16', variant: 'claude-opus-5-high' },
    artificialAnalysis: { intelligence: 61, variant: 'max' },
    llmStats: { overall: 56.3, reasoning: 55.4, coding: 42.7, agent: 41.5 },
    kilo: { completion: 71.5, costPerAttempt: 113.54, rank: 4 },
  },
  'qwen3-8-max': {
    arena: { score: 1491, rank: 8, votes: 7004, spread: '4–20', variant: 'qwen3.8-max' },
    llmStats: { overall: 53.3, reasoning: 52.0, coding: 42.3, agent: 40.0 },
  },
  'gemini-3-7-flash': {
    arena: { score: 1490, rank: 9, votes: 5744, spread: '3–20', variant: 'gemini-3.7-flash-high', preliminary: true },
    llmStats: { overall: 51.2, reasoning: 50.1, coding: 38.6, agent: 36.0 },
  },
  'kimi-k3': {
    arena: { score: 1489, rank: 12, votes: 11969, spread: '4–20', variant: 'kimi-k3-max' },
    artificialAnalysis: { intelligence: 57, variant: 'max' },
    llmStats: { overall: 55.6, reasoning: 55.0, coding: 44.6, agent: 42.4 },
    kilo: { completion: 72.8, costPerAttempt: 48.38, rank: 3 },
  },
  'gemini-3-6-flash': {
    arena: { score: 1484, rank: 16, votes: 13815, spread: '6–28', variant: 'gemini-3.6-flash-high' },
    artificialAnalysis: { intelligence: 50, variant: 'reasoning' },
  },
  'gpt-5-5': {
    arena: { score: 1482, rank: 17, votes: 55454, spread: '8–28', variant: 'gpt-5.5-high' },
    kilo: { completion: 74.2, costPerAttempt: 72.63, rank: 2 },
  },
  'gpt-5-6-sol': {
    arena: { score: 1481, rank: 19, votes: 15558, spread: '8–33', variant: 'gpt-5.6-sol-xhigh' },
    artificialAnalysis: { intelligence: 59, variant: 'max' },
    llmStats: { overall: 58.0, reasoning: 58.1, coding: 50.1, agent: 44.9 },
    kilo: { completion: 76.2, costPerAttempt: 87.41, rank: 1 },
  },
  'claude-opus-4-8': {
    arena: { score: 1474, rank: 27, votes: 41327, spread: '16–45', variant: 'claude-opus-4-8' },
    llmStats: { overall: 51.9, reasoning: 51.4, coding: 43.9, agent: 37.0 },
    kilo: { completion: 67.6, costPerAttempt: 85.19, rank: 8 },
  },
  'glm-5-2': {
    arena: { score: 1471, rank: 33, votes: 26973, spread: '20–46', variant: 'glm-5.2-max' },
    artificialAnalysis: { intelligence: 51, variant: 'max' },
  },
  'grok-4-5': {
    arena: { score: 1469, rank: 36, votes: 17848, spread: '20–50', variant: 'grok-4.5' },
    kilo: { completion: 70.8, costPerAttempt: 27.29, rank: 6 },
  },
  'deepseek-v4-pro': {
    arena: { score: 1458, rank: 51, votes: 54397, variant: 'deepseek-v4-pro' },
    artificialAnalysis: { intelligence: 44, variant: 'max' },
    kilo: { completion: 44.0, costPerAttempt: 15.91 },
  },

  // Rows previously shown as "U" but present in Arena Overall.
  'minimax-m2-7': {
    arena: { score: 1416, rank: 118, votes: 58418, spread: '102–132', variant: 'minimax-m2.7' },
  },
  'qwen3-coder-480b': {
    arena: { score: 1388, rank: 158, votes: 25814, spread: '144–169', variant: 'qwen3-coder-480b-a35b-instruct' },
  },
  'gpt-oss-120b': {
    arena: { score: 1352, rank: 193, votes: 30775, spread: '184–212', variant: 'gpt-oss-120b' },
  },
  'nvidia-nemotron-3-5-lightning': {
    arena: { score: 1348, rank: 198, votes: 3282, spread: '181–223', variant: 'nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4', preliminary: true },
  },
  'mercury-2': {
    arena: { score: 1346, rank: 203, votes: 3127, spread: '183–225', variant: 'mercury-2' },
  },

  // Exact human Arena ranks are not yet available for these configurations. Keep their
  // independent evidence visible and use the transparent fallback aggregate instead.
  'deepseek-v4-pro-0813': {
    meta: {
      evaluationState: 'Arena AutoEval · human rank pending',
      researchSources: [
        { label: 'Arena Text leaderboard', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'LLM Stats leaderboard', kind: 'benchmark', url: 'https://llm-stats.com/leaderboards/llm-leaderboard' },
      ],
    },
  },
  'glm-5-3': {
    meta: {
      evaluationState: 'Aggregate fallback · Arena rank pending',
      researchSources: [
        { label: 'Arena Text leaderboard', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'LLM Stats leaderboard', kind: 'benchmark', url: 'https://llm-stats.com/leaderboards/llm-leaderboard' },
      ],
    },
  },
  'mistral-small-4': {
    meta: {
      releaseDate: '2026-03-16',
      paramsTotalB: 119,
      paramsActiveB: 6.5,
      context: 256000,
      openness: 'Open weights',
      license: 'Apache 2.0',
      evaluationState: 'Independent benchmark coverage pending',
      researchSources: [
        { label: 'Mistral — Small 4 announcement', kind: 'official', url: 'https://mistral.ai/news/mistral-small-4/' },
        { label: 'Mistral — Small 4 model card', kind: 'official', url: 'https://docs.mistral.ai/models/model-cards/mistral-small-4-0-26-03' },
      ],
    },
  },
};
