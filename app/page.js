'use client';

import { useEffect, useMemo, useState } from 'react';

const fmt = n => n == null ? '—' : Number(n).toLocaleString();
const score = n => n == null ? '—' : Number(n).toFixed(1);
const money = n => n == null ? '—' : `$${Number(n).toFixed(Number(n) < 1 ? 2 : 2)}`;
const context = n => n == null ? '—' : n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `${Math.round(n / 1000)}K`;
const params = n => n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(n % 1000 ? 1 : 0)}T` : `${n}B`;
const date = value => value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00Z`)) : 'Unknown';

const SORTS = {
  arena: 'Arena Overall',
  consensus: 'Consensus',
  artificialAnalysis: 'AA Intelligence',
  llmStats: 'LLM Stats',
  coding: 'Coding',
  value: 'Value',
  newest: 'Newest',
  context: 'Context',
};

function ProviderCell({ model, name, live }) {
  const available = Boolean(model.providers?.[name]);
  if (!available) return <div className="providerCell unavailable"><span>—</span><small>not listed</small></div>;
  const ids = model.providerIds?.[name] || [];
  const price = model.prices?.[name];
  return <div className={`providerCell ${name}`}>
    <div className="providerState"><i />{live ? 'LIVE' : 'LISTED'}</div>
    {price ? <strong>{money(price.input)} / {money(price.output)}</strong> : <strong>price —</strong>}
    <small>{ids[0] || 'provider model'}</small>
  </div>;
}

function Metric({ value, suffix = '' }) {
  return <strong className="metricValue">{value == null ? '—' : `${value}${suffix}`}</strong>;
}

function ReferenceLinks({ model, sources }) {
  const refs = (model.sourceKeys || []).map(key => ({ key, ...sources?.[key] })).filter(ref => ref.url);
  return <div className="referenceLinks">{refs.map(ref => <a key={ref.key} href={ref.url} target="_blank" rel="noreferrer"><span>{ref.kind}</span>{ref.label} ↗</a>)}</div>;
}

function SourceMetric({ model, type }) {
  if (type === 'arena') {
    const row = model.benchmarks?.arena;
    if (!row) return <span className="emptyMetric">—</span>;
    return <div className="sourceMetric"><strong>#{row.rank ?? '—'} · {row.score ?? '—'}</strong><small>{row.votes ? `${fmt(row.votes)} votes` : 'ranked source'}{row.variant ? ` · ${row.variant}` : ''}</small></div>;
  }
  if (type === 'aa') {
    const row = model.benchmarks?.artificialAnalysis;
    if (!row?.intelligence) return <span className="emptyMetric">—</span>;
    return <div className="sourceMetric"><strong>{row.intelligence}</strong><small>Intelligence Index{row.variant ? ` · ${row.variant}` : ''}</small></div>;
  }
  if (type === 'llm') {
    const row = model.benchmarks?.llmStats;
    if (row?.overall == null) return <span className="emptyMetric">—</span>;
    return <div className="sourceMetric"><strong>{score(row.overall)}</strong><small>reason {score(row.reasoning)} · code {score(row.coding)}</small></div>;
  }
  const row = model.benchmarks?.kilo;
  if (row?.completion == null) return <span className="emptyMetric">—</span>;
  return <div className="sourceMetric"><strong>{score(row.completion)}%</strong><small>{row.rank ? `#${row.rank} · ` : ''}{row.costPerAttempt != null ? `${money(row.costPerAttempt)}/attempt` : 'Kilo'}</small></div>;
}

function Chart({ models, metric }) {
  const getY = model => {
    if (metric === 'arena') return model.benchmarks?.arena?.score ?? null;
    if (metric === 'aa') return model.benchmarks?.artificialAnalysis?.intelligence ?? null;
    if (metric === 'llm') return model.benchmarks?.llmStats?.overall ?? null;
    return model.ranking?.consensus ?? null;
  };
  const rows = models.filter(model => model.releaseDate && getY(model) != null).slice(0, 36);
  if (rows.length < 2) return <div className="emptyChart">Not enough sourced points.</div>;
  const xs = rows.map(model => new Date(`${model.releaseDate}T00:00:00Z`).getTime());
  const ys = rows.map(getY);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const sx = value => 52 + ((value - minX) / Math.max(1, maxX - minX)) * 850;
  const sy = value => 295 - ((value - minY) / Math.max(1, maxY - minY)) * 235;
  return <div className="chartCard">
    <svg viewBox="0 0 950 330" role="img" aria-label={`${metric} by release date`}>
      {[0,1,2,3,4].map(i => <line key={i} x1="52" x2="910" y1={58 + i * 58} y2={58 + i * 58} className="gridLine" />)}
      <text x="52" y="319" className="axisLabel">RELEASE DATE →</text>
      {rows.map((model, index) => {
        const x = sx(new Date(`${model.releaseDate}T00:00:00Z`).getTime());
        const y = sy(getY(model));
        return <g key={model.id} className={`plotPoint ${model.provider}`}>
          <circle cx={x} cy={y} r="5" />
          {index < 12 && <text x={x + 8} y={y - 7}>{model.name.length > 20 ? `${model.name.slice(0, 18)}…` : model.name}</text>}
        </g>;
      })}
    </svg>
  </div>;
}

export default function Home() {
  const [data, setData] = useState({ models: [], status: {}, sources: {}, benchmarkSnapshot: {}, updated: '' });
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const [license, setLicense] = useState('all');
  const [age, setAge] = useState('all');
  const [sort, setSort] = useState('arena');
  const [expanded, setExpanded] = useState(null);
  const [compare, setCompare] = useState([]);
  const [chartMetric, setChartMetric] = useState('consensus');

  useEffect(() => {
    fetch('/api/models').then(res => res.json()).then(setData).catch(() => setData(current => ({ ...current, error: true })));
  }, []);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const now = new Date('2026-08-18T00:00:00Z').getTime();
    const filtered = data.models.filter(model => {
      if (needle && !`${model.name} ${model.organization} ${(model.providerIds?.venice || []).join(' ')} ${(model.providerIds?.morpheus || []).join(' ')}`.toLowerCase().includes(needle)) return false;
      if (provider === 'venice' && !model.providers?.venice) return false;
      if (provider === 'morpheus' && !model.providers?.morpheus) return false;
      if (provider === 'both' && !(model.providers?.venice && model.providers?.morpheus)) return false;
      if (license === 'open' && !String(model.openness).toLowerCase().includes('open')) return false;
      if (license === 'closed' && String(model.openness).toLowerCase().includes('open')) return false;
      if (age !== 'all') {
        if (!model.releaseDate) return false;
        const days = (now - new Date(`${model.releaseDate}T00:00:00Z`).getTime()) / 86400000;
        if (days > Number(age)) return false;
      }
      return true;
    });

    const value = model => {
      if (sort === 'arena') return model.benchmarks?.arena?.rank != null ? -model.benchmarks.arena.rank : -99999;
      if (sort === 'consensus') return model.ranking?.consensus ?? -1;
      if (sort === 'artificialAnalysis') return model.benchmarks?.artificialAnalysis?.intelligence ?? -1;
      if (sort === 'llmStats') return model.benchmarks?.llmStats?.overall ?? -1;
      if (sort === 'coding') return model.ranking?.coding ?? -1;
      if (sort === 'value') return model.ranking?.value ?? -1;
      if (sort === 'newest') return model.releaseDate ? new Date(model.releaseDate).getTime() : 0;
      if (sort === 'context') return model.context || 0;
      return 0;
    };
    return filtered.sort((a, b) => value(b) - value(a));
  }, [data.models, query, provider, license, age, sort]);

  const compareModels = compare.map(id => data.models.find(model => model.id === id)).filter(Boolean);
  const toggleCompare = id => setCompare(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 4 ? [...current, id] : current);
  const arenaLeader = [...data.models].filter(model => model.benchmarks?.arena?.rank != null).sort((a,b) => a.benchmarks.arena.rank - b.benchmarks.arena.rank)[0];
  const consensusLeader = [...data.models].filter(model => model.ranking?.consensus != null).sort((a,b) => b.ranking.consensus - a.ranking.consensus)[0];
  const veniceCount = data.models.filter(model => model.providers?.venice).length;
  const morCount = data.models.filter(model => model.providers?.morpheus).length;
  const bothCount = data.models.filter(model => model.providers?.venice && model.providers?.morpheus).length;

  return <main>
    <header className="topbar">
      <a className="brand" href="#top"><span>LLM</span>INDEX</a>
      <nav><a href="#rankings">Rankings</a><a href="#analysis">Analysis</a><a href="#compare">Compare</a><a href="/methodology">Methodology</a></nav>
      <a className="githubLink" href="https://github.com/bitwikiorg/llm-rankings" target="_blank" rel="noreferrer">GitHub ↗</a>
    </header>

    <section id="top" className="shell hero">
      <span className="kicker">TEXT MODELS · VENICE + MORPHEUS</span>
      <div className="heroGrid">
        <div><h1>Model rankings without hiding the sources.</h1><p>Provider availability, source-native benchmark positions, release dates, economics and a clearly labeled secondary consensus score. No benchmark is silently treated as ground truth.</p></div>
        <div className="heroFacts">
          <div><span>Arena leader in this provider set</span><b>{arenaLeader?.name || '—'}</b><small>{arenaLeader?.benchmarks?.arena ? `#${arenaLeader.benchmarks.arena.rank} · ${arenaLeader.benchmarks.arena.score}` : ''}</small></div>
          <div><span>Consensus leader</span><b>{consensusLeader?.name || '—'}</b><small>{consensusLeader?.ranking?.consensus != null ? `${score(consensusLeader.ranking.consensus)} · derived` : ''}</small></div>
          <div><span>Research snapshot</span><b>{data.updated || 'loading'}</b><small>{data.models.length || '—'} provider-listed text models</small></div>
        </div>
      </div>
    </section>

    <section className="shell providerOverview">
      <div className="providerSummary venice"><span>VENICE</span><b>{veniceCount}</b><small>{data.status?.venice?.live ? 'live API overlay' : 'documented catalog'}</small></div>
      <div className="providerSummary morpheus"><span>MORPHEUS</span><b>{morCount}</b><small>{data.status?.morpheus?.live ? 'live API overlay' : 'documented catalog'}</small></div>
      <div className="providerSummary both"><span>BOTH</span><b>{bothCount}</b><small>explicit overlap only</small></div>
      <div className="providerRule">Provider columns below are separate on purpose. A Venice listing never implies Morpheus availability, and vice versa.</div>
    </section>

    <section className="shell sourceStrip">
      {Object.entries(data.benchmarkSnapshot || {}).filter(([key]) => key !== 'retrieved').map(([key, item]) => <a key={key} href={item.url} target="_blank" rel="noreferrer"><span>{key === 'artificialAnalysis' ? 'ARTIFICIAL ANALYSIS' : key.toUpperCase()}</span><b>{item.sourceDate || data.benchmarkSnapshot?.retrieved}</b><small>{item.note}</small></a>)}
    </section>

    <section id="rankings" className="shell rankingSection">
      <div className="sectionHead">
        <div><span className="kicker">LEADERBOARD</span><h2>Text model rankings</h2></div>
        <p><strong>{SORTS[sort]}</strong> is the active view. Arena is the default; Consensus is a derived secondary score with only 10% recency weight.</p>
      </div>

      <div className="viewTabs">
        {Object.entries(SORTS).map(([key, label]) => <button key={key} className={sort === key ? 'active' : ''} onClick={() => setSort(key)}>{label}</button>)}
      </div>

      <div className="filters">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search model, lab, provider ID…" aria-label="Search models" />
        <select value={provider} onChange={e => setProvider(e.target.value)}><option value="all">All providers</option><option value="both">Venice + Morpheus</option><option value="venice">Venice</option><option value="morpheus">Morpheus</option></select>
        <select value={age} onChange={e => setAge(e.target.value)}><option value="all">Any release date</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="180">Last 180 days</option></select>
        <select value={license} onChange={e => setLicense(e.target.value)}><option value="all">Any license</option><option value="open">Open weights</option><option value="closed">Proprietary</option></select>
      </div>

      <div className="tableMeta"><span>{rows.length} visible</span><span>Click a model row for architecture, provider IDs, capabilities and references.</span></div>
      <div className="tableWrap">
        <table className="leaderboard">
          <thead><tr>
            <th className="rankCol">#</th><th className="modelCol">Model</th><th>Consensus</th><th className="veniceHead">Venice</th><th className="morHead">Morpheus</th><th>Released</th><th>Arena</th><th>AA</th><th>LLM Stats</th><th>Kilo</th><th>Context</th><th>+</th>
          </tr></thead>
          <tbody>{rows.map((model, index) => <FragmentRow key={model.id} model={model} index={index} sort={sort} expanded={expanded === model.id} setExpanded={setExpanded} compare={compare} toggleCompare={toggleCompare} status={data.status} sources={data.sources} />)}</tbody>
        </table>
      </div>
    </section>

    <section id="analysis" className="shell analysisSection">
      <div className="sectionHead"><div><span className="kicker">VISUAL ANALYSIS</span><h2>Release frontier</h2></div><div className="chartTabs">{[['consensus','Consensus'],['arena','Arena'],['aa','AA'],['llm','LLM Stats']].map(([key,label]) => <button key={key} className={chartMetric === key ? 'active' : ''} onClick={() => setChartMetric(key)}>{label}</button>)}</div></div>
      <Chart models={data.models} metric={chartMetric} />
    </section>

    <section id="compare" className="shell compareSection">
      <div className="sectionHead"><div><span className="kicker">COMPARE</span><h2>{compareModels.length ? `${compareModels.length} selected` : 'Select up to four models'}</h2></div>{compareModels.length > 0 && <button className="clearBtn" onClick={() => setCompare([])}>Clear</button>}</div>
      {compareModels.length ? <div className="compareGrid">{compareModels.map(model => <article className="compareCard" key={model.id}><div className="compareTitle"><div><span className={`tier tier-${model.ranking?.tier || 'U'}`}>{model.ranking?.tier || 'U'}</span><h3>{model.name}</h3></div><button onClick={() => toggleCompare(model.id)}>×</button></div><p>{model.organization} · {model.openness}</p><div className="compareProviders"><ProviderCell model={model} name="venice" live={data.status?.venice?.live} /><ProviderCell model={model} name="morpheus" live={data.status?.morpheus?.live} /></div><dl><div><dt>Consensus</dt><dd>{score(model.ranking?.consensus)}</dd></div><div><dt>Arena</dt><dd>{model.benchmarks?.arena ? `#${model.benchmarks.arena.rank} · ${model.benchmarks.arena.score}` : '—'}</dd></div><div><dt>AA Intelligence</dt><dd>{model.benchmarks?.artificialAnalysis?.intelligence ?? '—'}</dd></div><div><dt>LLM Stats</dt><dd>{score(model.benchmarks?.llmStats?.overall)}</dd></div><div><dt>Kilo</dt><dd>{model.benchmarks?.kilo?.completion != null ? `${score(model.benchmarks.kilo.completion)}%` : '—'}</dd></div><div><dt>Released</dt><dd>{date(model.releaseDate)}</dd></div><div><dt>Context</dt><dd>{context(model.context)}</dd></div><div><dt>Quantization</dt><dd>{model.quantization || '—'}</dd></div></dl></article>)}</div> : <div className="emptyCompare">Use the + control in the leaderboard.</div>}
    </section>

    <section className="shell provenance">
      <div className="sectionHead"><div><span className="kicker">PROVENANCE</span><h2>Source contract</h2></div><p>Provider facts come from provider documentation/API overlays. Benchmark observations come from the benchmark publisher. Model architecture and release facts prefer first-party model documentation.</p></div>
      <div className="provenanceGrid">{Object.values(data.sources || {}).map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>{source.kind}</span><b>{source.label}</b><small>{source.primary ? 'direct source' : 'secondary source'} ↗</small></a>)}</div>
    </section>

    <footer className="shell footer"><b>LLM INDEX</b><span>Provider-aware text-model research.</span><a href="/methodology">Methodology</a></footer>
  </main>;
}

function FragmentRow({ model, index, sort, expanded, setExpanded, compare, toggleCompare, status, sources }) {
  const rankLabel = sort === 'arena' ? (model.benchmarks?.arena?.rank ?? '—') : sort === 'consensus' ? (model.rank ?? '—') : index + 1;
  return <>
    <tr className={`modelRow ${expanded ? 'open' : ''}`} onClick={() => setExpanded(expanded ? null : model.id)}>
      <td className="rankCol">{rankLabel}</td>
      <td className="modelCol"><div className="modelIdentity"><strong>{model.name}</strong><span>{model.organization} · {model.openness}</span></div></td>
      <td><div className="consensusCell"><span className={`tier tier-${model.ranking?.tier || 'U'}`}>{model.ranking?.tier || 'U'}</span><div><strong>{score(model.ranking?.consensus)}</strong><small>{model.ranking?.sourceCount || 0}/3 overall sources</small></div></div></td>
      <td><ProviderCell model={model} name="venice" live={status?.venice?.live} /></td>
      <td><ProviderCell model={model} name="morpheus" live={status?.morpheus?.live} /></td>
      <td className="dateCell"><strong>{date(model.releaseDate)}</strong><small>{model.ranking?.freshness != null ? `freshness ${score(model.ranking.freshness)}` : ''}</small></td>
      <td><SourceMetric model={model} type="arena" /></td>
      <td><SourceMetric model={model} type="aa" /></td>
      <td><SourceMetric model={model} type="llm" /></td>
      <td><SourceMetric model={model} type="kilo" /></td>
      <td><Metric value={context(model.context)} /></td>
      <td><button className={`addBtn ${compare.includes(model.id) ? 'selected' : ''}`} onClick={e => { e.stopPropagation(); toggleCompare(model.id); }}>{compare.includes(model.id) ? '✓' : '+'}</button></td>
    </tr>
    {expanded && <tr className="detailRow"><td colSpan="12"><div className="detailPanel">
      <div className="detailGrid">
        <div><span>Total params</span><b>{params(model.paramsTotalB)}</b></div><div><span>Active params</span><b>{params(model.paramsActiveB)}</b></div><div><span>Context</span><b>{context(model.context)}</b></div><div><span>License</span><b>{model.license || '—'}</b></div><div><span>Quantization / precision</span><b>{model.quantization || '—'}</b></div><div><span>Capabilities</span><b>{(model.capabilities || []).join(', ') || '—'}</b></div>
      </div>
      <div className="providerIds"><div><span>Venice IDs</span><code>{(model.providerIds?.venice || []).join(', ') || '—'}</code></div><div><span>Morpheus IDs</span><code>{(model.providerIds?.morpheus || []).join(', ') || '—'}</code></div></div>
      <ReferenceLinks model={model} sources={sources} />
    </div></td></tr>}
  </>;
}
