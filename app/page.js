'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const METRICS = [
  { key: 'overall', label: 'Overall', short: 'INDEX', description: '45% Arena · 30% Artificial Analysis · 25% LLM Stats', help: 'Primary LLM Index capability rank. Independent aggregate signals are normalized within the tracked Venice + Morpheus model population, then combined using the displayed weights.' },
  { key: 'reasoning', label: 'Reasoning', short: 'REASON', description: 'LLM Stats reasoning · AA intelligence · GPQA', help: 'Reasoning-oriented comparison using available reasoning aggregates and task measurements. Missing evidence is treated as uncertainty rather than a zero.' },
  { key: 'coding', label: 'Coding', short: 'CODE', description: 'Kilo · LLM Stats coding · Terminal-Bench · SWE-bench Pro', help: 'Coding comparison from independent coding leaderboards plus task-level software engineering benchmarks when available.' },
  { key: 'agent', label: 'Agents', short: 'AGENT', description: 'LLM Stats agent · agent/task benchmarks', help: 'Agentic capability comparison: tool use, autonomous task completion and agent benchmarks. Vendor-reported measurements are labeled separately from independent evidence.' },
  { key: 'value', label: 'Value', short: 'VALUE', description: '70% capability index · 30% token affordability', help: 'Capability-to-cost ranking. It combines 70% normalized Overall capability with 30% affordability across available Venice and Morpheus prices.' },
  { key: 'affordability', label: 'Price', short: 'PRICE', description: 'Lower blended provider token cost ranks higher', help: 'Relative affordability using a blended input/output token price. Lower cost receives the higher percentile and rank.' },
  { key: 'context', label: 'Context', short: 'CTX', description: 'Larger published context window ranks higher', help: 'Ranks the published context window available for the tracked model. Larger context ranks higher; this does not imply better model quality by itself.' },
];

const SOURCE_TIPS = {
  arena: 'Arena human-preference text leaderboard. Source-native ranks and scores are shown as evidence; they are not the LLM Index rank.',
  artificialAnalysis: 'Artificial Analysis Intelligence Index. Native scores/ranks remain on their original scale and contribute to supported LLM Index metrics.',
  llmStats: 'LLM Stats aggregate and task indices. Values remain source-native and are used as independent benchmark evidence.',
  kilo: 'Kilo coding leaderboard. Used as a coding signal rather than a general intelligence rank.',
  veniceModels: 'Venice model catalog used to determine which text models are available through Venice.',
  venicePricing: 'Venice pricing source for input/output token cost and provider metadata.',
  morModels: 'Morpheus model catalog used to determine which text models are available through Morpheus.',
  morPricing: 'Morpheus pricing source for input/output token cost and provider metadata.',
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
    {model.providers?.venice && <Tooltip className="provider-mark provider-venice" label="Available through Venice. V marks provider access, not benchmark quality.">V</Tooltip>}
    {model.providers?.morpheus && <Tooltip className="provider-mark provider-morpheus" label="Available through Morpheus. M marks provider access, not benchmark quality.">M</Tooltip>}
  </div>;
}

function Price({ model }) {
  const rows = providerOffers(model);
  if (!rows.length) return <span className="muted">—</span>;
  return <div className="price-stack">
    {rows.map(row => <Tooltip as="div" className="price-row" key={row.key} label={`${row.name} price in USD per 1M tokens. Left value is input; right value is output.`}>
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
    {!arena && !aa && !llm && <Tooltip className="muted" label="No tracked independent aggregate source currently publishes a usable result for this model. It remains pending rather than receiving a fabricated source rank.">Independent evidence pending</Tooltip>}
  </div>;
}

function allReferences(model, sources) {
  const sourceKeys = (model.sourceKeys || [])
    .map(key => ({ key, ...sources?.[key] }))
    .filter(item => item.url);
  const research = (model.researchSources || []).map((item, index) => ({ key: `research-${index}`, ...item }));
  const hf = model.huggingFace ? [{ key: 'hf', label: 'Hugging Face', kind: 'model', url: model.huggingFace }] : [];
  return [...sourceKeys, ...research, ...hf].filter((item, index, rows) => item.url && rows.findIndex(other => other.url === item.url) === index);
}

function RankCell({ model, metric }) {
  const rank = model.metricRanks?.[metric];
  const estimate = model.rankEstimates?.[metric];
  return <div className="rank-cell">
    <Tooltip label="LLM Index rank within the tracked Venice + Morpheus model population for the selected metric. This is our normalized comparative rank, not an external leaderboard rank.">{rank ? String(rank).padStart(2, '0') : '—'}</Tooltip>
    {estimate && <Tooltip as="small" label="Evidence-based estimate range. Available measurements are extrapolated while missing benchmark components remain explicitly pending; this never replaces a published external rank.">{estimateLabel(estimate)}</Tooltip>}
  </div>;
}

function ScoreCell({ model, metric }) {
  const score = model.scores?.[metric];
  const coverage = ['overall', 'reasoning', 'coding', 'agent'].includes(metric) ? model.coverage?.[metric] : null;
  return <div className="score-cell">
    <Tooltip as="strong" label="Normalized 0–100 LLM Index score for the selected metric. It is relative to the tracked provider-model population, not a universal benchmark scale.">{fmtScore(score)}</Tooltip>
    {coverage != null && <Tooltip label="Evidence coverage: the share of this metric's configured weight currently supported by observed measurements. Lower coverage means more uncertainty, not lower capability.">{coverage}% evidence</Tooltip>}
  </div>;
}

function MetricMini({ model, metric }) {
  const spec = METRICS.find(item => item.key === metric);
  const rank = model.metricRanks?.[metric];
  const estimate = model.rankEstimates?.[metric];
  return <Tooltip as="div" className="metric-mini" label={spec?.help || 'LLM Index metric.'}>
    <span>{spec?.short}</span>
    <strong>{rank ? `#${rank}` : '—'}</strong>
    <small>{estimate ? estimateLabel(estimate) : fmtScore(model.scores?.[metric])}</small>
  </Tooltip>;
}

function provenanceTip(provenance) {
  if (provenance === 'independent') return 'Independent measurement from a source outside the model vendor. It may still have its own methodology and limitations.';
  if (provenance === 'vendor-reported') return 'Reported by the model vendor or launch materials. Useful context, but not treated as independently reproduced evidence.';
  return 'Published task measurement retained on its source-native scale. Check the linked reference for methodology and provenance.';
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
      <div><span>{model.evidenceState === 'independent-partial' ? 'PARTIAL INDEPENDENT EVIDENCE' : 'EVIDENCE NOTE'}</span>{model.estimate?.label && <b>{model.estimate.label}</b>}</div>
      {model.evidenceSummary && <p>{model.evidenceSummary}</p>}
      {model.estimate?.basis && <small>Estimate basis: {model.estimate.basis}</small>}
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
        <h3>Published evidence</h3>
        <dl>
          <div><dt>Arena</dt><dd>{b.arena?.rank ? `#${b.arena.rank} · ${b.arena.score ?? '—'}${b.arena.votes ? ` · ${fmt(b.arena.votes)} votes` : ''}` : b.arena?.score != null ? `${b.arena.score} · ${b.arena.spread || 'unranked'}` : 'Pending'}</dd></div>
          <div><dt>Artificial Analysis</dt><dd>{b.artificialAnalysis?.intelligence != null ? `${b.artificialAnalysis.intelligence} Intelligence Index${b.artificialAnalysis.rank ? ` · #${b.artificialAnalysis.rank}` : ''}` : 'Pending'}</dd></div>
          <div><dt>LLM Stats</dt><dd>{b.llmStats?.overall != null ? `${b.llmStats.rank ? `#${b.llmStats.rank} · ` : ''}${b.llmStats.overall} overall` : 'Pending'}</dd></div>
          <div><dt>Kilo</dt><dd>{b.kilo?.completion != null ? `${b.kilo.completion}% completion${b.kilo.costPerAttempt != null ? ` · ${fmtPrice(b.kilo.costPerAttempt)}/attempt` : ''}` : 'Pending'}</dd></div>
        </dl>
      </section>

      <section>
        <h3>Task measurements</h3>
        {taskRows.length ? <div className="task-list">{taskRows.map(([label, value, provenance], index) => <div key={`${label}-${index}`}><span>{label}<Tooltip as="i" className={`provenance provenance-${provenance}`} label={provenanceTip(provenance)}>{provenance}</Tooltip></span><b>{value}%</b></div>)}</div> : <p className="muted">Task-level evidence pending.</p>}
      </section>
    </div>

    <div className="reference-block">
      <h3>References</h3>
      <div className="reference-links">
        {refs.map(ref => <SourceLink key={ref.key} href={ref.url} className="reference-link" tip={`${ref.kind || 'Source'} reference for ${model.name}. Opens the original source so the displayed claim can be checked directly.`}><small>{ref.kind || 'source'}</small><b>{ref.label}</b></SourceLink>)}
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
        <Tooltip label="Date of the current research snapshot. Provider catalogs may be live when API credentials are configured; benchmark evidence is independently timestamped in the data layer.">snapshot {data.updated || '—'}</Tooltip>
      </div>
    </header>

    <section className="hero shell">
      <div>
        <span className="eyebrow">TEXT MODEL RANKINGS</span>
        <h1>One index.<br /><em>Every signal.</em></h1>
      </div>
      <div className="hero-copy">
        <p>A compact ranking surface for text models available through Venice and Morpheus. Compare capability, reasoning, coding, agents, value, price and context without hunting across provider dashboards.</p>
        <p className="method-note">Index scores normalize heterogeneous benchmark evidence <b>within this provider model set</b>. Incomplete models keep a conservative rank and, where evidence is sufficient, an explicitly labeled estimate band. Published source ranks remain untouched.</p>
      </div>
    </section>

    <section className="source-rail shell" aria-label="Primary data sources">
      <Tooltip label="Primary provider and benchmark references used by the index. Hover or focus any source to see how it is used.">SOURCES</Tooltip>
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
        <Tooltip className="legend-item" label="Acid/lime numbers are LLM Index ranks: our site-owned relative ordering inside the tracked Venice + Morpheus population."><i className="legend-swatch rank" />Rank</Tooltip>
        <Tooltip className="legend-item" label="Cyan numbers are normalized LLM Index scores on a 0–100 relative scale for the selected metric."><i className="legend-swatch score" />Score</Tooltip>
        <Tooltip className="legend-item" label="Amber text marks an evidence-based estimate range when enough evidence exists to extrapolate but some configured measurements are still missing."><i className="legend-swatch estimate" />Estimate</Tooltip>
        <Tooltip className="legend-item" label="Outlined source chips are external published evidence. Their native ranks/scores are preserved and never presented as our site rank."><i className="legend-swatch evidence" />Published evidence</Tooltip>
        <Tooltip className="legend-item" label="V means Venice availability; M means Morpheus availability. Provider access is separate from capability ranking."><i className="legend-swatch access" />V / M access</Tooltip>
        <span className="legend-hint">Hover or focus <b>?</b> concepts anywhere</span>
      </div>

      <div className="toolbar">
        <label className="search-box"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search model or lab" /></label>
        <div className="provider-filter" role="group" aria-label="Provider filter">
          {[['all', 'All'], ['venice', 'Venice'], ['morpheus', 'Morpheus'], ['both', 'Both']].map(([key, label]) => <button key={key} type="button" onClick={() => setProvider(key)} className={provider === key ? 'active' : ''}>{label}</button>)}
        </div>
        <div className="result-count"><b>{models.length}</b><span>shown</span></div>
      </div>

      {loading && <div className="state-panel">Loading ranking data…</div>}
      {error && <div className="state-panel error">Unable to load rankings: {error}</div>}

      {!loading && !error && <div className="table-wrap">
        <table className="rank-table">
          <thead><tr>
            <th className="col-rank"><Tooltip label="Our relative rank for the selected metric among text models currently tracked from Venice and/or Morpheus.">Rank <i className="help-dot">?</i></Tooltip></th>
            <th><Tooltip label="Canonical model name and organization. Click any row to expand its model facts, benchmark evidence and references.">Model <i className="help-dot">?</i></Tooltip></th>
            <th className="col-score"><Tooltip label="Normalized 0–100 score for the active metric. This score determines the site rank; it is not a raw external benchmark score.">{activeMetric.label} <i className="help-dot">?</i></Tooltip></th>
            <th><Tooltip label="Source-native results from tracked independent leaderboards. These are evidence inputs and remain distinct from the LLM Index rank.">Published evidence <i className="help-dot">?</i></Tooltip></th>
            <th className="col-access"><Tooltip label="Provider availability. V = Venice; M = Morpheus. A model can appear on one or both providers.">Access <i className="help-dot">?</i></Tooltip></th>
            <th className="col-price"><Tooltip label="Provider token pricing in USD per 1M tokens. Each row is input / output; V and M identify the provider.">Price <small>in / out</small> <i className="help-dot">?</i></Tooltip></th>
            <th className="col-context"><Tooltip label="Published context-window capacity. K = thousand tokens; M = million tokens. Context size is ranked separately from model capability.">Context <i className="help-dot">?</i></Tooltip></th>
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
                  <td className="context-cell"><Tooltip as="b" label="Published context-window size for this model. This is informational unless Context is the selected ranking metric.">{fmtContext(model.context)}</Tooltip></td>
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
      <div className="method-title"><span>METHOD</span><h2>Transparent normalization.</h2></div>
      <div className="method-grid">
        <article><b>01</b><h3>Normalize</h3><p>Each tracked benchmark becomes a 0–100 percentile inside the Venice + Morpheus model set. Native scores and source ranks remain visible on their original scales.</p></article>
        <article><b>02</b><h3>Conservative rank</h3><p>Missing components receive a neutral 50 prior, never zero. This produces the primary site rank while evidence coverage states exactly how much of the formula is observed.</p></article>
        <article><b>03</b><h3>Estimate honestly</h3><p>When at least 55% of a metric is observed but evidence remains incomplete, available signals are extrapolated into a labeled estimate band. Missing sources remain pending; the estimate never impersonates a published rank.</p></article>
      </div>
      <div className="method-foot">
        <span>Provider counts: Venice {counts.venice} · Morpheus {counts.morpheus} · both {counts.both}</span>
        <span>Scores are comparative research signals, not claims of universal model quality.</span>
      </div>
    </section>

    <footer className="footer shell">
      <div className="footer-brand"><strong>Made by BITwiki</strong><span>LLM INDEX · standalone model intelligence for the BITwiki ecosystem.</span></div>
      <nav className="footer-links" aria-label="BITwiki ecosystem">
        <SourceLink href="https://bitwiki.org/">BITwiki</SourceLink>
        <SourceLink href="https://hub.bitwiki.org/">Visit BIThub</SourceLink>
        <SourceLink href="https://github.com/bitwikiorg/llm-rankings">GitHub</SourceLink>
      </nav>
    </footer>
  </main>;
}