import Link from 'next/link';
import { sources, RESEARCH_UPDATED } from '../../data/models';
import { BENCHMARK_SNAPSHOT } from '../../data/verified-benchmarks';

export default function Methodology() {
  return <main className="methodPage shell">
    <Link href="/" className="back">← Rankings</Link>
    <span className="eyebrow">METHODOLOGY · {RESEARCH_UPDATED}</span>
    <h1>Show the source before the score.</h1>
    <p className="lead">Arena Overall is the default source-native ranking. When an exact human Arena rank is unavailable, the site can use a clearly marked β aggregate from the independent overall benchmark families that actually contain the model. The source count and confidence are always exposed.</p>

    <section><h2>1. Primary ranking: Arena Overall</h2><p>When a model/configuration has an Arena Overall human rank, that rank is authoritative for the default placement. The UI preserves Arena score, rank, votes, rank spread and configuration labels where available.</p></section>

    <section><h2>2. No U grade</h2><p>Missing Arena coverage is an evaluation state, not a quality grade. The grade alphabet is S/A/B/C/D only. A model without enough independent evidence is shown as <strong>Pending</strong>, never U.</p></section>

    <section><h2>3. Transparent β fallback</h2><p>If an exact human Arena rank is unavailable but independent overall evidence exists, the model receives a β fallback aggregate. The candidate families are Arena score/AutoEval, Artificial Analysis Intelligence and LLM Stats Overall. Values are percentile-normalized within each source family and combined using nominal weights of Arena 50%, Artificial Analysis 30% and LLM Stats 20%. Missing families are omitted and the remaining weights are re-normalized.</p></section>

    <section><h2>4. Confidence follows evidence coverage</h2><p>Three available overall source families = high confidence, two = medium, one = low, and zero = none. A one-source β score is useful for orientation but is explicitly not equivalent to a human Arena rank. Release date has zero weight in the aggregate.</p></section>

    <section><h2>5. Grades expose their basis</h2><p>Arena-ranked models use source-rank bands: S = top 10, A = top 25, B = top 50, C = top 100, D = ranked below 100. When a model has no Arena rank but has aggregate evidence, its grade is marked with β so users can see immediately that the grade is aggregate-derived rather than Arena-derived.</p></section>

    <section><h2>6. Independent benchmark families stay independent</h2><p>Arena, Artificial Analysis, LLM Stats and Kilo measure different things on different scales. Their raw values remain visible. Kilo is coding-specific and is not part of the overall fallback aggregate.</p></section>

    <section><h2>7. Configuration labels matter</h2><p>Publishers may report max, high, xhigh, adaptive-reasoning, AutoEval or preliminary configurations. The site preserves those labels instead of pretending every observation refers to an identical inference configuration.</p></section>

    <section><h2>8. Provider availability is not capability</h2><p>Venice and Morpheus are inference providers. Provider IDs, prices, context limits and privacy properties remain provider-specific. Availability through one provider does not imply availability through the other.</p></section>

    <section><h2>9. Model metadata</h2><p>Release date, architecture, context, total and active parameters, license, quantization/precision and Hugging Face links prefer first-party model documentation. Unknown fields remain unknown rather than receiving guessed defaults.</p></section>

    <section><h2>Benchmark snapshot</h2><ul>{Object.entries(BENCHMARK_SNAPSHOT).filter(([key]) => key !== 'retrieved').map(([key, source]) => <li key={key}><a href={source.url} target="_blank" rel="noreferrer">{key === 'artificialAnalysis' ? 'Artificial Analysis' : key === 'llmStats' ? 'LLM Stats' : key[0].toUpperCase() + key.slice(1)} ↗</a> — source snapshot {source.sourceDate}. {source.note}</li>)}</ul></section>

    <section><h2>Research sources</h2><ul>{Object.entries(sources).map(([key, source]) => <li key={key}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a> — {source.kind}{source.primary ? ', direct source for the represented field' : ''}</li>)}</ul></section>

    <section><h2>Update contract</h2><p>Provider discovery is machine-updatable. Benchmark observations and researched model metadata are checked into the repository with provenance. When sources disagree or coverage is incomplete, the disagreement or uncertainty remains visible instead of being hidden by an opaque scalar.</p></section>
  </main>;
}
