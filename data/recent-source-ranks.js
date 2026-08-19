// Evidence for recent models that may not yet have the same benchmark coverage as older models.
export const RECENT_SOURCE_RANKS = {
  'glm-5-3': {
    artificialAnalysis: {
      rank: 8,
      intelligence: 60,
      variant: 'max',
      snapshotDate: '2026-08-19',
    },
    llmStats: {
      rank: 6,
      overall: 54.7,
      reasoning: 54.9,
      coding: 45.4,
      agent: 41.8,
      snapshotDate: '2026-08-18',
    },
    // Additional benchmark context. These values are shown with their provenance and are not
    // combined with unrelated benchmark scales in the ranking formula.
    vendor: {
      cyberGym: 84.5,
      exploitBench: 54.4,
      terminalBench3: 28.3,
      deepSWE: 66.9,
      sweMarathon: 42.5,
      frontierSWE: 78.1,
      agentsLastExamCli: 28.5,
      hleTools: 62.5,
      automationBenchReported: 48.2,
    },
    independent: {
      kingBench3: 91.25,
    },
    meta: {
      releaseDate: '2026-08-14',
      paramsTotalB: 753,
      openness: 'Weights announced; not yet released',
      license: 'Pending',
      evidenceUpdated: '2026-08-19',
      evidenceState: 'independent-partial',
      evidenceSummary: 'GLM-5.3 is #8 on Artificial Analysis with an Intelligence Index score of 60 and #6 on LLM Stats. Arena has not published a result yet. MindStudio scored it at 91.25% on KingBench 3; several additional launch benchmarks come from Z.ai and are marked as vendor-reported.',
      estimate: {
        label: 'frontier-tier estimate',
        basis: 'Artificial Analysis and LLM Stats place it near the leading group, with strong KingBench 3 results and additional Z.ai coding and agent benchmarks. Arena is still pending.',
      },
      researchSources: [
        { label: 'Z.ai — GLM-5.3 developer documentation', kind: 'official', url: 'https://docs.z.ai/guides/llm/glm-5.3' },
        { label: 'Artificial Analysis — GLM-5.3 (max)', kind: 'independent benchmark', url: 'https://artificialanalysis.ai/models/glm-5-3' },
        { label: 'LLM Stats — overall leaderboard', kind: 'independent benchmark', url: 'https://llm-stats.com/leaderboards/llm-leaderboard' },
        { label: 'MindStudio — GLM-5.3 KingBench 3 results', kind: 'independent benchmark report', url: 'https://www.mindstudio.ai/blog/glm-5-3-benchmark-test-results' },
        { label: 'Emergent — GLM-5.3 benchmark audit', kind: 'benchmark audit', url: 'https://emergent.sh/learn/glm-5-3-benchmarks' },
        { label: 'Reuters — Z.ai GLM-5.3 launch metrics', kind: 'reported company results', url: 'https://www.reuters.com/technology/chinas-zai-says-new-model-nears-anthropics-mythos-5-cyber-defence-tests-2026-08-14/' },
        { label: 'Hacker News — GLM-5.3 discussion', kind: 'community', url: 'https://news.ycombinator.com/item?id=49353407' },
        { label: 'Arena — Text Overall', kind: 'pending benchmark', url: 'https://arena.ai/leaderboard/text' },
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
