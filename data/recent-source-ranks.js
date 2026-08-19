// Source-native evidence for recent models that may not yet have the same benchmark coverage
// as older models. These values remain labeled evidence; the site rank is normalized separately.
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
    // Context-only evidence. These fields are intentionally NOT mapped into unlike benchmark
    // families in the ranking formula. They support interpretation while preserving scale integrity.
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
      evidenceSummary: 'Artificial Analysis 60 (#8/182) and LLM Stats #6 are independent ranking evidence. Arena is still unavailable. KingBench 3 is independent coding context; Z.ai launch benchmarks are reported context and are not silently mixed onto incompatible scales.',
      estimate: {
        label: 'frontier-tier estimate',
        basis: 'Independent AA + LLM Stats, supported by independent KingBench and vendor-reported coding/agent results; Arena pending.',
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
