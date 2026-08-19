'use client';

import { useEffect, useMemo, useState } from 'react';

const fmt = value => value == null ? '—' : Number(value).toLocaleString();
const fmt1 = value => value == null ? '—' : Number(value).toFixed(1);
const fmtContext = value => value == null ? '—' : value >= 1_000_000 ? `${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M` : `${Math.round(value / 1000)}K`;
const fmtPrice = value => value == null ? '—' : `$${Number(value).toFixed(2)}`;
const fmtDate = date => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00Z`)) : 'Unknown';

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

function daysOld(date) {
  if (!date) return null;
  const value = Date.now() - new Date(`${date}T00:00:00Z`).getTime();
  return Number.isFinite(value) ? Math.max(0, Math.floor(value / 86400000)) : null;
}

function ProviderPills({ model }) {
  return <div className="r-providers">
    {model.providers?.venice && <span className="r-provider r-provider-venice">Venice</span>}
    {model.providers?.morpheus && <span className="r-provider r-provider-morpheus">Morpheus</span>}
  </div>;
}

function Grade({ model }) {
  const tier = model.ranking?.tier;
  if (!tier) return <span className="r-state r-state-pending">Pending</span>;
  const aggregate = model.ranking?.tierBasis === 'aggregate';
  return <span className={`r-grade r-grade-${tier}`} title={aggregate ? 'Grade inferred from the fallback aggregate; not an Arena tier.' : 'Grade derived from Arena Overall rank.'}>{aggregate && <i>β</i>}{tier}</span>;
}

function RankMark({ model }) {
  if (model.rank) return <div className="r-rank"><strong>#{model.rank}</strong><span>Arena</span></div>;
  if (model.fallbackRank) return <div className="r-rank r-rank-beta"><strong>β{model.fallbackRank}</strong><span>Aggregate</span></div>;
  return <div className="r-rank r-rank-pending"><strong>—</strong><span>Pending</span></div>;
}

function PrimarySignal({ model }) {
  if (model.rank) return <div className="r-primary"><strong>{model.benchmarks?.arena?.score ?? '—'}</strong><span>Arena score · #{model.rank}</span></div>;
  if (model.ranking?.aggregate != null) return <div className="r-primary r-primary-beta"><strong>{fmt1(model.ranking.aggregate)}</strong><span>β aggregate · {model.ranking.confidence} confidence</span></div>;
  return <div className="r-primary r-primary-pending"><strong>Pending</strong><span>No independent overall score yet</span></div>;
}

function PriceCell({ model }) {
  const rows = offers(model);
  if (!rows.length) return <span className="r-muted">Not listed</span>;
  return <div className="r-price-list">{rows.map(row => <div className="r-price" key={row.key}>
    <span className={`r-price-provider r-price-${row.key}`}>{row.label}</span>
    <b>{fmtPrice(row.input)}</b><i>/</i><b>{fmtPrice(row.output)}</b>
  </div>)}</div>;
}

function Freshness({ model }) {
  const age = daysOld(model.releaseDate);
  if (age == null) return <span className="r-muted">Release unknown</span>;
  const width = Math.max(3, Math.min(100, 100 - age / 180 * 100));
  return <div className="r-fresh" title={`${age} days since release`}><div><i style={{ width: `${width}%` }} /></div><span>{age}d</span></div>;
}

function allSources(model, sourceMap) {
  const keyed = (model.sourceKeys || []).map(key => ({ key, ...sourceMap?.[key] })).filter(item => item.url);
  const researched = (model.researchSources || []).map((item, index) => ({ key: `research-${index}`, ...item }));
  const hf = model.huggingFace ? [{ key: 'hf', label: 'Hugging Face', kind: 'model', url: model.huggingFace }] : [];
  return [...keyed, ...researched, ...hf].filter((item, index, rows) => rows.findIndex(other => other.url === item.url) === index);
}

function Evidence({ model }) {
  const b = model.benchmarks || {};
  return <div className="r-evidence">
    <span className={b.arena?.score != null ? 'on' : ''}>Arena</span>
    <span className={b.artificialAnalysis?.intelligence != null ? 'on' : ''}>AA</span>
    <span className={b.llmStats?.overall != null ? 'on' : ''}>LLM Stats</span>
    <small>{model.ranking?.confidence || 'none'}</small>
  </div>;
}

function DetailPanel({ model, sources }) {
  const b = model.benchmarks || {};
  const refs = allSources(model, sources);
  return <div className="r-detail">
    <div className="r-detail-head">
      <div><span>Evaluation state</span><strong>{model.evaluationState || model.ranking?.basis}</strong></div>
      <div><span>Ranking basis</span><strong>{model.ranking?.basis}</strong><small>{model.ranking?.tierBasis === 'aggregate' ? 'β grade is derived from available independent sources, not Arena.' : model.rank ? 'Grade follows Arena rank band.' : 'No grade until evidence exists.'}</small></div>
    </div>
    <div className="r-benchmark-grid">
      <div><span>Arena Overall</span><b>{b.arena?.score != null ? `${b.arena.score}${b.arena.rank ? ` · #${b.arena.rank}` : ''}` : 'Not evaluated'}</b><small>{b.arena?.votes ? `${fmt(b.arena.votes)} votes` : b.arena?.spread || ''}</small></div>
      <div><span>Artificial Analysis</span><b>{b.artificialAnalysis?.intelligence ?? 'Not evaluated'}</b><small>{b.artificialAnalysis?.variant || 'Intelligence Index'}</small></div>
      <div><span>LLM Stats</span><b>{b.llmStats?.overall ?? 'Not evaluated'}</b><small>{b.llmStats ? `R ${b.llmStats.reasoning ?? '—'} · C ${b.llmStats.coding ?? '—'} · A ${b.llmStats.agent ?? '—'}` : ''}</small></div>
      <div><span>Kilo coding</span><b>{b.kilo?.completion != null ? `${b.kilo.completion}%` : 'Not evaluated'}</b><small>{b.kilo?.costPerAttempt != null ? `${fmtPrice(b.kilo.costPerAttempt)} / attempt` : ''}</small></div>
      <div><span>Fallback aggregate</span><b>{model.ranking?.aggregate != null ? fmt1(model.ranking.aggregate) : 'Insufficient evidence'}</b><small>{model.ranking?.sourceCount || 0}/3 overall source families · {model.ranking?.confidence} confidence</small></div>
    </div>
    <div className="r-spec-grid">
      <div><span>Context</span><b>{fmtContext(model.context)}</b></div>
      <div><span>Parameters</span><b>{model.paramsTotalB ? `${model.paramsTotalB}B` : 'Unknown'}</b><small>{model.paramsActiveB ? `${model.paramsActiveB}B active` : ''}</small></div>
      <div><span>Precision</span><b>{model.quantization || 'Not published'}</b></div>
      <div><span>License</span><b>{model.license || model.openness || 'Unknown'}</b></div>
      <div><span>Released</span><b>{fmtDate(model.releaseDate)}</b></div>
      <div><span>Capabilities</span><b>{(model.capabilities || []).join(' · ') || 'Unknown'}</b></div>
    </div>
    <div className="r-detail-bottom">
      <div><span className="r-detail-label">Provider price · input / output · USD / 1M tokens</span><PriceCell model={model} /></div>
      <div><span className="r-detail-label">References</span><div className="r-sources">{refs.map(ref => <a href={ref.url} key={ref.key} target="_blank" rel="noreferrer"><small>{ref.kind || 'source'}</small>{ref.label} ↗</a>)}</div></div>
    </div>
  </div>;
}

function ArenaChart({ models }) {
  const rows = models.filter(model => model.rank && model.benchmarks?.arena?.score != null).slice(0, 12);
  if (!rows.length) return null;
  const min = Math.min(...rows.map(model => model.benchmarks.arena.score)) - 5;
  const max = Math.max(...rows.map(model => model.benchmarks.arena.score));
  return <div className="r-bars">{rows.map(model => {
    const width = 24 + ((model.benchmarks.arena.score - min) / Math.max(1, max - min)) * 76;
    return <div className="r-bar-row" key={model.id}><span>#{model.rank}</span><b>{model.name}</b><div><i className={`r-bar-${model.provider}`} style={{ width: `${width}%` }} /><strong>{model.benchmarks.arena.score}</strong></div></div>;
  })}</div>;
}

function AggregateChart({ models }) {
  const rows = models.filter(model => !model.rank && model.ranking?.aggregate != null).slice(0, 10);
  if (!rows.length) return <div className="r-empty">No fallback aggregates.</div>;
  return <div className="r-bars">{rows.map(model => <div className="r-bar-row" key={model.id}><span>β{model.fallbackRank}</span><b>{model.name}</b><div><i className="r-bar-beta" style={{ width: `${Math.max(4, model.ranking.aggregate)}%` }} /><strong>{fmt1(model.ranking.aggregate)}</strong></div></div>)}</div>;
}

function MobileCard({ model, selected, onCompare, onExpand, expanded, sources }) {
  return <article className="r-mobile-card">
    <button className="r-mobile-main" onClick={onExpand}>
      <div className="r-mobile-rank"><RankMark model={model} /><Grade model={model} /></div>
      <div className="r-mobile-name"><strong>{model.name}</strong><span>{model.organization}</span><ProviderPills model={model} /></div>
      <PrimarySignal model={model} />
    </button>
    <div className="r-mobile-meta"><span>{fmtContext(model.context)} ctx</span><span>{fmtDate(model.releaseDate)}</span><button className={selected ? 'r-compare active' : 'r-compare'} onClick={() => onCompare(model.id)}>{selected ? '✓' : '+'}</button></div>
    {expanded && <DetailPanel model={model} sources={sources} />}
  </article>;
}

export default function Home() {
  const [data, setData] = useState({ models: [], status: {}, sources: {}, benchmarkSnapshot: {}, updated: '' });
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const [license, setLicense] = useState('all');
  const [sort, setSort] = useState('primary');
  const [expanded, setExpanded] = useState(null);
  const [compare, setCompare] = useState([]);

  useEffect(() => {
    fetch('/api/models').then(response => response.json()).then(setData).catch(() => setData(current => ({ ...current, error: true })));
  }, []);

  const models = data.models || [];
  const arenaModels = useMemo(() => models.filter(model => model.rank).sort((a, b) => a.rank - b.rank), [models]);
  const fallbackModels = useMemo(() => models.filter(model => !model.rank && model.fallbackRank).sort((a, b) => a.fallbackRank - b.fallbackRank), [models]);
  const arenaLeader = arenaModels[0];
  const fallbackLeader = fallbackModels[0];
  const openLeader = arenaModels.find(model => String(model.openness || '').toLowerCase().includes('open'));
  const overlap = models.filter(model => model.providers?.venice && model.providers?.morpheus).length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = models.filter(model => {
      if (needle && !`${model.name} ${model.organization} ${(model.providerIds?.venice || []).join(' ')} ${(model.providerIds?.morpheus || []).join(' ')}`.toLowerCase().includes(needle)) return false;
      if (provider === 'venice' && !model.providers?.venice) return false;
      if (provider === 'morpheus' && !model.providers?.morpheus) return false;
      if (provider === 'both' && !(model.providers?.venice && model.providers?.morpheus)) return false;
      const open = String(model.openness || model.license || '').toLowerCase().includes('open') || String(model.license || '').toLowerCase().includes('apache') || String(model.license || '').toLowerCase().includes('mit');
      if (license === 'open' && !open) return false;
      if (license === 'closed' && open) return false;
      return true;
    });

    return [...rows].sort((a, b) => {
      if (sort === 'aggregate') return (b.ranking?.aggregate ?? -1) - (a.ranking?.aggregate ?? -1);
      if (sort === 'intelligence') return (b.benchmarks?.artificialAnalysis?.intelligence ?? -1) - (a.benchmarks?.artificialAnalysis?.intelligence ?? -1);
      if (sort === 'coding') return (b.benchmarks?.kilo?.completion ?? b.benchmarks?.llmStats?.coding ?? -1) - (a.benchmarks?.kilo?.completion ?? a.benchmarks?.llmStats?.coding ?? -1);
      if (sort === 'price') return (bestInput(a) ?? Number.MAX_VALUE) - (bestInput(b) ?? Number.MAX_VALUE);
      if (sort === 'newest') return (b.releaseDate ? new Date(`${b.releaseDate}T00:00:00Z`).getTime() : 0) - (a.releaseDate ? new Date(`${a.releaseDate}T00:00:00Z`).getTime() : 0);
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.rank) return -1;
      if (b.rank) return 1;
      if (a.fallbackRank && b.fallbackRank) return a.fallbackRank - b.fallbackRank;
      if (a.fallbackRank) return -1;
      if (b.fallbackRank) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [models, query, provider, license, sort]);

  const compared = compare.map(id => models.find(model => model.id === id)).filter(Boolean);
  const toggleCompare = id => setCompare(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 4 ? [...current, id] : current);

  return <main className="r-app">
    <header className="r-topbar"><a className="r-brand" href="/"><i />LLM INDEX</a><nav><a href="#rankings">Rankings</a><a href="#analysis">Analysis</a><a href="#compare">Compare</a></nav><a className="r-method" href="/methodology">Methodology ↗</a></header>

    <section className="r-hero r-shell">
      <div><span className="r-kicker">TEXT MODELS · VENICE + MORPHEUS</span><h1>Rank the evidence.<br/><em>Show the basis.</em></h1><p>Arena Overall is the default source-native rank. When an exact human Arena rank is unavailable, the model receives a clearly marked β fallback from the independent benchmark families that actually have data. No “U” grade. No invented placement.</p></div>
      <aside><div><span>Provider catalog</span><b>{models.length || '—'} text models</b></div><div><span>Research snapshot</span><b>{data.updated || 'Loading…'}</b></div><div><span>Fallback rule</span><b>Arena → transparent β aggregate</b></div></aside>
    </section>

    <section className="r-shell r-leaders">
      <div className="r-section-head"><div><span className="r-kicker">LEADERS</span><h2>Signal first.</h2></div><p>Grades are S/A/B/C/D. Arena grades use source rank bands; β grades are visibly marked as aggregate-derived.</p></div>
      <div className="r-stat-grid">
        <article className="r-stat r-stat-purple"><span>Arena leader</span><strong>{arenaLeader?.benchmarks?.arena?.score ?? '—'}</strong><h3>{arenaLeader?.name || 'Loading…'}</h3><p>{arenaLeader ? `Arena #${arenaLeader.rank} · ${fmt(arenaLeader.benchmarks?.arena?.votes)} votes` : ''}</p></article>
        <article className="r-stat r-stat-cyan"><span>Fallback leader</span><strong>{fallbackLeader?.ranking?.aggregate != null ? fmt1(fallbackLeader.ranking.aggregate) : '—'}</strong><h3>{fallbackLeader?.name || 'No fallback models'}</h3><p>{fallbackLeader ? `β${fallbackLeader.fallbackRank} · ${fallbackLeader.ranking.confidence} confidence · ${fallbackLeader.ranking.sourceCount}/3 sources` : ''}</p></article>
        <article className="r-stat r-stat-green"><span>Open-weight Arena leader</span><strong>{openLeader ? `#${openLeader.rank}` : '—'}</strong><h3>{openLeader?.name || '—'}</h3><p>{openLeader?.license || openLeader?.openness || ''}</p></article>
        <article className="r-stat"><span>Provider overlap</span><strong>{overlap || '—'}</strong><h3>Venice + Morpheus</h3><p>Explicit shared catalog entries.</p></article>
      </div>
    </section>

    <section id="analysis" className="r-shell r-analysis">
      <div className="r-section-head"><div><span className="r-kicker">VISUAL ANALYSIS</span><h2>Two different ranking regimes.</h2></div><p>Source-native Arena ranks are never silently mixed with fallback aggregate ranks.</p></div>
      <div className="r-viz-grid"><article className="r-viz"><header><div><span>ARENA OVERALL</span><h3>Top source-ranked models</h3></div><small>score</small></header><ArenaChart models={arenaModels} /></article><article className="r-viz"><header><div><span>β FALLBACK</span><h3>Models awaiting an exact Arena rank</h3></div><small>normalized aggregate</small></header><AggregateChart models={fallbackModels} /></article></div>
    </section>

    <section id="rankings" className="r-shell r-rankings">
      <div className="r-section-head"><div><span className="r-kicker">LEADERBOARD</span><h2>Text model rankings</h2></div><p>{filtered.length} visible · click any row for benchmarks, architecture, pricing and references.</p></div>
      <div className="r-rule"><b>Primary order:</b> Arena Overall when available. Models without a human Arena rank use <b>β aggregate</b> from available Arena AutoEval / Artificial Analysis / LLM Stats evidence, with source count and confidence shown.</div>
      <div className="r-controls">
        <label className="r-search"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search model, lab, provider ID…" /></label>
        <div className="r-provider-filter">{['all','venice','morpheus','both'].map(item => <button key={item} onClick={() => setProvider(item)} className={provider === item ? `active ${item}` : item}>{item === 'all' ? 'All' : item[0].toUpperCase() + item.slice(1)}</button>)}</div>
        <select value={license} onChange={event => setLicense(event.target.value)} aria-label="License filter"><option value="all">All licenses</option><option value="open">Open weights</option><option value="closed">Proprietary</option></select>
        <select value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort models"><option value="primary">Primary order</option><option value="aggregate">Aggregate</option><option value="intelligence">AA Intelligence</option><option value="coding">Coding</option><option value="price">Lowest input price</option><option value="newest">Newest</option></select>
      </div>

      <div className="r-table-wrap">
        <table className="r-table">
          <colgroup><col className="r-col-rank"/><col className="r-col-grade"/><col className="r-col-model"/><col className="r-col-signal"/><col className="r-col-provider"/><col className="r-col-price"/><col className="r-col-release"/><col className="r-col-context"/><col className="r-col-evidence"/><col className="r-col-compare"/></colgroup>
          <thead><tr><th>Rank</th><th>Grade</th><th>Model</th><th>Primary signal</th><th>Providers</th><th>Price <small>$/1M · in/out</small></th><th>Released</th><th>Context</th><th>Evidence</th><th>+</th></tr></thead>
          <tbody>{filtered.map(model => <tbody className="r-row-group" key={model.id}>
            <tr className={expanded === model.id ? 'r-model-row open' : 'r-model-row'} onClick={() => setExpanded(expanded === model.id ? null : model.id)}>
              <td><RankMark model={model} /></td><td><Grade model={model} /></td><td><div className="r-model"><strong>{model.name}</strong><span>{model.organization}</span><small>{model.openness || model.license || 'Unknown license'}</small></div></td><td><PrimarySignal model={model} /></td><td><ProviderPills model={model} /></td><td><PriceCell model={model} /></td><td><div className="r-release"><strong>{fmtDate(model.releaseDate)}</strong><Freshness model={model} /></div></td><td><strong className="r-context">{fmtContext(model.context)}</strong></td><td><Evidence model={model} /></td><td><button className={compare.includes(model.id) ? 'r-compare active' : 'r-compare'} onClick={event => { event.stopPropagation(); toggleCompare(model.id); }} aria-label={`Compare ${model.name}`}>{compare.includes(model.id) ? '✓' : '+'}</button></td>
            </tr>
            {expanded === model.id && <tr className="r-detail-row"><td colSpan="10"><DetailPanel model={model} sources={data.sources} /></td></tr>}
          </tbody>)}</tbody>
        </table>
      </div>

      <div className="r-mobile-list">{filtered.map(model => <MobileCard key={model.id} model={model} selected={compare.includes(model.id)} onCompare={toggleCompare} onExpand={() => setExpanded(expanded === model.id ? null : model.id)} expanded={expanded === model.id} sources={data.sources} />)}</div>
    </section>

    <section id="compare" className="r-shell r-compare-section">
      <div className="r-section-head"><div><span className="r-kicker">COMPARE</span><h2>{compared.length ? `${compared.length} models selected` : 'Select up to four models'}</h2></div><p>Raw benchmark values stay raw. Provider economics stay provider-specific.</p></div>
      {compared.length ? <div className="r-compare-grid">{compared.map(model => <article key={model.id}><header><RankMark model={model}/><Grade model={model}/></header><h3>{model.name}</h3><ProviderPills model={model}/><dl><div><dt>Primary</dt><dd>{model.rank ? `Arena #${model.rank}` : model.fallbackRank ? `β${model.fallbackRank} aggregate` : 'Pending'}</dd></div><div><dt>Arena</dt><dd>{model.benchmarks?.arena?.score ?? '—'}</dd></div><div><dt>AA Intelligence</dt><dd>{model.benchmarks?.artificialAnalysis?.intelligence ?? '—'}</dd></div><div><dt>LLM Stats</dt><dd>{model.benchmarks?.llmStats?.overall ?? '—'}</dd></div><div><dt>Kilo coding</dt><dd>{model.benchmarks?.kilo?.completion != null ? `${model.benchmarks.kilo.completion}%` : '—'}</dd></div><div><dt>Aggregate</dt><dd>{fmt1(model.ranking?.aggregate)}</dd></div><div><dt>Context</dt><dd>{fmtContext(model.context)}</dd></div><div><dt>Released</dt><dd>{fmtDate(model.releaseDate)}</dd></div></dl><PriceCell model={model}/></article>)}</div> : <div className="r-compare-empty">Use the <b>+</b> control in the leaderboard. Selection never changes ranking.</div>}
    </section>

    <footer className="r-footer r-shell"><div><b>LLM INDEX</b><span>Source-first text-model research across Venice + Morpheus.</span></div><div><a href="/methodology">Methodology</a><a href="https://github.com/bitwikiorg/llm-rankings" target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>
  </main>;
}
