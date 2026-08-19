'use client';

import { useEffect, useMemo, useState } from 'react';

const fmt = n => n == null ? '—' : Number(n).toLocaleString();
const fmt1 = n => n == null ? '—' : Number(n).toFixed(1);
const fmtContext = n => n == null ? '—' : n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `${Math.round(n / 1000)}K`;
const fmtPrice = n => n == null ? '—' : `$${Number(n).toFixed(Number(n) < 1 ? 2 : 2)}`;
const fmtDate = date => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00Z`)) : 'Unknown';
const TIER = {
  S: { name: 'S', label: 'Arena top 10' },
  A: { name: 'A', label: 'Arena top 25' },
  B: { name: 'B', label: 'Arena top 50' },
  C: { name: 'C', label: 'Arena top 100' },
  D: { name: 'D', label: 'Arena ranked' },
  U: { name: 'U', label: 'Not evaluated by Arena' },
};

function daysOld(date) {
  if (!date) return null;
  const ms = Date.now() - new Date(`${date}T00:00:00Z`).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.floor(ms / 86400000));
}

function offers(model) {
  return [
    model.prices?.venice && { key: 'venice', label: 'V', ...model.prices.venice },
    model.prices?.morpheus && { key: 'morpheus', label: 'M', ...model.prices.morpheus },
  ].filter(Boolean);
}

function bestInput(model) {
  const values = offers(model).map(item => Number(item.input)).filter(Number.isFinite);
  return values.length ? Math.min(...values) : null;
}

function ProviderPills({ model, status }) {
  return <div className="providerPills">
    {model.providers?.venice && <span className="provider venice" title="Available through Venice">Venice{status?.venice?.live ? ' •' : ''}</span>}
    {model.providers?.morpheus && <span className="provider morpheus" title="Available through Morpheus">Morpheus{status?.morpheus?.live ? ' •' : ''}</span>}
  </div>;
}

function TierBadge({ model }) {
  const tier = model.ranking?.tier || 'U';
  return <span className={`tier tier-${tier}`} title={TIER[tier]?.label}>{tier}</span>;
}

function PriceCell({ model, compact = false }) {
  const rows = offers(model);
  if (!rows.length) return <span className="missing" title="No provider price recorded">Not listed</span>;
  return <div className={`priceCell ${compact ? 'compact' : ''}`}>
    {rows.map(row => <div key={row.key} className="priceLine">
      <span className={`providerMini ${row.key}`}>{row.label}</span>
      <span>{fmtPrice(row.input)}</span><i>/</i><span>{fmtPrice(row.output)}</span>
    </div>)}
  </div>;
}

function Freshness({ model }) {
  const age = daysOld(model.releaseDate);
  if (age == null) return <div className="freshness unknown"><span>Unknown release</span></div>;
  const width = Math.max(4, Math.min(100, 100 - age / 180 * 100));
  return <div className="freshness" title={`${age} days since release`}>
    <div><i style={{ width: `${width}%` }} /></div>
    <span>{age === 0 ? 'today' : `${age}d ago`}</span>
  </div>;
}

function SourceLinks({ model, sources }) {
  const rows = (model.sourceKeys || []).map(key => ({ key, ...sources?.[key] })).filter(row => row.url);
  if (model.huggingFace) rows.push({ key: 'hf', kind: 'model', label: 'Hugging Face', url: model.huggingFace });
  return <div className="sourceLinks">{rows.map(row => <a key={row.key} href={row.url} target="_blank" rel="noreferrer"><span>{row.kind || 'source'}</span>{row.label} ↗</a>)}</div>;
}

function HeroStat({ eyebrow, value, title, meta, accent }) {
  return <article className={`heroStat ${accent || ''}`}>
    <span>{eyebrow}</span>
    <strong>{value}</strong>
    <h3>{title}</h3>
    <p>{meta}</p>
  </article>;
}

function ModelSpotlight({ model, status, onCompare, selected }) {
  const arena = model.benchmarks?.arena;
  return <article className="spotlightCard">
    <div className="spotlightTop"><div><TierBadge model={model} /><span className="arenaRank">#{arena?.rank || '—'}</span></div><button className={selected ? 'compareAdd active' : 'compareAdd'} onClick={() => onCompare(model.id)} aria-label={`Compare ${model.name}`}>{selected ? '✓' : '+'}</button></div>
    <h3>{model.name}</h3>
    <p>{model.organization}</p>
    <ProviderPills model={model} status={status} />
    <div className="spotlightScore"><strong>{arena?.score || '—'}</strong><span>Arena score</span></div>
    <div className="spotlightMeta"><span>{fmtContext(model.context)} ctx</span><span>{fmtDate(model.releaseDate)}</span></div>
  </article>;
}

function ArenaBars({ models }) {
  const rows = [...models].filter(m => m.benchmarks?.arena?.score).sort((a, b) => a.benchmarks.arena.rank - b.benchmarks.arena.rank).slice(0, 12);
  if (!rows.length) return <div className="emptyViz">No Arena observations.</div>;
  const min = Math.min(...rows.map(m => m.benchmarks.arena.score)) - 8;
  const max = Math.max(...rows.map(m => m.benchmarks.arena.score));
  return <div className="barChart">
    {rows.map(model => {
      const score = model.benchmarks.arena.score;
      const width = 30 + ((score - min) / Math.max(1, max - min)) * 70;
      const cls = model.provider === 'both' ? 'both' : model.provider;
      return <div className="barRow" key={model.id}>
        <div className="barLabel"><span>#{model.benchmarks.arena.rank}</span><b>{model.name}</b></div>
        <div className="barTrack"><i className={cls} style={{ width: `${width}%` }} /><strong>{score}</strong></div>
      </div>;
    })}
  </div>;
}

function PriceScatter({ models }) {
  const rows = models.filter(model => model.benchmarks?.arena?.score && bestInput(model) != null).slice(0, 36);
  if (rows.length < 3) return <div className="emptyViz">Not enough priced Arena models.</div>;
  const xs = rows.map(model => Math.log10(bestInput(model) + 0.05));
  const ys = rows.map(model => model.benchmarks.arena.score);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys) - 4, maxY = Math.max(...ys) + 4;
  const sx = value => 48 + ((value - minX) / Math.max(.001, maxX - minX)) * 560;
  const sy = value => 248 - ((value - minY) / Math.max(1, maxY - minY)) * 200;
  return <div className="scatterWrap">
    <svg viewBox="0 0 650 285" role="img" aria-label="Arena score versus lowest provider input price">
      {[0, 1, 2, 3].map(n => <line key={n} x1="48" x2="610" y1={48 + n * 62} y2={48 + n * 62} className="grid" />)}
      <text x="48" y="275" className="axis">LOWEST INPUT PRICE / 1M →</text>
      <text x="8" y="22" className="axis">ARENA ↑</text>
      {rows.map((model, index) => <g key={model.id} className={`dot dot-${model.provider}`}>
        <circle cx={sx(Math.log10(bestInput(model) + 0.05))} cy={sy(model.benchmarks.arena.score)} r={index < 8 ? 6 : 4} />
        {index < 7 && <text x={sx(Math.log10(bestInput(model) + 0.05)) + 8} y={sy(model.benchmarks.arena.score) - 7}>{model.name.length > 18 ? `${model.name.slice(0, 17)}…` : model.name}</text>}
      </g>)}
    </svg>
  </div>;
}

function DetailPanel({ model, sources }) {
  const b = model.benchmarks || {};
  return <div className="detailPanel">
    <div className="detailTop">
      <div><span className="detailLabel">Benchmark evidence</span><div className="metricChips">
        <span><b>Arena</b>{b.arena?.score ? `${b.arena.score} · #${b.arena.rank}` : 'Not evaluated'}</span>
        <span><b>AA Intelligence</b>{b.artificialAnalysis?.intelligence ?? 'Not evaluated'}</span>
        <span><b>LLM Stats</b>{b.llmStats?.overall ?? 'Not evaluated'}</span>
        <span><b>Kilo coding</b>{b.kilo?.completion != null ? `${b.kilo.completion}%` : 'Not evaluated'}</span>
        <span><b>Consensus β</b>{model.ranking?.consensus ?? 'Insufficient evidence'}</span>
      </div></div>
      <div><span className="detailLabel">Freshness</span><Freshness model={model} /></div>
    </div>
    <div className="specGrid">
      <div><span>Context</span><b>{fmtContext(model.context)}</b></div>
      <div><span>Parameters</span><b>{model.paramsTotalB ? `${model.paramsTotalB}B` : 'Unknown'}</b><small>{model.paramsActiveB ? `${model.paramsActiveB}B active` : ''}</small></div>
      <div><span>Precision</span><b>{model.quantization || 'Not published'}</b></div>
      <div><span>License</span><b>{model.license || model.openness || 'Unknown'}</b></div>
      <div><span>Released</span><b>{fmtDate(model.releaseDate)}</b></div>
      <div><span>Capabilities</span><b>{(model.capabilities || []).join(' · ') || 'Unknown'}</b></div>
    </div>
    <div className="providerDetails"><div><span className="detailLabel">Provider pricing · USD / 1M tokens · input / output</span><PriceCell model={model} /></div><div><span className="detailLabel">References</span><SourceLinks model={model} sources={sources} /></div></div>
  </div>;
}

function metricFor(model, view) {
  if (view === 'arena') return model.benchmarks?.arena?.score ?? null;
  if (view === 'intelligence') return model.benchmarks?.artificialAnalysis?.intelligence ?? null;
  if (view === 'coding') return model.benchmarks?.kilo?.completion ?? model.benchmarks?.llmStats?.coding ?? null;
  if (view === 'price') return bestInput(model);
  if (view === 'newest') return model.releaseDate ? new Date(`${model.releaseDate}T00:00:00Z`).getTime() : null;
  return null;
}

function MetricCell({ model, view }) {
  if (view === 'arena') return <div className="primaryMetric"><strong>{model.benchmarks?.arena?.score ?? '—'}</strong><span>{model.benchmarks?.arena?.rank ? `Arena #${model.benchmarks.arena.rank}` : 'Not evaluated'}</span></div>;
  if (view === 'intelligence') return <div className="primaryMetric"><strong>{model.benchmarks?.artificialAnalysis?.intelligence ?? '—'}</strong><span>AA Intelligence</span></div>;
  if (view === 'coding') {
    const kilo = model.benchmarks?.kilo?.completion;
    const llm = model.benchmarks?.llmStats?.coding;
    return <div className="primaryMetric"><strong>{kilo != null ? `${kilo}%` : llm ?? '—'}</strong><span>{kilo != null ? 'Kilo completion' : llm != null ? 'LLM Stats coding' : 'Not evaluated'}</span></div>;
  }
  if (view === 'price') return <PriceCell model={model} compact />;
  return <div className="primaryMetric"><strong>{fmtDate(model.releaseDate)}</strong><span>{daysOld(model.releaseDate) == null ? 'Release unknown' : `${daysOld(model.releaseDate)}d ago`}</span></div>;
}

function MobileModelCard({ model, view, status, selected, onCompare, onExpand, expanded, sources }) {
  return <article className="mobileModelCard">
    <button className="mobileCardMain" onClick={onExpand}>
      <div className="mobileRank"><TierBadge model={model} /><span>{model.benchmarks?.arena?.rank ? `#${model.benchmarks.arena.rank}` : '—'}</span></div>
      <div className="mobileIdentity"><h3>{model.name}</h3><p>{model.organization}</p><ProviderPills model={model} status={status} /></div>
      <MetricCell model={model} view={view} />
    </button>
    <div className="mobileCardMeta"><span>{fmtContext(model.context)} context</span><span>{fmtDate(model.releaseDate)}</span><button className={selected ? 'compareAdd active' : 'compareAdd'} onClick={() => onCompare(model.id)}>{selected ? '✓' : '+'}</button></div>
    {expanded && <DetailPanel model={model} sources={sources} />}
  </article>;
}

export default function Home() {
  const [data, setData] = useState({ models: [], status: {}, sources: {}, benchmarkSnapshot: {}, updated: '' });
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const [license, setLicense] = useState('all');
  const [view, setView] = useState('arena');
  const [expanded, setExpanded] = useState(null);
  const [compare, setCompare] = useState([]);

  useEffect(() => {
    fetch('/api/models').then(r => r.json()).then(setData).catch(() => setData(current => ({ ...current, error: true })));
  }, []);

  const models = data.models || [];
  const arenaModels = useMemo(() => models.filter(m => m.benchmarks?.arena?.rank).sort((a, b) => a.benchmarks.arena.rank - b.benchmarks.arena.rank), [models]);
  const arenaLeader = arenaModels[0];
  const intelligenceLeader = useMemo(() => [...models].filter(m => m.benchmarks?.artificialAnalysis?.intelligence != null).sort((a, b) => b.benchmarks.artificialAnalysis.intelligence - a.benchmarks.artificialAnalysis.intelligence)[0], [models]);
  const openLeader = useMemo(() => arenaModels.find(m => String(m.openness).toLowerCase().includes('open')), [arenaModels]);
  const overlap = models.filter(m => m.providers?.venice && m.providers?.morpheus).length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = models.filter(model => {
      if (needle && !`${model.name} ${model.organization} ${(model.providerIds?.venice || []).join(' ')} ${(model.providerIds?.morpheus || []).join(' ')}`.toLowerCase().includes(needle)) return false;
      if (provider === 'venice' && !model.providers?.venice) return false;
      if (provider === 'morpheus' && !model.providers?.morpheus) return false;
      if (provider === 'both' && !(model.providers?.venice && model.providers?.morpheus)) return false;
      if (license === 'open' && !String(model.openness).toLowerCase().includes('open')) return false;
      if (license === 'closed' && String(model.openness).toLowerCase().includes('open')) return false;
      return true;
    });
    return rows.sort((a, b) => {
      if (view === 'arena') return (a.benchmarks?.arena?.rank || 9999) - (b.benchmarks?.arena?.rank || 9999);
      if (view === 'price') return (metricFor(a, view) ?? 9999) - (metricFor(b, view) ?? 9999);
      return (metricFor(b, view) ?? -Infinity) - (metricFor(a, view) ?? -Infinity);
    });
  }, [models, query, provider, license, view]);

  const toggleCompare = id => setCompare(current => current.includes(id) ? current.filter(x => x !== id) : current.length < 4 ? [...current, id] : current);
  const compareModels = compare.map(id => models.find(m => m.id === id)).filter(Boolean);
  const views = [
    ['arena', 'Arena Overall'], ['intelligence', 'AA Intelligence'], ['coding', 'Coding'], ['price', 'Price'], ['newest', 'Newest'],
  ];

  return <main>
    <header className="topbar">
      <a className="brand" href="#top"><i />LLM INDEX</a>
      <nav><a href="#leaders">Leaders</a><a href="#analysis">Analysis</a><a href="#rankings">Rankings</a><a href="#compare">Compare</a></nav>
      <a className="methodLink" href="/methodology">Methodology</a>
    </header>

    <section id="top" className="hero shell">
      <div className="heroCopy">
        <div className="liveLine"><span />TEXT MODELS · VENICE + MORPHEUS · SOURCE-NATIVE RANKS</div>
        <h1>Models you can<br /><em>actually run.</em></h1>
        <p>Independent benchmark rankings filtered to text models available through Venice, Morpheus, or both. Provider economics and technical metadata stay separate from benchmark rank.</p>
        <div className="heroProviders"><span className="veniceSwatch">Venice</span><span className="morpheusSwatch">Morpheus</span><span>{models.length || '—'} models tracked</span><span>{overlap || '—'} available on both</span></div>
      </div>
      <div className="heroAside">
        <div><span>Research checked</span><b>{data.updated || 'Loading…'}</b></div>
        <div><span>Arena snapshot</span><b>{data.benchmarkSnapshot?.arena?.sourceDate || 'Aug 12, 2026'}</b></div>
        <div><span>Default ranking</span><b>Arena Overall</b></div>
      </div>
    </section>

    <section id="leaders" className="shell leadersSection">
      <div className="sectionHeading"><div><span className="eyebrow">CURRENT SIGNAL</span><h2>At a glance</h2></div><p>No invented “overall intelligence” headline. Each card names its source.</p></div>
      <div className="heroStats">
        <HeroStat eyebrow="ARENA LEADER" value={arenaLeader?.benchmarks?.arena?.score || '—'} title={arenaLeader?.name || 'Loading'} meta={arenaLeader ? `Global Arena rank #${arenaLeader.benchmarks.arena.rank}` : 'Source: Arena Overall'} accent="purple" />
        <HeroStat eyebrow="AA INTELLIGENCE" value={intelligenceLeader?.benchmarks?.artificialAnalysis?.intelligence ?? '—'} title={intelligenceLeader?.name || 'Loading'} meta="Artificial Analysis Intelligence Index" accent="blue" />
        <HeroStat eyebrow="TOP OPEN-WEIGHT" value={openLeader?.benchmarks?.arena?.score || '—'} title={openLeader?.name || 'Loading'} meta={openLeader ? `Arena #${openLeader.benchmarks.arena.rank}` : 'Among provider-available models'} accent="green" />
        <HeroStat eyebrow="PROVIDER OVERLAP" value={overlap || '—'} title="Available on both" meta="Venice + Morpheus catalog overlap" />
      </div>

      <div className="spotlightGrid">
        {arenaModels.slice(0, 6).map(model => <ModelSpotlight key={model.id} model={model} status={data.status} onCompare={toggleCompare} selected={compare.includes(model.id)} />)}
      </div>
    </section>

    <section id="analysis" className="shell analysisSection">
      <div className="sectionHeading"><div><span className="eyebrow">VISUAL ANALYSIS</span><h2>Frontier, not a word cloud</h2></div><p>Source-native Arena scores and provider pricing. Missing observations stay missing.</p></div>
      <div className="vizGrid">
        <article className="vizCard"><div className="vizHead"><div><span>ARENA OVERALL</span><h3>Top provider-available models</h3></div><small>Score · higher is better</small></div><ArenaBars models={models} /></article>
        <article className="vizCard"><div className="vizHead"><div><span>PRICE FRONTIER</span><h3>Capability vs. lowest input price</h3></div><small>USD / 1M tokens</small></div><PriceScatter models={models} /></article>
      </div>
    </section>

    <section id="rankings" className="shell rankingsSection">
      <div className="sectionHeading rankingsHeading"><div><span className="eyebrow">LEADERBOARD</span><h2>Compare the field</h2></div><p>{filtered.length} models visible · click a model row for architecture, freshness and references.</p></div>

      <div className="viewTabs" role="tablist" aria-label="Ranking source">
        {views.map(([key, label]) => <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>{label}</button>)}
      </div>
      <div className="viewNote">
        {view === 'arena' && <>Arena Overall is the default because it is a source-native human-preference rank across broad text tasks.</>}
        {view === 'intelligence' && <>Artificial Analysis Intelligence Index is shown independently; model effort variants may differ from provider defaults.</>}
        {view === 'coding' && <>Kilo completion is preferred when available; otherwise LLM Stats coding is shown.</>}
        {view === 'price' && <>Sorted by the lowest recorded provider input price. Table prices are <b>USD per 1M tokens, input / output.</b></>}
        {view === 'newest' && <>Release date is metadata only. It does not alter Arena or consensus rank.</>}
      </div>

      <div className="filterBar">
        <label className="searchBox"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search models, labs, provider IDs…" aria-label="Search models" /></label>
        <div className="providerFilter" aria-label="Provider filter">
          {[['all','All'],['venice','Venice'],['morpheus','Morpheus'],['both','Both']].map(([key,label]) => <button key={key} onClick={() => setProvider(key)} className={provider === key ? `active ${key}` : key}>{label}</button>)}
        </div>
        <select value={license} onChange={e => setLicense(e.target.value)} aria-label="License filter"><option value="all">All licenses</option><option value="open">Open weights</option><option value="closed">Proprietary</option></select>
      </div>

      <div className="tableShell">
        <div className="tableScroll">
          <table className="leaderboardTable">
            <thead><tr>
              <th className="rankHead">Arena</th><th>Model</th><th>{view === 'arena' ? 'Score' : view === 'intelligence' ? 'Intelligence' : view === 'coding' ? 'Coding' : view === 'price' ? 'Price' : 'Released'}</th><th>Providers</th><th><button onClick={() => setView('price')}>Price <span>$/1M in / out</span></button></th><th><button onClick={() => setView('newest')}>Released</button></th><th>Context</th><th aria-label="Compare">Compare</th>
            </tr></thead>
            <tbody>{filtered.map((model, index) => <>
              <tr key={model.id} className={expanded === model.id ? 'modelRow open' : 'modelRow'} onClick={() => setExpanded(expanded === model.id ? null : model.id)}>
                <td className="rankCell"><TierBadge model={model} /><strong>{model.benchmarks?.arena?.rank ? `#${model.benchmarks.arena.rank}` : '—'}</strong></td>
                <td className="modelCell"><strong>{model.name}</strong><span>{model.organization} · {model.openness || model.license || 'Unknown license'}</span></td>
                <td><MetricCell model={model} view={view} /></td>
                <td><ProviderPills model={model} status={data.status} /></td>
                <td><PriceCell model={model} compact /></td>
                <td className="releasedCell"><strong>{fmtDate(model.releaseDate)}</strong><Freshness model={model} /></td>
                <td className="contextCell">{fmtContext(model.context)}</td>
                <td><button className={compare.includes(model.id) ? 'compareAdd active' : 'compareAdd'} onClick={e => { e.stopPropagation(); toggleCompare(model.id); }}>{compare.includes(model.id) ? '✓' : '+'}</button></td>
              </tr>
              {expanded === model.id && <tr key={`${model.id}-detail`} className="detailRow"><td colSpan="8"><DetailPanel model={model} sources={data.sources} /></td></tr>}
            </>)}</tbody>
          </table>
        </div>
      </div>

      <div className="mobileCards">
        {filtered.map(model => <MobileModelCard key={model.id} model={model} view={view} status={data.status} selected={compare.includes(model.id)} onCompare={toggleCompare} onExpand={() => setExpanded(expanded === model.id ? null : model.id)} expanded={expanded === model.id} sources={data.sources} />)}
      </div>

      <div className="tierLegend"><span><b className="tier tier-S">S</b>Arena top 10</span><span><b className="tier tier-A">A</b>top 25</span><span><b className="tier tier-B">B</b>top 50</span><span><b className="tier tier-C">C</b>top 100</span><span><b className="tier tier-D">D</b>ranked</span><span><b className="tier tier-U">U</b>not evaluated</span></div>
    </section>

    <section id="compare" className="shell compareSection">
      <div className="sectionHeading"><div><span className="eyebrow">COMPARE</span><h2>{compareModels.length ? `${compareModels.length} selected` : 'Select up to four models'}</h2></div>{compareModels.length > 0 && <button className="clearCompare" onClick={() => setCompare([])}>Clear</button>}</div>
      {compareModels.length === 0 ? <div className="compareEmpty">Use the + buttons in the leaderboard. Comparison keeps benchmark sources and provider prices distinct.</div> : <div className="compareGrid">{compareModels.map(model => <article className="compareCard" key={model.id}>
        <div className="compareCardHead"><div><TierBadge model={model} /><h3>{model.name}</h3><p>{model.organization}</p></div><button onClick={() => toggleCompare(model.id)}>×</button></div>
        <ProviderPills model={model} status={data.status} />
        <dl><div><dt>Arena</dt><dd>{model.benchmarks?.arena?.score ? `${model.benchmarks.arena.score} · #${model.benchmarks.arena.rank}` : 'Not evaluated'}</dd></div><div><dt>AA Intelligence</dt><dd>{model.benchmarks?.artificialAnalysis?.intelligence ?? '—'}</dd></div><div><dt>LLM Stats</dt><dd>{model.benchmarks?.llmStats?.overall ?? '—'}</dd></div><div><dt>Kilo</dt><dd>{model.benchmarks?.kilo?.completion != null ? `${model.benchmarks.kilo.completion}%` : '—'}</dd></div><div><dt>Context</dt><dd>{fmtContext(model.context)}</dd></div><div><dt>Released</dt><dd>{fmtDate(model.releaseDate)}</dd></div></dl>
        <PriceCell model={model} />
      </article>)}</div>}
    </section>

    <section className="shell provenanceSection">
      <div className="sectionHeading"><div><span className="eyebrow">PROVENANCE</span><h2>Sources are part of the product</h2></div><p>Arena rank is not replaced by our own score. Experimental consensus appears only as secondary evidence.</p></div>
      <div className="sourceGrid">{Object.entries(data.sources || {}).slice(0, 12).map(([key, source]) => <a key={key} href={source.url} target="_blank" rel="noreferrer"><span>{source.kind}</span><strong>{source.label}</strong><i>↗</i></a>)}</div>
    </section>

    {compareModels.length > 0 && <div className="compareDock"><span><b>{compareModels.length}</b> model{compareModels.length > 1 ? 's' : ''} selected</span><a href="#compare">Compare now ↓</a></div>}

    <footer className="footer shell"><div><b>LLM INDEX</b><span>Text-model research across Venice + Morpheus.</span></div><div><a href="/methodology">Methodology</a><a href="https://github.com/bitwikiorg/llm-rankings" target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>
  </main>;
}
