// Source-native evidence for recent models that may not yet have the same benchmark coverage
// as older models. These values remain labeled evidence; the site rank is normalized separately.
export const RECENT_SOURCE_RANKS = {
  'glm-5-3': {
    llmStats: {
      rank: 6,
      overall: 54.7,
      reasoning: 54.9,
      coding: 45.4,
      agent: 41.8,
      snapshotDate: '2026-08-18',
    },
    vendor: {
      cyberGym: 84.5,
      exploitBench: 54.4,
    },
    meta: {
      releaseDate: '2026-08-14',
      releaseDateLabel: 'announced / limited launch',
      researchSources: [
        { label: 'LLM Stats — overall leaderboard', kind: 'benchmark', url: 'https://llm-stats.com/leaderboards/llm-leaderboard' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Reuters — Z.ai GLM-5.3 launch metrics', kind: 'reported company results', url: 'https://www.reuters.com/technology/chinas-zai-says-new-model-nears-anthropics-mythos-5-cyber-defence-tests-2026-08-14/' },
      ],
    },
  },
  'deepseek-v4-pro-0813': {
    arena: {
      score: 1465,
      rank: null,
      votes: null,
      spread: 'AutoEval',
    },
    artificialAnalysis: {
      intelligence: 53,
      variant: 'reasoning',
    },
    llmStats: {
      rank: 7,
      overall: 54.2,
      reasoning: 52.2,
      coding: 43.3,
      agent: 40.3,
      snapshotDate: '2026-08-18',
    },
    meta: {
      releaseDate: '2026-08-13',
      researchSources: [
        { label: 'DeepSeek — Models & Pricing (V4-Pro-0813)', kind: 'official', url: 'https://api-docs.deepseek.com/quick_start/pricing/' },
        { label: 'LLM Stats — overall leaderboard', kind: 'benchmark', url: 'https://llm-stats.com/leaderboards/llm-leaderboard' },
        { label: 'Artificial Analysis — models leaderboard', kind: 'benchmark', url: 'https://artificialanalysis.ai/leaderboards/models' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
      ],
    },
  },
};
