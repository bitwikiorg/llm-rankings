'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const METRICS = [
  { key: 'overall', label: 'Overall', short: 'INDEX', description: '45% Arena · 30% Artificial Analysis · 25% LLM Stats', help: 'A broad capability ranking that combines Arena, Artificial Analysis and LLM Stats. Each source is weighted as shown below the tabs.' },
  { key: 'reasoning', label: 'Reasoning', short: 'REASON', description: 'LLM Stats reasoning · Artificial Analysis · GPQA', help: 'Compares reasoning performance using reasoning-focused rankings and benchmark results. Models with less available data are shown with lower evidence coverage.' },
  { key: 'coding', label: 'Coding', short: 'CODE', description: 'Kilo · LLM Stats coding · Terminal-Bench · SWE-bench Pro', help: 'Compares programming and software-engineering performance using coding leaderboards and task benchmarks.' },
  { key: 'agent', label: 'Agents', short: 'AGENT', description: 'LLM Stats agent · tool-use and agent benchmarks', help: 'Compares how well models use tools and complete multi-step autonomous tasks. Third-party and developer-reported results are identified separately.' },
  { key: 'value', label: 'Value', short: 'VALUE', description: '70% Overall capability · 30% affordability', help: 'Balances model capability against token price. Stronger models at lower cost rank higher.' },
  { key: 'affordability', label: 'Price', short: 'PRICE', description: 'Lower blended input/output cost ranks higher', help: 'Compares token prices across Venice and Morpheus. Lower input/output cost produces a higher affordability rank.' },
  { key: 'context', label: 'Context', short: 'CTX', description: 'Larger context window ranks higher', help: 'Compares the published context-window size for each model. Context length is useful capacity information, not a measure of intelligence by itself.' },
];

const SOURCE_TIPS = {
  arena: 'Arena ranks models from human preference in head-to-head comparisons. The chip shows Arena’s published result.',
  artificialAnalysis: 'Artificial Analysis combines multiple intelligence benchmarks into its Intelligence Index. The chip shows its published score or rank.',
  llmStats: 'LLM Stats publishes aggregate rankings and task-specific scores across many models. The chip shows its published result.',
  kilo: 'Kilo evaluates coding models with practical coding tasks. It contributes to the Coding view.',
  veniceModels: 'Venice’s model catalog shows which text models are currently offered through Venice.',
  venicePricing: 'Venice’s pricing page provides input and output token prices.',
  morModels: 'Morpheus’s model catalog shows which text models are currently offered through Morpheus.',
  morPricing: 'Morpheus’s pricing information provides input and output token prices.',
};

const fmt = value => value == null ? '—' : Number(value).toLocaleString();
const fmtScore = value => value == null ? '—' : Number(value).toFixed(1);
const fmtContext = value => value == null ? '—' : value >= 1_000_000 ? `${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M` : `${Math.round(value / 1000)}K`;
const fmtPrice = value => value == null ? '—' : Number(value) < 0.1 ? `$${Number(value).toFixed(3)}` : `$${Number(value).toFixed(2)}`;
const fmtDate = date => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00Z`)) : 'Unknown';

function estimateLabel(estimate) {
  if (!estimate) return null;
  return estimate.best === estimate.worst ? `est #${estimate.best}` : `est #${estimate.best}–${estimate.worst}`;
}

function Tooltip({ label, as = 'span', className = '', children, ...props }) {
  const [tip, setTip] = useState(null);
  const Tag = as;

  const show = event => {
    if (typeof window === 'undefined') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.min(330, Math.max(220, window.innerWidth - 28));
    const half = width / 2;
    const left = Math.max(half + 14, Math.min(window.innerWidth - half - 14, rect.left + rect.width / 2));
    const below = rect.top < 120;
    setTip({ left, top: below ? rect.bottom + 9 : rect.top - 9, below, width });
  };

  const hide = () => setTip(null);
  const onMouseEnter = event => { props.onMouseEnter?.(event); show(event); };
  const onMouseLeave = event => { props.onMouseLeave?.(event); hide(); };
  const onFocus = event => { props.onFocus?.(event); show(event); };
  const onBlur = event => { props.onBlur?.(event); hide(); };
  const tagProps = { ...props, onMouseEnter, onMouseLeave, onFocus, onBlur };
  if (Tag !== 'button' && Tag !== 'a' && tagProps.tabIndex == null) tagProps.tabIndex = 0;

  return <>
    <Tag {...tagProps} className={`tip-anchor ${className}`.trim()} aria-label={props['aria-label'] || label}>{children}</Tag>
    {tip && typeof document !== 'undefined' && createPortal(
      <div className={`tip-popover ${tip.below ? 'below' : ''}`} role="tooltip" style={{ left: tip.left, top: tip.top, width: tip.width }}>{label}</div>,
      document.body
    )}
  </>;
}

function providerOffers(model) {
  return [
    model.prices?.venice && { key: 'venice', label: 'V', name: 'Venice', ...model.prices.venice },
    model.prices?.morpheus && { key: 'morpheus', label: 'M', name: 'Morpheus', ...model.prices.morpheus },
  ].filter(Boolean);
}

function sourceHref(sources, key) {
  return sources?.[key]?.url || null;
}

function SourceLink({ href, children, className = '', tip = '' }) {
  if (!href) return <span className={className}>{children}</span>;
  if (tip) return <Tooltip as="a" className={className} label={tip} href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true">↗</span></Tooltip>;
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true">↗</span></a>;
}

function ProviderMarks({ model }) {
  return <div className="provider-marks" aria-label="Provider availability">
    {model.providers?.venice && <Tooltip className="provider-mark provider-venice" label="Available through Venice.">V</Tooltip>}
    {model.providers?.morpheus && <Tooltip className="provider-mark provider-morpheus" label="Available through Morpheus.">M</Tooltip>}
  </div>;
}

function Price({ model }) {
  const rows = providerOffers(model);
  if (!rows.length) return <span className="muted">—</span>;
  return <div className="price-stack">
    {rows.map(row => <Tooltip as="div" className="price-row" key={row.key} label={`${row.name}: USD per 1M tokens. Input price is on the left; output price is on the right.`}>
      <span>{row.label}</span><b>{fmtPrice(row.input)}</b><i>/</i><b>{fmtPrice(row.output)}</b>
    </Tooltip>)}
  </div>;
}

function Evidence({ model, sources }) {
  const arena = model.publishedRanks?.arena;
  const llm = model.publishedRanks?.llmStats;
  const aa = model.publishedRanks?.artificialAnalysis;

  return <div className="evidence-stack">
    {arena && <SourceLink tip={SOURCE_TIPS.arena} href={sourceHref(sources, 'arena')} className="evidence-link"><span>Arena</span><b>{arena.rank ? `#${arena.rank}` : arena.score}</b></SourceLink>}
    {aa && <SourceLink tip={SOURCE_TIPS.artificialAnalysis} href={sourceHref(sources, 'artificialAnalysis')} className="evidence-link"><span>AA</span><b>{aa.rank ? `#${aa.rank}` : aa.score}</b></SourceLink>}
    {llm && <SourceLink tip={SOURCE_TIPS.llmStats} href={sourceHref(sources, 'llmStats')} className="evidence-link"><span>LLM</span><b>{llm.rank ? `#${llm.rank}` : llm.score}</b></SourceLink>}
    {!arena && !aa && !llm && <Tooltip className="muted" label="Arena, Artificial Analysis and LLM Stats do not currently publish a usable result for this model.">Results pending</Tooltip>}
  </div>;
}

function allReferences(model, sources) {
  const sourceKeys = (model.sourceKeys || []).map(key => ({ key, ...sources?.[key] })).filter(item => item.url);
  const research = (model.researchSources || []).map((item, index) => ({ key: `research-${index}`, ...item }));
  const hf = model.huggingFace ? [{ key: 'hf', label: 'Hugging Face', kind: 'model', url: model.huggingFace }] : [];
  return [...sourceKeys, ...research, ...hf].filter((item, index, rows) => item.url && rows.findIndex(other => other.url === item.url) === index);
}

function RankCell({ model, metric }) {
  const rank = model.metricRanks?.[metric];
  const estimate = model.rankEstimates?.[metric];
  return <div className="rank-cell">
    <Tooltip label="Position among models in this index for the selected metric.">{rank ? String(rank).padStart(2, '0') : '—'}</Tooltip>
    {estimate && <Tooltip as="small" label="Estimated placement from the benchmark results currently available. A wider range means more uncertainty.">{estimateLabel(estimate)}</Tooltip>}
  </div>;
}

function ScoreCell({ model, metric }) {
  const score = model.scores?.[metric];
  const coverage = ['overall', 'reasoning', 'coding', 'agent'].includes(metric) ? model.coverage?.[metric] : null;
  return <div className="score-cell">
    <Tooltip as="strong" label="0–100 comparison score for the selected metric. Scores are relative to the models in this index.">{fmtScore(score)}</Tooltip>
    {coverage != null && <Tooltip label="How much of this metric is supported by available benchmark results. Higher coverage means less missing data.">{coverage}% evidence</Tooltip>}
  </div>;
}

function MetricMini({ model, metric }) {
  const spec = METRICS.find(item => item.key === metric);
  const rank = model.metricRanks?.[metric];
  const estimate = model.rankEstimates?.[metric];
  return <Tooltip as="div" className="metric-mini" label={spec?.help || 'Ranking metric.'}>
    <span>{spec?.short}</span>
    <strong>{rank ? `#${rank}` : '—'}</strong>
    <small>{estimate ? estimateLabel(estimate) : fmtScore(model.scores?.[metric])}</small>
  </Tooltip>;
}

function provenanceTip(provenance) {
  if (provenance === 'independent') return 'Measured by a third party rather than the model developer.';
  if (provenance === 'vendor-reported') return 'Published by the model developer or in launch materials; useful context, but not independently verified here.';
  return 'Published benchmark result. Open the source below for its methodology and details.';
}

function Detail({ model, sources }) {
  const refs = allReferences(model, sources);
  const b = model.benchmarks || {};
  const vendor = b.vendor || {};
  const independent = b.independent || {};
  const taskRows = [
    ['KingBench 3', independent.kingBench3, 'independent'],
    ['GPQA', vendor.gpqa, 'published'],
    ['Terminal-Bench', vendor.terminalBench, 'published'],
    ['Terminal-Bench 3.0', vendor.terminalBench3, 'vendor-reported'],
    ['DeepSWE v1.1', vendor.deepSWE, 'vendor-reported'],
    ['SWE-Marathon v1.1', vendor.sweMarathon, 'vendor-reported'],
    ['FrontierSWE', vendor.frontierSWE, 'vendor-reported'],
    ['SWE-bench Pro', vendor.sweBenchPro, 'published'],
    ["Agents' Last Exam", vendor.agentsLastExam, 'published'],
    ["Agents' Last Exam CLI", vendor.agentsLastExamCli, 'vendor-reported'],
    ['AutomationBench', vendor.automationBench, 'published'],
    ['AutomationBench', vendor.automationBenchReported, 'vendor-reported'],
    ['OSWorld', vendor.osWorldVerified, 'published'],
    ["Humanity's Last Exam", vendor.hle, 'published'],
    ['HLE with Tools', vendor.hleTools, 'vendor-reported'],
    ['FrontierMath', vendor.frontierMath, 'published'],
    ['CyberGym', vendor.cyberGym, 'vendor-reported'],
    ['ExploitBench', vendor.exploitBench, 'vendor-reported'],
  ].filter(([, value]) => value != null);

  return <div className="detail-panel">
    <div className="detail-metrics">
      {['overall', 'reasoning', 'coding', 'agent', 'value'].map(metric => <MetricMini key={metric} model={model} metric={metric} />)}
    </div>

    {(model.evidenceSummary || model.estimate) && <div className="model-brief">
      <div><span>{model.evidenceState === 'independent-partial' ? 'PARTIAL COVERAGE' : 'DATA NOTE'}</span>{model.estimate?.label && <b>{model.estimate.label}</b>}</div>
      {model.evidenceSummary && <p>{model.evidenceSummary}</p>}
      {model.estimate?.basis && <small>Why this estimate: {model.estimate.basis}</small>}
    </div>}

    <div className="detail-grid">
      <section>
        <h3>Model</h3>
        <dl>
          <div><dt>Organization</dt><dd>{model.organization || '—'}</dd></div>
          <div><dt>Released</dt><dd>{fmtDate(model.releaseDate)}</dd></div>
          <div><dt>Parameters</dt><dd>{model.paramsTotalB ? `${model.paramsTotalB}B${model.paramsActiveB ? ` · ${model.paramsActiveB}B active` : ''}` : 'Unknown'}</dd></div>
          <div><dt>Precision</dt><dd>{model.quantization || 'Not published'}</dd></div>
          <div><dt>License</dt><dd>{model.license || model.openness || 'Unknown'}</dd></div>
          <div><dt>Availability</dt><dd>{model.openness || 'Unknown'}</dd></div>
          <div><dt>Capabilities</dt><dd>{(model.capabilities || []).join(' · ') || 'Unknown'}</dd></div>
        </dl>
      </section>

      <section>
        <h3>External rankings</h3>
        <dl>
          <div><dt>Arena</dt><dd>{b.arena?.rank ? `#${b.arena.rank} · ${b.arena.score ?? '—'}${b.arena.votes ? ` · ${fmt(b.arena.votes)} votes` : ''}` : b.arena?.score != null ? `${b.arena.score} · ${b.arena.spread || 'unranked'}` : 'Pending'}</dd></div>
          <div><dt>Artificial Analysis</dt><dd>{b.artificialAnalysis?.intelligence != null ? `${b.artificialAnalysis.intelligence} Intelligence Index${b.artificialAnalysis.rank ? ` · #${b.artificialAnalysis.rank}` : ''}` : 'Pending'}</dd></div>
          <div><dt>LLM Stats</dt><dd>{b.llmStats?.overall != null ? `${b.llmStats.rank ? `#${b.llmStats.rank} · ` : ''}${b.llmStats.overall} overall` : 'Pending'}</dd></div>
          <div><dt>Kilo</dt><dd>{b.kilo?.completion != null ? `${b.kilo.completion}% completion${b.kilo.costPerAttempt != null ? ` · ${fmtPrice(b.kilo.costPerAttempt)}/attempt` : ''}` : 'Pending'}</dd></div>
        </dl>
      </section>

      <section>
        <h3>Benchmark results</h3>
        {taskRows.length ? <div className="task-list">{taskRows.map(([label, value, provenance], index) => <div key={`${label}-${index}`}><span>{label}<Tooltip as="i" className={`provenance provenance-${provenance}`} label={provenanceTip(provenance)}>{provenance}</Tooltip></span><b>{value}%</b></div>)}</div> : <p className="muted">No task-level results available yet.</p>}
      </section>
    </div>

    <div className="reference-block">
      <h3>Sources</h3>
      <div className="reference-links">
        {refs.map(ref => <SourceLink key={ref.key} href={ref.url} className="reference-link" tip={`Open the original ${ref.kind || 'source'} for ${model.name}.`}><small>{ref.kind || 'source'}</small><b>{ref.label}</b></SourceLink>)}
      </div>
    </div>
  </div>;
}

export default function Home() {
  const [data, setData] = useState({ models: [], status: {}, sources: {}, updated: '' });
  const [metric, setMetric] = useState('overall');
  const [provider, setProvider] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    fetch('/api/models')
      .then(response => {
        if (!response.ok) throw new Error(`API ${response.status}`);
        return response.json();
      })
      .then(payload => { if (alive) setData(payload); })
      .catch(err => { if (alive) setError(err.message || 'Unable to load rankings'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const activeMetric = METRICS.find(item => item.key === metric) || METRICS[0];

  const models = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...(data.models || [])]
      .filter(model => {
        if (provider === 'venice' && !model.providers?.venice) return false;
        if (provider === 'morpheus' && !model.providers?.morpheus) return false;
        if (provider === 'both' && !(model.providers?.venice && model.providers?.morpheus)) return false;
        if (term && !`${model.name} ${model.organization} ${model.id}`.toLowerCase().includes(term)) return false;
        return true;
      })
      .sort((a, b) => {
        const rankA = a.metricRanks?.[metric] ?? Number.MAX_SAFE_INTEGER;
        const rankB = b.metricRanks?.[metric] ?? Number.MAX_SAFE_INTEGER;
        return rankA - rankB || a.name.localeCompare(b.name);
      });
  }, [data.models, metric, provider, query]);

  const counts = useMemo(() => ({
    total: data.models?.length || 0,
    venice: data.models?.filter(model => model.providers?.venice).length || 0,
    morpheus: data.models?.filter(model => model.providers?.morpheus).length || 0,
    both: data.models?.filter(model => model.providers?.venice && model.providers?.morpheus).length || 0,
  }), [data.models]);

  const coreSources = [
    ['arena', 'Arena'],
    ['artificialAnalysis', 'Artificial Analysis'],
    ['llmStats', 'LLM Stats'],
    ['kilo', 'Kilo'],
    ['veniceModels', 'Venice models'],
    ['venicePricing', 'Venice pricing'],
    ['morModels', 'Morpheus models'],
    ['morPricing', 'Morpheus pricing'],
  ];

  return <main>
    <div className="signal-line" />
    <header className="site-header shell">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true"><i /><i /><i /></div>
        <div><strong>LLM INDEX</strong><span>VENICE × MORPHEUS</span></div>
      </div>
      <div className="header-meta">
        <span>{counts.total} text models</span>
        <Tooltip label="Date when the rankings and model information on this page were last refreshed.">Updated {data.updated || '—'}</Tooltip>
      </div>
    </header>

    <section className="hero shell">
      <div>
        <span className="eyebrow">TEXT MODEL RANKINGS</span>
        <h1>One index.<br /><em>Every signal.</em></h1>
      </div>
      <div className="hero-copy">
        <p>A compact ranking surface for text models available through Venice and Morpheus. Compare capability, reasoning, coding, agents, value, price and context without hunting across provider dashboards.</p>
        <p className="method-note">Scores combine several public benchmarks into a 0–100 comparison for the models in this index. When benchmark data is missing, the score stays conservative; when enough data is available, an estimate range shows where the model may place.</p>
      </div>
    </section>

    <section className="source-rail shell" aria-label="Data sources">
      <Tooltip label="Benchmark, model-catalog and pricing sources used on this page.">SOURCES</Tooltip>
      <div>{coreSources.map(([key, label]) => <SourceLink key={key} tip={SOURCE_TIPS[key]} href={sourceHref(data.sources, key)}>{label}</SourceLink>)}</div>
    </section>

    <section className="rank-surface shell">
      <div className="metric-rail" role="tablist" aria-label="Ranking metric">
        {METRICS.map(item => <Tooltip as="button" label={item.help} key={item.key} className={metric === item.key ? 'active' : ''} onClick={() => { setMetric(item.key); setExpanded(null); }} type="button">
          <span>{item.short}</span><b>{item.label}</b>
        </Tooltip>)}
      </div>

      <div className="metric-context">
        <div><span>RANKING BY</span><strong>{activeMetric.label}</strong></div>
        <p>{activeMetric.description}</p>
      </div>

      <div className="legend-strip" aria-label="How to read the index">
        <Tooltip className="legend-item" label="Green numbers are the position in this index for the selected metric."><i className="legend-swatch rank" />Rank</Tooltip>
        <Tooltip className="legend-item" label="Cyan numbers are the 0–100 comparison score used for the selected metric."><i className="legend-swatch score" />Score</Tooltip>
        <Tooltip className="legend-item" label="Amber text shows an estimated placement when some benchmark results are still unavailable."><i className="legend-swatch estimate" />Estimate</Tooltip>
        <Tooltip className="legend-item" label="These chips show results published by Arena, Artificial Analysis, LLM Stats or other benchmark sources."><i className="legend-swatch evidence" />External results</Tooltip>
        <Tooltip className="legend-item" label="V means the model is on Venice; M means it is on Morpheus."><i className="legend-swatch access" />V / M access</Tooltip>
        <span className="legend-hint">Hover or focus <b>?</b> for definitions</span>
      </div>

      <div className="toolbar">
        <label className="search-box"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search model or lab" /></label>
        <div className="provider-filter" role="group" aria-label="Provider filter">
          {[['all', 'All'], ['venice', 'Venice'], ['morpheus', 'Morpheus'], ['both', 'Both']].map(([key, label]) => <button key={key} type="button" onClick={() => setProvider(key)} className={provider === key ? 'active' : ''}>{label}</button>)}
        </div>
        <div className="result-count"><b>{models.length}</b><span>shown</span></div>
      </div>

      {loading && <div className="state-panel">Loading rankings…</div>}
      {error && <div className="state-panel error">Unable to load rankings: {error}</div>}

      {!loading && !error && <div className="table-wrap">
        <table className="rank-table">
          <thead><tr>
            <th className="col-rank"><Tooltip label="Position in this index for the selected metric.">Rank <i className="help-dot">?</i></Tooltip></th>
            <th><Tooltip label="Model name and developer. Select a row to see more details and sources.">Model <i className="help-dot">?</i></Tooltip></th>
            <th className="col-score"><Tooltip label="0–100 comparison score for the selected metric.">{activeMetric.label} <i className="help-dot">?</i></Tooltip></th>
            <th><Tooltip label="Results published by external benchmark and leaderboard sources.">External results <i className="help-dot">?</i></Tooltip></th>
            <th className="col-access"><Tooltip label="Where the model is available: V = Venice, M = Morpheus.">Access <i className="help-dot">?</i></Tooltip></th>
            <th className="col-price"><Tooltip label="USD per 1M tokens. Input price appears before the slash; output price after it.">Price <small>in / out</small> <i className="help-dot">?</i></Tooltip></th>
            <th className="col-context"><Tooltip label="Maximum published context-window size. K = thousand tokens; M = million tokens.">Context <i className="help-dot">?</i></Tooltip></th>
            <th className="col-open" aria-label="Details" />
          </tr></thead>
          <tbody>
            {models.map(model => {
              const isOpen = expanded === model.id;
              return <Fragment key={model.id}>
                <tr className={isOpen ? 'model-row open' : 'model-row'} onClick={() => setExpanded(isOpen ? null : model.id)}>
                  <td><RankCell model={model} metric={metric} /></td>
                  <td className="model-cell"><strong>{model.name}</strong><span>{model.organization}</span></td>
                  <td><ScoreCell model={model} metric={metric} /></td>
                  <td><Evidence model={model} sources={data.sources} /></td>
                  <td><ProviderMarks model={model} /></td>
                  <td><Price model={model} /></td>
                  <td className="context-cell"><Tooltip as="b" label="Maximum published context-window size for this model.">{fmtContext(model.context)}</Tooltip></td>
                  <td className="open-cell"><button type="button" aria-label={`${isOpen ? 'Close' : 'Open'} ${model.name} details`} onClick={event => { event.stopPropagation(); setExpanded(isOpen ? null : model.id); }}>{isOpen ? '−' : '+'}</button></td>
                </tr>
                {isOpen && <tr className="detail-row"><td colSpan="8"><Detail model={model} sources={data.sources} /></td></tr>}
              </Fragment>;
            })}
          </tbody>
        </table>
        {!models.length && <div className="state-panel">No models match these filters.</div>}
      </div>}
    </section>

    <section className="method shell" id="method">
      <div className="method-title"><span>HOW IT WORKS</span><h2>One scale, several benchmarks.</h2></div>
      <div className="method-grid">
        <article><b>01</b><h3>Combine benchmarks</h3><p>Each benchmark is converted to a percentile among the models in this index. That lets different score scales contribute to one comparison without treating unlike raw scores as equivalent.</p></article>
        <article><b>02</b><h3>Handle missing data</h3><p>If a benchmark result is missing, it contributes a neutral midpoint rather than a failing score. Evidence coverage shows how much of the selected metric is backed by available results.</p></article>
        <article><b>03</b><h3>Show uncertainty</h3><p>When at least 55% of the data for a metric is available, an estimated rank range is also shown. A wider range means more uncertainty while additional benchmark results are pending.</p></article>
      </div>
      <div className="method-foot">
        <span>Venice {counts.venice} models · Morpheus {counts.morpheus} models · {counts.both} available on both</span>
        <span>Rankings update as new model and benchmark results become available.</span>
      </div>
    </section>

    <footer className="footer shell">
      <div className="footer-brand"><strong>Made by BITwiki</strong><span>LLM INDEX · a standalone tool from the BITwiki ecosystem.</span></div>
      <nav className="footer-links" aria-label="BITwiki ecosystem">
        <SourceLink href="https://bitwiki.org/">BITwiki</SourceLink>
        <SourceLink href="https://hub.bitwiki.org/">Visit BIThub</SourceLink>
        <SourceLink href="https://github.com/bitwikiorg/llm-rankings">GitHub</SourceLink>
      </nav>
    </footer>
  </main>;
}