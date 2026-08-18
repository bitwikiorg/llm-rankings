import Link from 'next/link';
import { sources, RESEARCH_UPDATED } from '../../data/models';
import { BENCHMARK_SNAPSHOT } from '../../data/verified-benchmarks';

export default function Methodology() {
  return <main className="methodPage shell">
    <Link href="/" className="back">← Rankings</Link>
    <span className="kicker">METHODOLOGY · {RESEARCH_UPDATED}</span>
    <h1>Show the source before the score.</h1>
    <p className="lead">The default leaderboard is Arena Overall because it is a source-native ranking. The site also shows Artificial Analysis, LLM Stats and Kilo independently. Consensus is a derived secondary view, not a claim that one synthetic number is ground truth.</p>

    <section><h2>1. Default ranking: Arena Overall</h2><p>Rows default to the model's Arena Overall position when that model/configuration is present on the Arena text leaderboard. The UI shows the source rank, score, vote count and configuration label where available. A model that ranks first on a coding benchmark does not automatically rank first overall.</p></section>

    <section><h2>2. Independent benchmark columns stay independent</h2><p>Arena, Artificial Analysis, LLM Stats and Kilo measure different things and use different scales. Their raw values are therefore displayed separately. Kilo is treated as a coding signal and is excluded from the general Consensus score.</p></section>

    <section><h2>3. Consensus is secondary and evidence-constrained</h2><p>Consensus requires at least two of three general benchmark families: Arena, Artificial Analysis and LLM Stats. Within the benchmark component, weights are Arena 50%, Artificial Analysis 30%, and LLM Stats 20%, normalized within each source family. The resulting score is <strong>90% benchmark consensus + 10% release recency</strong>. Models with only two general sources receive a small evidence penalty. Recency can break close ties; it cannot manufacture a frontier rank.</p></section>

    <section><h2>4. Configuration labels matter</h2><p>Benchmark publishers may report <code>max</code>, <code>high</code>, <code>xhigh</code>, adaptive-reasoning or other configurations. The site preserves those labels instead of pretending every benchmark number refers to an identical inference configuration. Cross-source comparisons should be read with that limitation visible.</p></section>

    <section><h2>5. Provider availability is not model capability</h2><p>Venice and Morpheus are inference providers. They have separate columns, provider IDs and prices. A Venice listing never implies Morpheus availability. When server-side API keys are configured, current provider catalogs overlay the checked research snapshot hourly; otherwise the UI labels them as documented catalog entries.</p></section>

    <section><h2>6. Task views</h2><p>Coding combines coding-specific evidence, led by Kilo and LLM Stats coding, with Terminal-Bench and SWE-bench observations when defensibly sourced. Reasoning and agent views likewise use task-relevant metrics. Vendor-published evaluations may be shown for context but are not silently substituted for independent benchmark evidence.</p></section>

    <section><h2>7. Model metadata</h2><p>Release date, context, total and active parameters, license, quantization/precision, capabilities, model IDs and Hugging Face links prefer first-party model or provider documentation. Unknown fields stay unknown. Provider serving quantization and downloadable checkpoint precision are distinct facts.</p></section>

    <section><h2>Benchmark snapshot</h2><ul>{Object.entries(BENCHMARK_SNAPSHOT).filter(([key]) => key !== 'retrieved').map(([key, source]) => <li key={key}><a href={source.url} target="_blank" rel="noreferrer">{key === 'artificialAnalysis' ? 'Artificial Analysis' : key === 'llmStats' ? 'LLM Stats' : key[0].toUpperCase() + key.slice(1)} ↗</a> — source snapshot {source.sourceDate}. {source.note}</li>)}</ul></section>

    <section><h2>Primary research sources</h2><ul>{Object.entries(sources).map(([key, source]) => <li key={key}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a> — {source.kind}{source.primary ? ', direct source for the represented field' : ''}</li>)}</ul></section>

    <section><h2>Update contract</h2><p>Provider discovery is machine-updatable. Benchmark observations and model metadata are checked into the repository with provenance so changes can be reviewed. When sources disagree, the site should expose the disagreement rather than erase it through an opaque aggregate.</p></section>
  </main>;
}
