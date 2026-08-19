// Recent models can appear on independent leaderboards before Arena has enough human votes
// for an exact Overall rank. Keep those source-native ranks instead of inventing a site score.
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
      evaluationState: 'LLM Stats #6 · Arena human rank pending',
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
      evaluationState: 'LLM Stats #7 · AA 53 · Arena human rank pending',
      researchSources: [
        { label: 'DeepSeek — Models & Pricing (V4-Pro-0813)', kind: 'official', url: 'https://api-docs.deepseek.com/quick_start/pricing/' },
        { label: 'LLM Stats — overall leaderboard', kind: 'benchmark', url: 'https://llm-stats.com/leaderboards/llm-leaderboard' },
        { label: 'Artificial Analysis — models leaderboard', kind: 'benchmark', url: 'https://artificialanalysis.ai/leaderboards/models' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
      ],
    },
  },
};
