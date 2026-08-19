import Link from 'next/link';
import { sources, RESEARCH_UPDATED } from '../../data/models';
import { BENCHMARK_SNAPSHOT } from '../../data/verified-benchmarks';

export default function Methodology() {
  return <main className="methodPage shell">
    <Link href="/" className="back">← Rankings</Link>
    <span className="eyebrow">METHODOLOGY · {RESEARCH_UPDATED}</span>
    <h1>Never compare numbers from different scales.</h1>
    <p className="lead">Arena score, Artificial Analysis Intelligence Index, LLM Stats Score, β fallback index and provider price are different measurements. The site preserves each native scale, links to the source, and labels derived values as derived.</p>

    <section><h2>1. Primary ranking: Arena Overall human rank</h2><p>When an exact model/configuration has an Arena Overall human rank, that rank is authoritative for the default placement. Arena currently labels its rating simply <strong>Score</strong>. It is Bradley–Terry based and displayed on an Elo-like numeric scale; it is not a percentage. The UI preserves score, raw rank, votes, rank spread and configuration labels where available.</p><p><a href={BENCHMARK_SNAPSHOT.arena.url} target="_blank" rel="noreferrer">Open Arena Overall ↗</a></p></section>

    <section><h2>2. Native scales stay native</h2><table><thead><tr><th>Metric</th><th>Scale</th><th>Meaning</th></tr></thead><tbody><tr><td>Arena Score</td><td>Elo-like rating range</td><td>Bradley–Terry human-preference rating. Higher is better; not a percent.</td></tr><tr><td>Artificial Analysis Intelligence Index</td><td>0–100</td><td>Independent composite of current capability evaluations.</td></tr><tr><td>LLM Stats Score</td><td>Own TrueSkill-derived scale</td><td>Conservative rating based on μ − 3σ. Not numerically interchangeable with Arena or AA.</td></tr><tr><td>β fallback index</td><td>0–100</td><td>Site-derived percentile aggregate used only when exact human Arena rank is absent.</td></tr><tr><td>Provider price</td><td>USD / 1M tokens</td><td>Input / output token economics from Venice or Morpheus.</td></tr></tbody></table></section>

    <section><h2>3. No U grade; grades are Arena-only</h2><p>Missing Arena coverage is an evaluation state, not a quality grade. S/A/B/C/D are derived only from Arena Overall rank: S = top 10, A = top 25, B = top 50, C = top 100, D = ranked below 100. A fallback model receives a β rank within the fallback subset but <strong>no Arena grade</strong>. A model with no independent overall evidence is Pending.</p></section>

    <section><h2>4. Transparent β fallback</h2><p>If exact human Arena rank is unavailable but independent overall evidence exists, the site computes a β fallback index from the available overall source families: Arena score/AutoEval, Artificial Analysis Intelligence Index and LLM Stats Score. Raw values are never averaged directly because the scales are incomparable. Each available source value is first converted to its percentile within that source family, then combined using nominal weights of Arena 50%, Artificial Analysis 30% and LLM Stats 20%. Missing families are omitted and the remaining weights are re-normalized.</p><p>The result is explicitly a <strong>0–100 derived percentile index</strong>. A β value such as 55.6/100 is neither an Arena score nor an Artificial Analysis score.</p></section>

    <section><h2>5. Confidence follows evidence coverage</h2><p>Three available overall source families = high confidence, two = medium, one = low, and zero = none. The row detail exposes every component as <strong>raw source value → within-source percentile → effective weight</strong>. Release date has zero ranking weight.</p></section>

    <section><h2>6. Direct source links are part of the data contract</h2><p>Every benchmark family displayed in the leaderboard links directly to its source leaderboard. Model detail panels also expose first-party model references, provider documentation and model cards where available. Evidence should be inspectable without searching for the source manually.</p><ul><li><a href={sources.arena.url} target="_blank" rel="noreferrer">Arena Text leaderboard ↗</a></li><li><a href={sources.artificialAnalysis.url} target="_blank" rel="noreferrer">Artificial Analysis leaderboard ↗</a></li><li><a href={sources.llmStats.url} target="_blank" rel="noreferrer">LLM Stats leaderboard ↗</a></li><li><a href={sources.kilo.url} target="_blank" rel="noreferrer">Kilo coding leaderboard ↗</a></li></ul></section>

    <section><h2>7. Task benchmarks versus overall indexes</h2><p>Task benchmarks such as GPQA, SWE-bench, Terminal-Bench, HLE, OSWorld, SciCode and related evaluations answer narrower questions than an overall ranking. When an exact checked measurement exists in the snapshot, it appears in the model detail panel and remains contextual; it is not silently substituted for Arena rank.</p></section>

    <section><h2>8. Legacy benchmark coverage</h2><p>MMLU, HumanEval, MT-Bench and BBH are not currently in the checked repository snapshot. They are therefore not displayed as if complete. We do not borrow a score from another model revision, infer one from a family name, or manufacture a proxy. If exact model/configuration results are sourced later, they can be added with provenance. Current independent benchmark suites increasingly emphasize harder or more discriminating evaluations such as GPQA, HLE, SWE-bench, Terminal-Bench and SciCode.</p></section>

    <section><h2>9. Configuration labels matter</h2><p>Publishers may report max, high, xhigh, adaptive-reasoning, AutoEval or preliminary configurations. The site preserves those labels instead of pretending every observation refers to an identical inference configuration.</p></section>

    <section><h2>10. Provider availability is not capability</h2><p>Venice and Morpheus are inference providers. Provider IDs, prices, context limits and privacy properties remain provider-specific. Availability through one provider does not imply availability through the other.</p></section>

    <section><h2>Benchmark snapshot</h2><ul>{Object.entries(BENCHMARK_SNAPSHOT).filter(([key]) => key !== 'retrieved').map(([key, source]) => <li key={key}><a href={source.url} target="_blank" rel="noreferrer">{key === 'artificialAnalysis' ? 'Artificial Analysis' : key === 'llmStats' ? 'LLM Stats' : key[0].toUpperCase() + key.slice(1)} ↗</a> — source snapshot {source.sourceDate}. {source.note}</li>)}</ul></section>

    <section><h2>Research sources</h2><ul>{Object.entries(sources).map(([key, source]) => <li key={key}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a> — {source.kind}{source.primary ? ', direct source for the represented field' : ''}</li>)}</ul></section>

    <section><h2>Update contract</h2><p>Provider discovery is machine-updatable. Benchmark observations and researched model metadata are checked into the repository with provenance. When sources disagree or coverage is incomplete, the disagreement or uncertainty remains visible instead of being hidden by an opaque scalar.</p></section>
  </main>;
}
