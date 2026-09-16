// Current evidence overrides for recent/frontier models.
// Native source results remain source-specific. No missing benchmark is imputed.
export const RECENT_SOURCE_RANKS = {
  'claude-fable-5': {
    arena: { score: 1506, rank: 1, votes: 30057, spread: '1–7', snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 50, variant: 'Adaptive Reasoning, Max Effort', snapshotDate: '2026-09-16' },
    llmStats: { rank: 7, overall: 54.3, reasoning: 51.8, coding: 45.7, agent: 40.4, snapshotDate: '2026-09-16' },
  },
  'claude-opus-4-6': {
    arena: { score: 1505, rank: 2, votes: 71993, spread: '1–7', variant: 'high', snapshotDate: '2026-09-13' },
    meta: {
      evidenceUpdated: '2026-09-16',
      researchSources: [
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Venice — all models', kind: 'provider', url: 'https://docs.venice.ai/models/overview' },
      ],
    },
  },
  'claude-opus-4-7': {
    arena: { score: 1502, rank: 3, votes: 60002, spread: '1–10', variant: 'high', snapshotDate: '2026-09-13' },
    meta: {
      evidenceUpdated: '2026-09-16',
      researchSources: [
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Venice — all models', kind: 'provider', url: 'https://docs.venice.ai/models/overview' },
      ],
    },
  },
  'claude-fable-5-1': {
    arena: { score: 1498, rank: 5, votes: 5783, spread: '1–15', variant: 'max', snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 53, variant: 'Adaptive Reasoning, Max Effort, Default Fallback', snapshotDate: '2026-09-16' },
    llmStats: { rank: 2, overall: 55.7, reasoning: 52.8, coding: 35.5, agent: 41.3, snapshotDate: '2026-09-16' },
    meta: {
      releaseDate: '2026-09-01', context: 1000000, openness: 'Proprietary', license: 'Closed', evidenceUpdated: '2026-09-16',
      evidenceState: 'independent-current',
      evidenceSummary: 'Current evidence: Arena #5 (Sep. 13), Artificial Analysis Intelligence 53, and LLM Stats 55.7 / #2.',
      researchSources: [
        { label: 'Anthropic — Claude Fable 5.1', kind: 'official', url: 'https://www.anthropic.com/claude/fable' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Artificial Analysis — Claude Fable 5.1', kind: 'independent benchmark', url: 'https://artificialanalysis.ai/models/releases/claude-fable-5-1' },
        { label: 'LLM Stats — Claude Fable 5.1', kind: 'independent benchmark', url: 'https://llm-stats.com/models/claude-fable-5-1' },
        { label: 'Venice — all models', kind: 'provider', url: 'https://docs.venice.ai/models/overview' },
      ],
    },
  },
  'gemini-3-8-flash': {
    arena: { score: 1493, rank: 9, votes: 5076, spread: '1–24', variant: 'high', preliminary: true, snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 41, variant: 'high', snapshotDate: '2026-09-16' },
    llmStats: { rank: 16, overall: 50.6, reasoning: 46.9, coding: 38.5, agent: 35.8, snapshotDate: '2026-09-16' },
    meta: {
      releaseDate: '2026-09-02', context: 1048576, openness: 'Proprietary', license: 'Closed', evidenceUpdated: '2026-09-16',
      evidenceState: 'independent-current',
      evidenceSummary: 'Current evidence: Arena #9 (preliminary), Artificial Analysis Intelligence 41, and LLM Stats 50.6 / #16.',
      researchSources: [
        { label: 'Google — Gemini 3.8 Flash', kind: 'official', url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Artificial Analysis — Gemini 3.8 Flash', kind: 'independent benchmark', url: 'https://artificialanalysis.ai/models/gemini-3-8-flash' },
        { label: 'LLM Stats — Gemini 3.8 Flash', kind: 'independent benchmark', url: 'https://llm-stats.com/models/gemini-3.8-flash' },
        { label: 'Venice — all models', kind: 'provider', url: 'https://docs.venice.ai/models/overview' },
      ],
    },
  },
  'claude-opus-5': {
    arena: { score: 1493, rank: 10, votes: 42617, spread: '4–19', variant: 'high', snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 51, variant: 'max', snapshotDate: '2026-09-16' },
  },
  'gemini-3-7-flash': {
    arena: { score: 1490, rank: 12, votes: 5640, spread: '3–27', variant: 'high', preliminary: true, snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 39, variant: 'high', snapshotDate: '2026-09-16' },
  },
  'gemini-3-1-pro-preview': {
    arena: { score: 1487, rank: 15, votes: 106951, spread: '7–24', snapshotDate: '2026-09-13' },
  },
  'kimi-k3': {
    arena: { score: 1485, rank: 17, votes: 20987, spread: '7–30', variant: 'max', snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 44, variant: 'max', snapshotDate: '2026-09-16' },
    llmStats: { rank: 5, overall: 54.7, reasoning: 53.6, coding: 45.8, agent: 41.3, snapshotDate: '2026-09-09' },
  },
  'gpt-5-6-sol': {
    arena: { score: 1483, rank: 18, votes: 27069, spread: '9–32', variant: 'xhigh', snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 47, variant: 'max', snapshotDate: '2026-09-16' },
    llmStats: { rank: 3, overall: 54.9, reasoning: 54.0, coding: 46.0, agent: 41.2, snapshotDate: '2026-09-16' },
    meta: {
      evidenceUpdated: '2026-09-16',
      researchSources: [
        { label: 'OpenAI — GPT-5.6', kind: 'official', url: 'https://openai.com/index/gpt-5-6/' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Artificial Analysis — GPT-5.6 Sol', kind: 'independent benchmark', url: 'https://artificialanalysis.ai/models/gpt-5-6-sol' },
        { label: 'LLM Stats — GPT-5.6 Sol', kind: 'independent benchmark', url: 'https://llm-stats.com/models/gpt-5.6-sol' },
        { label: 'Venice — all models', kind: 'provider', url: 'https://docs.venice.ai/models/overview' },
      ],
    },
  },
  'glm-5-3': {
    arena: { score: 1483, rank: 19, votes: 10960, spread: '7–37', variant: 'max', snapshotDate: '2026-09-13' },
    artificialAnalysis: { rank: 1, rankScope: 'class', intelligence: 45, variant: 'max', snapshotDate: '2026-09-16' },
    llmStats: { rank: 9, overall: 52.8, reasoning: 51.9, coding: 42.8, agent: 39.6, snapshotDate: '2026-09-15' },
    vendor: { cyberGym: 84.5, exploitBench: 54.4, terminalBench3: 28.3, deepSWE: 66.9, sweMarathon: 42.5, frontierSWE: 78.1, agentsLastExamCli: 28.5, hleTools: 62.5, automationBenchReported: 48.2 },
    independent: { kingBench3: 91.25 },
    meta: {
      releaseDate: '2026-08-14', paramsTotalB: 753, paramsActiveB: 40, context: 1048576, openness: 'Open weights', license: 'GLM-5.3 License', evidenceUpdated: '2026-09-16',
      evidenceState: 'independent-current',
      evidenceSummary: 'Current independent evidence consistently places GLM-5.3 above GLM-5.2: Arena #19 vs #38, Artificial Analysis 45 vs 34, and LLM Stats 52.8/#9 vs 45.6/#28.',
      researchSources: [
        { label: 'Z.ai — GLM-5.3 developer documentation', kind: 'official', url: 'https://docs.z.ai/guides/llm/glm-5.3' },
        { label: 'Artificial Analysis — GLM-5.3 (max)', kind: 'independent benchmark', url: 'https://artificialanalysis.ai/models/glm-5-3' },
        { label: 'LLM Stats — GLM-5.3', kind: 'independent benchmark', url: 'https://llm-stats.com/models/glm-5.3' },
        { label: 'MindStudio — GLM-5.3 KingBench 3 results', kind: 'independent benchmark report', url: 'https://www.mindstudio.ai/blog/glm-5-3-benchmark-test-results' },
        { label: 'Emergent — GLM-5.3 benchmark audit', kind: 'benchmark audit', url: 'https://emergent.sh/learn/glm-5-3-benchmarks' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Hugging Face — GLM-5.3 model card', kind: 'official model card', url: 'https://huggingface.co/zai-org/GLM-5.3' },
        { label: 'Venice — all models', kind: 'provider', url: 'https://docs.venice.ai/models/overview' },
      ],
    },
  },
  'qwen3-8-max': {
    arena: { score: 1481, rank: 22, votes: 16670, spread: '10–39', snapshotDate: '2026-09-13' },
  },
  'gemini-3-6-flash': {
    arena: { score: 1480, rank: 23, votes: 26445, spread: '10–39', variant: 'high', snapshotDate: '2026-09-13' },
  },
  'gpt-6-astra': {
    arena: { score: 1480, rank: 24, votes: 2693, spread: '5–51', variant: 'max', snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 53, variant: 'max', snapshotDate: '2026-09-16' },
    meta: {
      releaseDate: '2026-09-04', context: 1050000, openness: 'Proprietary', license: 'Closed', evidenceUpdated: '2026-09-16',
      evidenceState: 'independent-partial',
      evidenceSummary: 'GPT-6 Astra is included because it is now provider-available and independently measured: Arena #24 on Sep. 13 and Artificial Analysis Intelligence 53 for the max-effort variant. No missing source is imputed.',
      researchSources: [
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Artificial Analysis — GPT-6 Astra', kind: 'independent benchmark', url: 'https://artificialanalysis.ai/models/gpt-6-astra' },
        { label: 'Venice — all models', kind: 'provider', url: 'https://docs.venice.ai/models/overview' },
      ],
    },
  },
  'glm-5-3-flash': {
    arena: { score: 1475, rank: 29, votes: 10038, spread: '14–49', snapshotDate: '2026-09-13' },
    artificialAnalysis: { rank: 3, rankScope: 'class', intelligence: 42, snapshotDate: '2026-09-16' },
    llmStats: { rank: 18, overall: 50.2, reasoning: 49.0, coding: 34.7, agent: 37.1, snapshotDate: '2026-09-16' },
    meta: {
      releaseDate: '2026-08-26', paramsTotalB: 320, paramsActiveB: 18, context: 1048576, openness: 'Open weights', license: 'MIT', evidenceUpdated: '2026-09-16',
      evidenceState: 'independent-current',
      evidenceSummary: 'Current evidence: Arena #29, Artificial Analysis Intelligence 42, and LLM Stats about 50.2 / #18.',
      researchSources: [
        { label: 'Artificial Analysis — GLM-5.3 Flash', kind: 'independent benchmark', url: 'https://artificialanalysis.ai/models/glm-5-3-flash' },
        { label: 'LLM Stats — GLM-5.3 Flash', kind: 'independent benchmark', url: 'https://llm-stats.com/models/glm-5.3-flash' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Venice — all models', kind: 'provider', url: 'https://docs.venice.ai/models/overview' },
        { label: 'Hugging Face — GLM-5.3-Flash model card', kind: 'official model card', url: 'https://huggingface.co/zai-org/GLM-5.3-Flash' },
      ],
    },
  },
  'glm-5-2': {
    arena: { score: 1472, rank: 38, votes: 36798, spread: '21–51', variant: 'max', snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 34, variant: 'max', snapshotDate: '2026-09-16' },
    llmStats: { rank: 28, overall: 45.6, reasoning: 45.0, coding: 35.5, agent: 30.3, snapshotDate: '2026-09-16' },
    meta: { evidenceUpdated: '2026-09-16' },
  },
  'xiaomi-mimo-v2-5': {
    arena: { score: 1467, rank: 44, votes: 60919, spread: '28–53', variant: 'pro', snapshotDate: '2026-09-13' },
    meta: {
      evidenceUpdated: '2026-09-16',
      researchSources: [
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Venice — all models', kind: 'provider', url: 'https://docs.venice.ai/models/overview' },
      ],
    },
  },
  'glm-5-1': {
    arena: { score: 1466, rank: 47, votes: 48901, spread: '30–56', snapshotDate: '2026-09-13' },
    llmStats: { rank: 60, overall: 39.2, reasoning: 38.9, coding: 30.6, agent: 24.2, snapshotDate: '2026-09-16' },
    meta: { evidenceUpdated: '2026-09-16' },
  },
  'deepseek-v4-pro-0813': {
    arena: { score: 1463, rank: 50, votes: 9008, spread: '28–68', variant: 'high', snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 36, variant: 'max', snapshotDate: '2026-09-09' },
    llmStats: { rank: 7, overall: 54.2, reasoning: 52.2, coding: 43.3, agent: 40.3, snapshotDate: '2026-08-18' },
    meta: {
      releaseDate: '2026-08-13', evidenceUpdated: '2026-09-16',
      researchSources: [
        { label: 'DeepSeek — Models & Pricing (V4-Pro-0813)', kind: 'official', url: 'https://api-docs.deepseek.com/quick_start/pricing/' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
      ],
    },
  },
  'minimax-m3': {
    arena: { score: 1441, rank: 84, votes: 48540, spread: '70–99', snapshotDate: '2026-09-13' },
    artificialAnalysis: { intelligence: 30, snapshotDate: '2026-09-16' },
  },
};
