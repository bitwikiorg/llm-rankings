export const BENCHMARK_SNAPSHOT = {
  retrieved: '2026-08-18',
  arena: {
    url: 'https://arena.ai/leaderboard/text',
    sourceDate: '2026-08-12',
    note: 'Arena Overall text leaderboard. Rank and score are source-native; some model families expose effort-specific variants.',
  },
  artificialAnalysis: {
    url: 'https://artificialanalysis.ai/leaderboards/models',
    sourceDate: '2026-08-18',
    note: 'Artificial Analysis Intelligence Index. Values are source-native and may correspond to max/high reasoning configurations.',
  },
  llmStats: {
    url: 'https://llm-stats.com/leaderboards/llm-leaderboard',
    sourceDate: '2026-07-26',
    note: 'LLM Stats composite and task indices. Used as an independent aggregate signal, not as vendor truth.',
  },
  kilo: {
    url: 'https://kilo.ai/leaderboard',
    sourceDate: '2026-08-18',
    note: 'Kilo coding benchmark. Used for coding, not the general consensus rank.',
  },
};

// Explicit corrections/refreshes from the source pages above. These override older
// checked-in benchmark observations only; provider availability and model facts remain
// sourced from Venice/Morpheus and first-party model documentation.
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
};
