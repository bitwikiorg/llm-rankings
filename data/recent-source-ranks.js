// Evidence for recent models that may not yet have the same benchmark coverage as older models.
export const RECENT_SOURCE_RANKS = {
  'claude-fable-5': {
    arena: {
      score: 1508,
      rank: 1,
      votes: 27013,
      spread: '1–4',
      snapshotDate: '2026-09-02',
    },
  },
  'claude-fable-5-1': {
    meta: {
      releaseDate: '2026-09-01',
      openness: 'Proprietary',
      license: 'Closed',
      evidenceUpdated: '2026-09-02',
      evidenceState: 'provider-current',
      researchSources: [
        { label: 'Anthropic — Claude Fable 5.1', kind: 'official', url: 'https://www.anthropic.com/claude/fable' },
        { label: 'Venice — model pricing', kind: 'provider', url: 'https://docs.venice.ai/overview/pricing' },
        { label: 'Kilo — model leaderboard', kind: 'benchmark catalog', url: 'https://kilo.ai/leaderboard' },
      ],
    },
  },
  'claude-opus-5': {
    arena: {
      score: 1492,
      rank: 8,
      votes: 34718,
      spread: '4–17',
      variant: 'high',
      snapshotDate: '2026-09-02',
    },
  },
  'gemini-3-7-flash': {
    arena: {
      score: 1491,
      rank: 10,
      votes: 5682,
      spread: '3–23',
      variant: 'high',
      snapshotDate: '2026-09-02',
    },
  },
  'kimi-k3': {
    arena: {
      score: 1489,
      rank: 11,
      votes: 17908,
      spread: '4–23',
      variant: 'max',
      snapshotDate: '2026-09-02',
    },
  },
  'gemini-3-1-pro-preview': {
    arena: {
      score: 1487,
      rank: 14,
      votes: 102835,
      spread: '6–23',
      snapshotDate: '2026-09-02',
    },
  },
  'gpt-5-6-sol': {
    arena: {
      score: 1483,
      rank: 16,
      votes: 23206,
      spread: '7–31',
      variant: 'xhigh',
      snapshotDate: '2026-09-02',
    },
  },
  'glm-5-3': {
    arena: {
      score: 1482,
      rank: 18,
      votes: 7454,
      spread: '6–37',
      variant: 'max',
      snapshotDate: '2026-09-02',
    },
    artificialAnalysis: {
      rank: 2,
      intelligence: 60,
      variant: 'max',
      snapshotDate: '2026-09-02',
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
      paramsActiveB: 40,
      openness: 'Open weights',
      license: 'GLM-5.3 License',
      evidenceUpdated: '2026-09-02',
      evidenceState: 'independent-partial',
      evidenceSummary: 'GLM-5.3 Max is #18 overall on Arena Text at 1482±7 (7,454 votes; Sep. 2 snapshot), #2/111 on Artificial Analysis with an Intelligence Index score of 60, and #6 on the Aug. 18 LLM Stats snapshot. MindStudio scored it at 91.25% on KingBench 3; several additional launch benchmarks come from Z.ai and are marked as vendor-reported.',
      estimate: {
        label: 'frontier-tier estimate',
        basis: 'Arena, Artificial Analysis, and LLM Stats independently place GLM-5.3 in the frontier group, with strong KingBench 3 results and additional Z.ai coding and agent benchmarks.',
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
        { label: 'Hugging Face — GLM-5.3 model card and license', kind: 'official model card', url: 'https://huggingface.co/zai-org/GLM-5.3' },
      ],
    },
  },
  'z-ai-glm-5-3-flash': {
    arena: {
      score: 1473,
      rank: 31,
      votes: 4451,
      spread: '14–51',
      snapshotDate: '2026-09-02',
    },
    artificialAnalysis: {
      rank: 4,
      intelligence: 57,
      snapshotDate: '2026-09-02',
    },
    meta: {
      paramsTotalB: 320,
      paramsActiveB: 18,
      openness: 'Open weights',
      license: 'MIT',
      evidenceUpdated: '2026-09-02',
      evidenceState: 'independent-partial',
      evidenceSummary: 'GLM-5.3 Flash is #31 on Arena Text at 1473±9 (4,451 votes; Sep. 2 snapshot) and #4/111 on Artificial Analysis with an Intelligence Index score of 57. Venice lists the model at $0.15/M input and $0.50/M output with approximately 1.05M context.',
      researchSources: [
        { label: 'Artificial Analysis — GLM-5.3 Flash', kind: 'independent benchmark', url: 'https://artificialanalysis.ai/models/glm-5-3-flash' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
        { label: 'Venice — model pricing', kind: 'provider', url: 'https://docs.venice.ai/overview/pricing' },
        { label: 'Hugging Face — GLM-5.3-Flash model card', kind: 'official model card', url: 'https://huggingface.co/zai-org/GLM-5.3-Flash' },
      ],
    },
  },
  'gemini-3-6-flash': {
    arena: {
      score: 1480,
      rank: 20,
      votes: 22045,
      spread: '9–37',
      variant: 'high',
      snapshotDate: '2026-09-02',
    },
  },
  'qwen3-8-max': {
    arena: {
      score: 1479,
      rank: 21,
      votes: 13190,
      spread: '9–38',
      snapshotDate: '2026-09-02',
    },
  },
  'deepseek-v4-pro-0813': {
    arena: {
      score: 1459,
      rank: 51,
      votes: 5436,
      spread: '34–71',
      variant: 'high',
      snapshotDate: '2026-09-02',
    },
    artificialAnalysis: {
      rank: 6,
      intelligence: 53,
      variant: 'max',
      snapshotDate: '2026-09-02',
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
      evidenceUpdated: '2026-09-02',
      researchSources: [
        { label: 'DeepSeek — Models & Pricing (V4-Pro-0813)', kind: 'official', url: 'https://api-docs.deepseek.com/quick_start/pricing/' },
        { label: 'LLM Stats — overall leaderboard', kind: 'benchmark', url: 'https://llm-stats.com/leaderboards/llm-leaderboard' },
        { label: 'Artificial Analysis — DeepSeek V4 Pro 0813', kind: 'benchmark', url: 'https://artificialanalysis.ai/models/deepseek-v4-pro-0813' },
        { label: 'Arena — Text Overall', kind: 'benchmark', url: 'https://arena.ai/leaderboard/text' },
      ],
    },
  },
  'minimax-m3': {
    arena: {
      score: 1443,
      rank: 78,
      votes: 44600,
      spread: '65–93',
      snapshotDate: '2026-09-02',
    },
  },
};
