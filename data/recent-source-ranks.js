// Evidence for recent models that may not yet have the same benchmark coverage as older models.
export const RECENT_SOURCE_RANKS = {
  'glm-5-3': {
    arena: {
      score: 1487,
      rank: 13,
      votes: 3751,
      spread: '4–30',
      variant: 'max',
      snapshotDate: '2026-08-21',
    },
    artificialAnalysis: {
      rank: 9,
      intelligence: 60,
      variant: 'max',
      snapshotDate: '2026-08-26',
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
      evidenceUpdated: '2026-08-26',
      evidenceState: 'independent-partial',
      evidenceSummary: 'GLM-5.3 Max is #13 overall on Arena Text at 1487±10 (3,751 votes; Aug. 21 snapshot), #9 on Artificial Analysis with an Intelligence Index score of 60, and #6 on the Aug. 18 LLM Stats snapshot. MindStudio scored it at 91.25% on KingBench 3; several additional launch benchmarks come from Z.ai and are marked as vendor-reported.',
      estimate: {
        label: 'frontier-tier estimate',
        basis: 'Arena, Artificial Analysis, and LLM Stats now independently place GLM-5.3 near the leading group, with strong KingBench 3 results and additional Z.ai coding and agent benchmarks.',
      },
      researchSources: [
        { label: 'Z.ai — GLM-5.3 developer documentation', kind: 'official', url: 'https://docs.z.ai/guides/llm/glm-5.3' },
        { label: 'Artificial Analysis — GLM-5.3 (max)', kind: 'independent benchmark', url: 'https://artificialanalysis.ai/models/glm-5-3' },
        { label: 'LLM Stats — overall leaderboard', kind: 'independent benchmark', url: 'https://llm-stats.com/leaderboards/llm-leaderboard' },
        { label: 'MindStudio — GLM-5.3 KingBench 3 results', kind: 'independent benchmark report', url: 'https://www.mindstudio.ai/blog/glm-5-3-benchmark-test-results' },
        { label: 'Emergent — GLM-5.3 benchmark audit', kind: 'benchmark audit', url: 'https://emergent.sh/learn/glm-5-3-benchmarks' },
        { label: 'Reuters — Z.ai GLM-5.3 launch metrics', kind: 'reported company results', url: 'https://www.reuters.com/technology/chinas-zai-says-new-model-nears-anthropics-mythos-5-cyber-defence-tests-2026-08-14/' },
        { label: 'Hacker News — GLM-5.3 discussion', kind: 'community', url: 'https://news.ycombinator.com/item?id=49353407' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Kilo — GLM-5.3 model page', kind: 'provider benchmark catalog', url: 'https://kilo.ai/models/z-ai-glm-5-3' },
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
