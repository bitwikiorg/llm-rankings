'use client';

import { useEffect, useMemo, useState } from 'react';

const fmtNum = n => n == null ? '—' : Number(n).toLocaleString();
const fmtScore = n => n == null ? '—' : Number(n).toFixed(1);
const fmtContext = n => n == null ? '—' : n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `${Math.round(n / 1000)}K`;
const fmtParams = n => n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(n % 1000 ? 1 : 0)}T` : `${n}B`;
const fmtPrice = n => n == null ? '—' : `$${Number(n).toFixed(Number(n) < 1 ? 2 : 2)}`;
const fmtDate = date => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00Z`)) : 'Unknown';

const TIER_LABEL = { S: 'Frontier', A: 'Elite', B: 'Strong', C: 'Capable', D: 'Utility', U: 'Unranked' };

function ProviderMark({ provider, status }) {
  const v = provider === 'venice' || provider === 'both';
  const m = provider === 'morpheus' || provider === 'both';
  return <div className="providerMarks" aria-label={provider === 'both' ? 'Available on Venice and Morpheus' : `Available on ${provider}`}>
    {v && <span className={`providerPill venice ${status?.venice?.live ? 'live' : ''}`}>VENICE</span>}
    {m && <span className={`providerPill morpheus ${status?.morpheus?.live ? 'live' : ''}`}>MORPHEUS</span>}
  </div>;
}

function PriceStack({ model }) {
  return <div className="priceStack">
    {model.prices?.venice && <div><span className="miniProvider venice">V</span><b>{fmtPrice(model.prices.venice.input)}</b><span>/</span><b>{fmtPrice(model.prices.venice.output)}</b></div>}
    {model.prices?.morpheus && <div><span className="miniProvider morpheus">M</span><b>{fmtPrice(model.prices.morpheus.input)}</b><span>/</span><b>{fmtPrice(model.prices.morpheus.output)}</b></div>}
    {!model.prices?.venice && !model.prices?.morpheus && <span>—</span>}
  </div>;
}

function ScoreBar({ label, value }) {
  return <div className="scoreBar"><div><span>{label}</span><b>{fmtScore(value)}</b></div><div className="track"><i style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} /></div></div>;
}

function BestCard({ label, model, metric, suffix = '' }) {
  if (!model) return null;
  const value = metric === 'context' ? fmtContext(model.context) : fmtScore(model.ranking?.[metric]);
  return <button className="bestCard" onClick={() => document.getElementById(`model-${model.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
    <span>{label}</span><strong>{model.name}</strong><small>{value}{suffix} · {model.provider === 'both' ? 'Venice + Morpheus' : model.provider}</small>
  </button>;
}

function ScatterChart({ models, mode }) {
  const eligible = models.filter(model => model.ranking?.power != null && (
    mode === 'cost' ? model.blendedCost != null : mode === 'context' ? model.context != null : model.releaseDate
  )).slice(0, 36);
  if (!eligible.length) return <div className="chartEmpty">Not enough data.</div>;

  const rawX = model => {
    if (mode === 'cost') return Math.log10((model.blendedCost || 0) + 0.05);
    if (mode === 'context') return Math.log10(model.context || 1);
    return new Date(`${model.releaseDate}T00:00:00Z`).getTime();
  };
  const xs = eligible.map(rawX);
  const ys = eligible.map(model => model.ranking.power);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys) - 3, maxY = Math.max(...ys) + 3;
  const sx = value => 52 + ((value - minX) / Math.max(1, maxX - minX)) * 840;
  const sy = value => 310 - ((value - minY) / Math.max(1, maxY - minY)) * 255;
  const xTitle = mode === 'cost' ? 'Blended provider cost →' : mode === 'context' ? 'Context window →' : 'Release date →';

  return <div className="chartFrame">
    <svg viewBox="0 0 940 350" role="img" aria-label={`${mode} versus power score chart`}>
      {[0, 1, 2, 3, 4].map(index => <line key={index} x1="52" x2="900" y1={55 + index * 64} y2={55 + index * 64} className="gridLine" />)}
      <text x="52" y="338" className="axisLabel">{xTitle}</text>
      <text x="10" y="28" className="axisLabel">POWER ↑</text>
      {eligible.map((model, index) => {
        const x = sx(rawX(model));
        const y = sy(model.ranking.power);
        const showLabel = index < 12;
        return <g key={model.id} className={`chartPoint provider-${model.provider}`}>
          <circle cx={x} cy={y} r={4 + Math.min(5, (model.ranking.evidence || 0) / 25)} />
          {showLabel && <text x={x + 7} y={y - 7}>{model.name.length > 22 ? `${model.name.slice(0, 20)}…` : model.name}</text>}
        </g>;
      })}
    </svg>
    <div className="chartLegend"><span><i className="legendDot both" />Both</span><span><i className="legendDot venice" />Venice</span><span><i className="legendDot morpheus" />Morpheus</span><span>Bubble size = benchmark coverage</span></div>
  </div>;
}

function Sources({ model, sources }) {
  const rows = (model.sourceKeys || []).map(key => ({ key, ...sources?.[key] })).filter(row => row.url);
  return <div className="sourceLinks">{rows.map(row => <a key={row.key} href={row.url} target="_blank" rel="noreferrer"><span>{row.kind}</span>{row.label} ↗</a>)}</div>;
}

export default function Home() {
  const [data, setData] = useState({ models: [], status: {}, sources: {}, updated: '' });
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const [openness, setOpenness] = useState('all');
  const [generation, setGeneration] = useState('all');
  const [sort, setSort] = useState('power');
  const [compare, setCompare] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [chartMode, setChartMode] = useState('cost');

  useEffect(() => {
    fetch('/api/models').then(response => response.json()).then(setData).catch(() => setData(current => ({ ...current, error: true })));
  }, []);

  const rankedModels = useMemo(() => data.models.filter(model => model.ranking?.power != null), [data.models]);
  const best = useMemo(() => {
    const max = metric => [...rankedModels].filter(model => model.ranking?.[metric] != null).sort((a, b) => b.ranking[metric] - a.ranking[metric])[0];
    const context = [...rankedModels].filter(model => model.context).sort((a, b) => b.context - a.context)[0];
    return { power: max('power'), reasoning: max('reasoning'), coding: max('coding'), value: max('value'), freshness: max('freshness'), context };
  }, [rankedModels]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const now = new Date('2026-08-18T00:00:00Z').getTime();
    const rows = data.models.filter(model => {
      if (needle && !`${model.name} ${model.organization} ${(model.providerIds?.venice || []).join(' ')} ${(model.providerIds?.morpheus || []).join(' ')}`.toLowerCase().includes(needle)) return false;
      if (provider === 'venice' && !model.providers?.venice) return false;
      if (provider === 'morpheus' && !model.providers?.morpheus) return false;
      if (provider === 'both' && !(model.providers?.venice && model.providers?.morpheus)) return false;
      if (openness === 'open' && !String(model.openness).toLowerCase().includes('open')) return false;
      if (openness === 'closed' && String(model.openness).toLowerCase().includes('open')) return false;
      if (generation !== 'all') {
        if (!model.releaseDate) return false;
        const days = (now - new Date(`${model.releaseDate}T00:00:00Z`).getTime()) / 86400000;
        if (generation === '30' && days > 30) return false;
        if (generation === '90' && days > 90) return false;
        if (generation === '180' && days > 180) return false;
      }
      return true;
    });

    const metric = model => {
      if (sort === 'price') return -(model.blendedCost ?? 99999);
      if (sort === 'release') return model.releaseDate ? new Date(model.releaseDate).getTime() : 0;
      if (sort === 'context') return model.context || 0;
      if (sort === 'arena') return model.benchmarks?.arena?.score || 0;
      return model.ranking?.[sort] ?? -1;
    };
    return rows.sort((a, b) => metric(b) - metric(a));
  }, [data.models, query, provider, openness, generation, sort]);

  const compareModels = compare.map(id => data.models.find(model => model.id === id)).filter(Boolean);
  const toggleCompare = id => setCompare(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 4 ? [...current, id] : current);
  const tierCounts = useMemo(() => ['S', 'A', 'B', 'C', 'D', 'U'].map(tier => ({ tier, count: data.models.filter(model => model.ranking?.tier === tier).length })), [data.models]);

  return <main>
    <header className="topbar">
      <a className="brand" href="#top"><span>LLM</span>INDEX</a>
      <nav><a href="#rankings">Rankings</a><a href="#charts">Charts</a><a href="#compare">Compare</a><a href="/methodology">Methodology</a></nav>
      <a className="githubLink" href="https://github.com/bitwikiorg/llm-rankings" target="_blank" rel="noreferrer">GitHub ↗</a>
    </header>

    <section id="top" className="shell intro">
      <div className="introCopy">
        <span className="kicker">TEXT MODEL INTELLIGENCE · VENICE × MORPHEUS</span>
        <h1>Current models. Comparable evidence.</h1>
        <p>A research-first leaderboard that separates model capability, provider availability, economics, recency, technical specifications and source provenance.</p>
      </div>
      <div className="freshnessPanel">
        <div><span>Research snapshot</span><b>{data.updated || 'loading'}</b></div>
        <div><span>Models tracked</span><b>{data.models.length || '—'}</b></div>
        <div><span>Ranked</span><b>{rankedModels.length || '—'}</b></div>
      </div>
    </section>

    <section className="shell providerStrip">
      <div className="providerBlock venice"><div><span className="statusDot" />VENICE</div><strong>{data.status?.venice?.documentedCount ?? '—'} models</strong><small>{data.status?.venice?.live ? 'live API overlay' : 'documented snapshot'}</small></div>
      <div className="providerBlock morpheus"><div><span className="statusDot" />MORPHEUS</div><strong>{data.status?.morpheus?.documentedCount ?? '—'} models</strong><small>{data.status?.morpheus?.live ? 'live API overlay' : 'documented snapshot'}</small></div>
      <div className="providerBlock overlap"><div>OVERLAP</div><strong>{data.status?.bothCount ?? '—'} models</strong><small>available through both</small></div>
      <div className="providerNote">Provider pills in every row are explicit. Prices remain provider-specific; they are never silently merged.</div>
    </section>

    <section className="shell bestSection">
      <div className="sectionTitle"><div><span className="kicker">BEST BY SIGNAL</span><h2>Fast orientation</h2></div><p>Task cards are derived from the same evidence model as the table. Missing metrics stay missing.</p></div>
      <div className="bestGrid">
        <BestCard label="POWER" model={best.power} metric="power" />
        <BestCard label="REASONING" model={best.reasoning} metric="reasoning" />
        <BestCard label="CODING" model={best.coding} metric="coding" />
        <BestCard label="VALUE" model={best.value} metric="value" />
        <BestCard label="NEWEST ADVANTAGE" model={best.freshness} metric="freshness" />
        <BestCard label="LONGEST CONTEXT" model={best.context} metric="context" />
      </div>
    </section>

    <section className="shell tierSummary">
      {tierCounts.map(item => <div key={item.tier} className={`tierSummaryItem tier-${item.tier}`}><b>{item.tier}</b><span>{TIER_LABEL[item.tier]}</span><em>{item.count}</em></div>)}
      <div className="tierExplanation">Power score = 70% benchmark capability + <strong>25% recency</strong> + 5% evidence coverage. Recent generations are intentionally favored.</div>
    </section>

    <section id="charts" className="shell chartSection">
      <div className="sectionTitle"><div><span className="kicker">VISUAL ANALYSIS</span><h2>Performance frontier</h2></div><div className="segmented"><button className={chartMode === 'cost' ? 'active' : ''} onClick={() => setChartMode('cost')}>Cost</button><button className={chartMode === 'context' ? 'active' : ''} onClick={() => setChartMode('context')}>Context</button><button className={chartMode === 'timeline' ? 'active' : ''} onClick={() => setChartMode('timeline')}>Timeline</button></div></div>
      <ScatterChart models={rankedModels} mode={chartMode} />
    </section>

    <section id="rankings" className="shell rankingSection">
      <div className="sectionTitle"><div><span className="kicker">LEADERBOARD</span><h2>Text model rankings</h2></div><p>{filtered.length} visible · click a row for benchmarks, architecture, privacy and references.</p></div>
      <div className="toolbar">
        <input aria-label="Search models" placeholder="Search model, lab, provider ID…" value={query} onChange={event => setQuery(event.target.value)} />
        <select value={provider} onChange={event => setProvider(event.target.value)}><option value="all">All providers</option><option value="both">Venice + Morpheus</option><option value="venice">Venice</option><option value="morpheus">Morpheus</option></select>
        <select value={generation} onChange={event => setGeneration(event.target.value)}><option value="all">Any release date</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="180">Last 180 days</option></select>
        <select value={openness} onChange={event => setOpenness(event.target.value)}><option value="all">Any license</option><option value="open">Open weights</option><option value="closed">Proprietary</option></select>
        <select value={sort} onChange={event => setSort(event.target.value)}><option value="power">Power</option><option value="reasoning">Reasoning</option><option value="coding">Coding</option><option value="value">Value</option><option value="freshness">Freshness</option><option value="arena">Arena score</option><option value="context">Context</option><option value="price">Lowest price</option><option value="release">Newest</option></select>
      </div>

      <div className="tableWrap">
        <table className="leaderboard">
          <thead><tr><th className="rankCol">#</th><th className="modelCol">Model</th><th>Power</th><th>Provider</th><th>Released</th><th>Arena</th><th>Context</th><th>Provider price $/M</th><th aria-label="Compare">+</th></tr></thead>
          <tbody>{filtered.map(model => {
            const open = expanded === model.id;
            return <FragmentRow key={model.id} model={model} open={open} setOpen={() => setExpanded(open ? null : model.id)} status={data.status} sources={data.sources} compare={compare} toggleCompare={toggleCompare} />;
          })}</tbody>
        </table>
      </div>
    </section>

    <section id="compare" className="shell compareSection">
      <div className="sectionTitle"><div><span className="kicker">COMPARE</span><h2>{compareModels.length ? `${compareModels.length} selected` : 'Select up to four models'}</h2></div>{compareModels.length > 0 && <button className="clearButton" onClick={() => setCompare([])}>Clear</button>}</div>
      {compareModels.length ? <div className="compareGrid">{compareModels.map(model => <article key={model.id} className="compareCard">
        <div className="compareHeader"><div><span className={`tierBadge tier-${model.ranking?.tier}`}>{model.ranking?.tier}</span><h3>{model.name}</h3><p>{model.organization}</p></div><button aria-label={`Remove ${model.name}`} onClick={() => toggleCompare(model.id)}>×</button></div>
        <ProviderMark provider={model.provider} status={data.status} />
        <div className="compareScores"><ScoreBar label="Power" value={model.ranking?.power} /><ScoreBar label="Reasoning" value={model.ranking?.reasoning} /><ScoreBar label="Coding" value={model.ranking?.coding} /><ScoreBar label="Agent" value={model.ranking?.agent} /><ScoreBar label="Value" value={model.ranking?.value} /><ScoreBar label="Freshness" value={model.ranking?.freshness} /></div>
        <dl className="compareSpecs"><div><dt>Released</dt><dd>{fmtDate(model.releaseDate)}</dd></div><div><dt>Context</dt><dd>{fmtContext(model.context)}</dd></div><div><dt>Parameters</dt><dd>{fmtParams(model.paramsTotalB)}{model.paramsActiveB ? ` / ${fmtParams(model.paramsActiveB)} active` : ''}</dd></div><div><dt>Precision</dt><dd>{model.quantization || 'Unknown'}</dd></div><div><dt>Arena</dt><dd>{model.benchmarks?.arena?.score || '—'}</dd></div><div><dt>Kilo completion</dt><dd>{model.benchmarks?.kilo?.completion != null ? `${model.benchmarks.kilo.completion}%` : '—'}</dd></div></dl>
        <PriceStack model={model} />
      </article>)}</div> : <div className="emptyState">Add models from the leaderboard. Comparison keeps provider prices separate and puts normalized capability dimensions side by side.</div>}
    </section>

    <section className="shell references">
      <div className="sectionTitle"><div><span className="kicker">PROVENANCE</span><h2>Research sources</h2></div><p>Provider catalogs and model metadata prefer first-party documentation. Benchmarks are labeled as benchmark sources, not vendor facts.</p></div>
      <div className="referenceGrid">{Object.entries(data.sources || {}).map(([key, source]) => <a key={key} href={source.url} target="_blank" rel="noreferrer"><span>{source.kind}{source.primary ? ' · primary' : ''}</span><strong>{source.label}</strong><em>↗</em></a>)}</div>
    </section>

    <footer className="shell footer"><div><b>LLM INDEX</b><span>Provider-aware text model research.</span></div><div><a href="/methodology">Methodology</a><a href="https://github.com/bitwikiorg/llm-rankings" target="_blank" rel="noreferrer">Data + code ↗</a></div></footer>
  </main>;
}

function FragmentRow({ model, open, setOpen, status, sources, compare, toggleCompare }) {
  const arenaData = model.benchmarks?.arena;
  return <>
    <tr id={`model-${model.id}`} className={open ? 'modelRow open' : 'modelRow'} onClick={setOpen}>
      <td className="rankCol"><b>{model.rank || '—'}</b></td>
      <td className="modelCol"><div className="modelIdentity"><strong>{model.name}</strong><span>{model.organization} · {model.openness}</span></div></td>
      <td><div className="powerCell"><span className={`tierBadge tier-${model.ranking?.tier}`}>{model.ranking?.tier || 'U'}</span><strong>{fmtScore(model.ranking?.power)}</strong><small>{model.ranking?.benchmarkFamilies || 0}/4 evidence</small></div></td>
      <td><ProviderMark provider={model.provider} status={status} /></td>
      <td><div className="dateCell"><strong>{model.releaseDate ? fmtDate(model.releaseDate) : 'Unknown'}</strong><small>{model.ranking?.freshness != null ? `freshness ${fmtScore(model.ranking.freshness)}` : ''}</small></div></td>
      <td><div className="arenaCell"><strong>{arenaData?.score || '—'}</strong><small>{arenaData?.rank ? `#${arenaData.rank} · ${fmtNum(arenaData.votes)} votes` : arenaData?.spread || ''}</small></div></td>
      <td><strong>{fmtContext(model.context)}</strong></td>
      <td><PriceStack model={model} /></td>
      <td><button className={`addButton ${compare.includes(model.id) ? 'selected' : ''}`} onClick={event => { event.stopPropagation(); toggleCompare(model.id); }}>{compare.includes(model.id) ? '✓' : '+'}</button></td>
    </tr>
    {open && <tr className="detailRow"><td colSpan="9"><div className="detailPanel">
      <div className="detailScores"><ScoreBar label="Capability" value={model.ranking?.capability} /><ScoreBar label="Reasoning" value={model.ranking?.reasoning} /><ScoreBar label="Coding" value={model.ranking?.coding} /><ScoreBar label="Agent" value={model.ranking?.agent} /><ScoreBar label="Value" value={model.ranking?.value} /><ScoreBar label="Freshness" value={model.ranking?.freshness} /></div>
      <div className="detailMetrics">
        <div><span>LLM Stats</span><b>{fmtScore(model.benchmarks?.llmStats?.overall)}</b><small>overall</small></div>
        <div><span>Reasoning</span><b>{fmtScore(model.benchmarks?.llmStats?.reasoning)}</b><small>LLM Stats</small></div>
        <div><span>Coding</span><b>{fmtScore(model.benchmarks?.llmStats?.coding)}</b><small>LLM Stats</small></div>
        <div><span>Kilo</span><b>{model.benchmarks?.kilo?.completion != null ? `${model.benchmarks.kilo.completion}%` : '—'}</b><small>completion</small></div>
        <div><span>AI Index</span><b>{fmtScore(model.benchmarks?.artificialAnalysis?.intelligence)}</b><small>Artificial Analysis</small></div>
        <div><span>Params</span><b>{fmtParams(model.paramsTotalB)}</b><small>{model.paramsActiveB ? `${fmtParams(model.paramsActiveB)} active` : 'total'}</small></div>
        <div><span>Precision</span><b>{model.quantization || 'Unknown'}</b><small>serving/checkpoint</small></div>
        <div><span>License</span><b>{model.license || 'Unknown'}</b><small>{model.openness}</small></div>
      </div>
      {model.benchmarks?.vendor && <div className="vendorMetrics"><strong>Vendor-reported benchmark observations</strong><div>{Object.entries(model.benchmarks.vendor).map(([key, value]) => <span key={key}><b>{key.replace(/([A-Z])/g, ' $1')}</b>{value}</span>)}</div><small>Displayed for reference; vendor-reported metrics are not used in the main capability composite unless independently represented by a listed benchmark source.</small></div>}
      <div className="detailMeta"><div><strong>Capabilities</strong><p>{(model.capabilities || []).join(' · ') || 'Unknown'}</p></div><div><strong>Provider IDs</strong><p>{[...(model.providerIds?.venice || []).map(id => `Venice: ${id}`), ...(model.providerIds?.morpheus || []).map(id => `Morpheus: ${id}`)].join(' · ') || 'Unknown'}</p></div></div>
      <Sources model={model} sources={sources} />
    </div></td></tr>}
  </>;
}
