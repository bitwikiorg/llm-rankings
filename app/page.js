'use client';

import { useEffect, useMemo, useState } from 'react';

const METRICS = [
  { key: 'overall', label: 'Overall', short: 'INDEX', description: '45% Arena · 30% Artificial Analysis · 25% LLM Stats' },
  { key: 'reasoning', label: 'Reasoning', short: 'REASON', description: 'LLM Stats reasoning · AA intelligence · GPQA' },
  { key: 'coding', label: 'Coding', short: 'CODE', description: 'Kilo · LLM Stats coding · Terminal-Bench · SWE-bench Pro' },
  { key: 'agent', label: 'Agents', short: 'AGENT', description: 'LLM Stats agent · agent/task benchmarks' },
  { key: 'value', label: 'Value', short: 'VALUE', description: '70% capability index · 30% token affordability' },
  { key: 'affordability', label: 'Price', short: 'PRICE', description: 'Lower blended provider token cost ranks higher' },
  { key: 'context', label: 'Context', short: 'CTX', description: 'Larger published context window ranks higher' },
];

const fmt = value => value == null ? '—' : Number(value).toLocaleString();
const fmtScore = value => value == null ? '—' : Number(value).toFixed(1);
const fmtContext = value => value == null ? '—' : value >= 1_000_000 ? `${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M` : `${Math.round(value / 1000)}K`;
const fmtPrice = value => value == null ? '—' : Number(value) < 0.1 ? `$${Number(value).toFixed(3)}` : `$${Number(value).toFixed(2)}`;
const fmtDate = date => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00Z`)) : 'Unknown';

function estimateLabel(estimate) {
  if (!estimate) return null;
  return estimate.best === estimate.worst ? `est #${estimate.best}` : `est #${estimate.best}–${estimate.worst}`;
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

function SourceLink({ href, children, className = '' }) {
  if (!href) return <span className={className}>{children}</span>;
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true">↗</span></a>;
}

function ProviderMarks({ model }) {
  return <div className="provider-marks" aria-label="Provider availability">
    {model.providers?.venice && <span className="provider-mark provider-venice" title="Available on Venice">V</span>}
    {model.providers?.morpheus && <span className="provider-mark provider-morpheus" title="Available on Morpheus">M</span>}
  </div>;
}

function Price({ model }) {
  const rows = providerOffers(model);
  if (!rows.length) return <span className="muted">—</span>;
  return <div className="price-stack">
    {rows.map(row => <div className="price-row" key={row.key} title={`${row.name} · USD / 1M tokens · input / output`}>
      <span>{row.label}</span><b>{fmtPrice(row.input)}</b><i>/</i><b>{fmtPrice(row.output)}</b>
    </div>)}
  </div>;
}

function Evidence({ model, sources }) {
  const arena = model.publishedRanks?.arena;
  const llm = model.publishedRanks?.llmStats;
  const aa = model.publishedRanks?.artificialAnalysis;

  return <div className="evidence-stack">
    {arena && <SourceLink href={sourceHref(sources, 'arena')} className="evidence-link"><span>Arena</span><b>{arena.rank ? `#${arena.rank}` : arena.score}</b></SourceLink>}
    {aa && <SourceLink href={sourceHref(sources, 'artificialAnalysis')} className="evidence-link"><span>AA</span><b>{aa.rank ? `#${aa.rank}` : aa.score}</b></SourceLink>}
    {llm && <SourceLink href={sourceHref(sources, 'llmStats')} className="evidence-link"><span>LLM</span><b>{llm.rank ? `#${llm.rank}` : llm.score}</b></SourceLink>}
    {!arena && !aa && !llm && <span className="muted">Independent evidence pending</span>}
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
    <span>{rank ? String(rank).padStart(2, '0') : '—'}</span>
    {estimate && <small title="Estimate range from available evidence; missing benchmark components remain pending.">{estimateLabel(estimate)}</small>}
  </div>;
}

function ScoreCell({ model, metric }) {
  const score = model.scores?.[metric];
  const coverage = ['overall', 'reasoning', 'coding', 'agent'].includes(metric) ? model.coverage?.[metric] : null;
  return <div className="score-cell">
    <strong>{fmtScore(score)}</strong>
    {coverage != null && <span>{coverage}% evidence</span>}
  </div>;
}

function MetricMini({ model, metric }) {
  const spec = METRICS.find(item => item.key === metric);
  const rank = model.metricRanks?.[metric];
  const estimate = model.rankEstimates?.[metric];
  return <div className="metric-mini">
    <span>{spec?.short}</span>
    <strong>{rank ? `#${rank}` : '—'}</strong>
    <small>{estimate ? estimateLabel(estimate) : fmtScore(model.scores?.[metric])}</small>
  </div>;
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
        {taskRows.length ? <div className="task-list">{taskRows.map(([label, value, provenance], index) => <div key={`${label}-${index}`}><span>{label}<i className={`provenance provenance-${provenance}`}>{provenance}</i></span><b>{value}%</b></div>)}</div> : <p className="muted">Task-level evidence pending.</p>}
      </section>
    </div>

    <div className="reference-block">
      <h3>References</h3>
      <div className="reference-links">
        {refs.map(ref => <SourceLink key={ref.key} href={ref.url} className="reference-link"><small>{ref.kind || 'source'}</small><b>{ref.label}</b></SourceLink>)}
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
        <span>snapshot {data.updated || '—'}</span>
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
      <span>SOURCES</span>
      <div>{coreSources.map(([key, label]) => <SourceLink key={key} href={sourceHref(data.sources, key)}>{label}</SourceLink>)}</div>
    </section>

    <section className="rank-surface shell">
      <div className="metric-rail" role="tablist" aria-label="Ranking metric">
        {METRICS.map(item => <button key={item.key} className={metric === item.key ? 'active' : ''} onClick={() => { setMetric(item.key); setExpanded(null); }} type="button">
          <span>{item.short}</span><b>{item.label}</b>
        </button>)}
      </div>

      <div className="metric-context">
        <div><span>RANKING BY</span><strong>{activeMetric.label}</strong></div>
        <p>{activeMetric.description}</p>
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
            <th className="col-rank">Rank</th>
            <th>Model</th>
            <th className="col-score">{activeMetric.label}</th>
            <th>Published evidence</th>
            <th className="col-access">Access</th>
            <th className="col-price">Price <small>in / out</small></th>
            <th className="col-context">Context</th>
            <th className="col-open" aria-label="Details" />
          </tr></thead>
          <tbody>
            {models.map(model => {
              const isOpen = expanded === model.id;
              return <>
                <tr key={model.id} className={isOpen ? 'model-row open' : 'model-row'} onClick={() => setExpanded(isOpen ? null : model.id)}>
                  <td><RankCell model={model} metric={metric} /></td>
                  <td className="model-cell"><strong>{model.name}</strong><span>{model.organization}</span></td>
                  <td><ScoreCell model={model} metric={metric} /></td>
                  <td><Evidence model={model} sources={data.sources} /></td>
                  <td><ProviderMarks model={model} /></td>
                  <td><Price model={model} /></td>
                  <td className="context-cell"><b>{fmtContext(model.context)}</b></td>
                  <td className="open-cell"><button type="button" aria-label={`${isOpen ? 'Close' : 'Open'} ${model.name} details`} onClick={event => { event.stopPropagation(); setExpanded(isOpen ? null : model.id); }}>{isOpen ? '−' : '+'}</button></td>
                </tr>
                {isOpen && <tr key={`${model.id}-detail`} className="detail-row"><td colSpan="8"><Detail model={model} sources={data.sources} /></td></tr>}
              </>;
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

    <footer className="footer shell"><strong>LLM INDEX</strong><span>Source-first text model intelligence for Venice + Morpheus.</span><SourceLink href="https://github.com/bitwikiorg/llm-rankings">GitHub</SourceLink></footer>
  </main>;
}