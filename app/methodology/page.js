import Link from 'next/link';
import { sources, RESEARCH_UPDATED } from '../../data/models';

export default function Methodology() {
  return <main className="methodPage shell">
    <Link href="/" className="back">← Rankings</Link>
    <span className="kicker">METHODOLOGY · {RESEARCH_UPDATED}</span>
    <h1>What the score means</h1>
    <p className="lead">The site separates provider availability and technical metadata from benchmark evidence. It does not fabricate missing fields: unknown data stays unknown.</p>
    <section><h2>Provider layer</h2><p>Venice and Morpheus are treated as inference providers. With server-side API keys configured, the catalog overlays current model availability every hour. Without keys, the site uses the checked-in research snapshot. Keys are never sent to the browser.</p></section>
    <section><h2>Composite tier score</h2><p>Available independent signals are normalized and reweighted: LLM Stats 35%, Artificial Analysis Intelligence Index 35%, KiloBench Terminal-Bench completion 15%, and Arena text Elo 15%. Missing signals are excluded rather than scored as zero.</p><p>Thresholds: S ≥57, A ≥51, B ≥44, C ≥36, D &lt;36. Models with no included independent benchmark signal are U (unranked). Confidence is the fraction of the four signal families present.</p></section>
    <section><h2>Quantization and precision</h2><p>Serving quantization is shown from Venice's live model metadata when available. Open-weight checkpoint precision is separately curated from first-party model cards. These are different concepts and should not be conflated.</p></section>
    <section><h2>Research sources</h2><ul>{Object.values(sources).map(s => <li key={s.url}><a href={s.url} target="_blank">{s.label} ↗</a></li>)}</ul></section>
    <section><h2>Update contract</h2><p>Provider availability is machine-updatable. Release dates, parameter counts, licenses, model cards and benchmark observations remain provenance-bearing research data so changes can be reviewed rather than silently guessed.</p></section>
  </main>;
}
