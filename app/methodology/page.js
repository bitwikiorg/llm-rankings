import Link from 'next/link';
import { sources, RESEARCH_UPDATED } from '../../data/models';

export default function Methodology() {
  return <main className="methodPage shell">
    <Link href="/" className="back">← Rankings</Link>
    <span className="kicker">METHODOLOGY · {RESEARCH_UPDATED}</span>
    <h1>Rank evidence, not vibes.</h1>
    <p className="lead">The leaderboard keeps five different questions separate: how capable a model appears, how recent it is, where it is actually available, what each provider charges, and how strong the underlying evidence is.</p>

    <section><h2>1. Provider availability is explicit</h2><p>Venice and Morpheus are inference providers, not model creators. Every model has provider-specific IDs and provider-specific prices. A row marked <code>VENICE</code>, <code>MORPHEUS</code>, or both means the model appears in the checked provider catalog. When server-side provider API keys are configured, current catalogs overlay the researched snapshot hourly; otherwise the interface clearly labels the provider layer as a documented snapshot.</p></section>

    <section><h2>2. Capability signals are normalized within their own benchmark family</h2><p>Raw scores from Arena, LLM Stats, Artificial Analysis and Kilo are not directly comparable. The ranking engine converts each available metric to its percentile among tracked models for that same metric, then combines those percentiles. Capability weights are Arena 40%, LLM Stats 25%, Artificial Analysis 20%, and Kilo 15%. Missing signals are excluded and the remaining weights are renormalized; missing data is never scored as zero.</p></section>

    <section><h2>3. Recency is intentionally overweighted</h2><p>The main Power score is <strong>70% benchmark capability + 25% freshness + 5% evidence coverage</strong>. Freshness decays continuously from the release date. This is an explicit product choice: the site is meant to surface the current generation rather than let older, heavily benchmarked models dominate forever. A model still needs benchmark evidence to receive a Power rank; recency alone cannot create a ranked model.</p></section>

    <section><h2>4. Task scores stay separate</h2><p>Reasoning, coding and agent scores combine only related normalized observations. Reasoning uses sources such as LLM Stats reasoning, GPQA and Artificial Analysis when available. Coding uses coding-specific LLM Stats, Kilo completion, Terminal-Bench and SWE-bench observations. Agent score uses agent-specific LLM Stats and long-horizon or automation observations. Vendor-published benchmarks are displayed with provenance and are not silently treated as independent evidence.</p></section>

    <section><h2>5. Price and value</h2><p>Provider prices remain separate in the table and comparison view because the same model can cost different amounts on Venice and Morpheus. The Value index combines Power with an affordability percentile based on a blended input/output workload estimate. It is a navigation aid, not a universal cost model.</p></section>

    <section><h2>6. Technical metadata</h2><p>Context, total and active parameter counts, license, privacy mode, quantization/precision, capabilities, Hugging Face links, official release dates and provider IDs are treated as provenance-bearing metadata. Venice's live model endpoint can expose context, quantization, function calling, reasoning, vision, web search, privacy and model-source information. Open-weight checkpoint precision is kept conceptually distinct from serving quantization.</p></section>

    <section><h2>Research sources</h2><ul>{Object.entries(sources).map(([key, source]) => <li key={key}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a> — {source.kind}{source.primary ? ', primary source for this field' : ''}</li>)}</ul></section>

    <section><h2>Update contract</h2><p>Provider discovery is machine-updatable. Research metadata is checked into the repository so changes remain reviewable. Unknown release dates, parameter counts or benchmark values stay unknown until there is a defensible source. The interface should prefer an explicit blank over a plausible invention.</p></section>
  </main>;
}
