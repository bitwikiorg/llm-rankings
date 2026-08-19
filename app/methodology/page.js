import Link from 'next/link';
import { sources, RESEARCH_UPDATED } from '../../data/models';
import { BENCHMARK_SNAPSHOT } from '../../data/verified-benchmarks';

export default function Methodology() {
  return <main className="methodPage shell">
    <Link href="/" className="back">← Rankings</Link>
    <span className="eyebrow">METHODOLOGY · {RESEARCH_UPDATED}</span>
    <h1>Use a published rank before inventing one.</h1>
    <p className="lead">The primary display is source-native. Arena Overall human rank is preferred. If a very recent exact model has no Arena human rank but another tracked source publishes an overall rank, that source-native rank can be used directly and is labeled in the row.</p>

    <section><h2>1. Rank hierarchy</h2><p>The default hierarchy is <strong>Arena Overall human rank → LLM Stats overall rank → Artificial Analysis model rank → Pending</strong>. A model does not receive a synthetic 0–100 fallback score just because Arena has not accumulated enough human votes yet.</p></section>

    <section><h2>2. Arena remains the preferred source</h2><p>When an exact model/configuration has an Arena Overall human rank, that rank is the preferred placement. Arena's displayed score is a Bradley–Terry human-preference rating on an Elo-like scale; it is not a percentage. The site preserves rank, score, votes, spread and configuration labels where available.</p><p><a href={BENCHMARK_SNAPSHOT.arena.url} target="_blank" rel="noreferrer">Open Arena Overall ↗</a></p></section>

    <section><h2>3. New models are not automatically “unranked”</h2><p>Release cadence is faster than every benchmark's evaluation cycle. If a new model is already ranked by LLM Stats or another independent source, that published position is useful evidence. The row therefore says, for example, <strong>#6 · LLM Stats</strong> rather than inventing a beta score or pretending the position came from Arena.</p></section>

    <section><h2>4. Native scales stay native</h2><table><thead><tr><th>Metric</th><th>Scale</th><th>Meaning</th></tr></thead><tbody><tr><td>Arena Score</td><td>Elo-like rating</td><td>Human-preference Bradley–Terry score. Higher is better.</td></tr><tr><td>LLM Stats Score</td><td>LLM Stats native scale</td><td>Shown beside its published rank; not numerically comparable with Arena.</td></tr><tr><td>Artificial Analysis Intelligence Index</td><td>0–100</td><td>Independent composite across current capability evaluations.</td></tr><tr><td>Provider price</td><td>USD / 1M tokens</td><td>Input / output economics from Venice or Morpheus.</td></tr></tbody></table></section>

    <section><h2>5. Grades are Arena-only</h2><p>S/A/B/C/D remains a visual summary of Arena Overall human-rank bands only: S = top 10, A = top 25, B = top 50, C = top 100, D = ranked below 100. A model ranked through LLM Stats does not receive a fake Arena grade.</p></section>

    <section><h2>6. Supporting evidence remains visible</h2><p>Artificial Analysis, Arena AutoEval/score-only observations, LLM Stats task scores, Kilo coding, GPQA, SWE-bench, Terminal-Bench, HLE, CyberGym and other checked measurements remain visible in model details. They support interpretation without being silently collapsed into one unexplained scalar.</p></section>

    <section><h2>7. Direct source links are part of the contract</h2><ul><li><a href={sources.arena.url} target="_blank" rel="noreferrer">Arena Text leaderboard ↗</a></li><li><a href={sources.artificialAnalysis.url} target="_blank" rel="noreferrer">Artificial Analysis leaderboard ↗</a></li><li><a href={sources.llmStats.url} target="_blank" rel="noreferrer">LLM Stats leaderboard ↗</a></li><li><a href={sources.kilo.url} target="_blank" rel="noreferrer">Kilo coding leaderboard ↗</a></li></ul></section>

    <section><h2>8. Missing benchmark data stays missing</h2><p>MMLU, HumanEval, MT-Bench and BBH are not currently complete in the checked repository snapshot. We do not borrow scores from another model revision or manufacture proxies. New exact measurements can be added when sourced.</p></section>

    <section><h2>Benchmark snapshot</h2><ul>{Object.entries(BENCHMARK_SNAPSHOT).filter(([key]) => key !== 'retrieved').map(([key, source]) => <li key={key}><a href={source.url} target="_blank" rel="noreferrer">{key === 'artificialAnalysis' ? 'Artificial Analysis' : key === 'llmStats' ? 'LLM Stats' : key[0].toUpperCase() + key.slice(1)} ↗</a> — source snapshot {source.sourceDate}. {source.note}</li>)}</ul></section>

    <section><h2>Research sources</h2><ul>{Object.entries(sources).map(([key, source]) => <li key={key}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a> — {source.kind}{source.primary ? ', direct source for the represented field' : ''}</li>)}</ul></section>

    <section><h2>Update contract</h2><p>Provider discovery is machine-updatable. Benchmark observations and researched metadata are checked into the repository with provenance. When a newer source publishes a rank for an exact model configuration, it can replace a weaker provisional basis without changing the meaning of older source-native numbers.</p></section>
  </main>;
}
