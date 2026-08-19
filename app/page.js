'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

const fmt = value => value == null ? '—' : Number(value).toLocaleString();
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

function sourceHref(sources, key) {
  return sources?.[key]?.url || null;
}

function ProviderPills({ model }) {
  return <div className="r-providers">
    {model.providers?.venice && <span className="r-provider r-provider-venice">Venice</span>}
    {model.providers?.morpheus && <span className="r-provider r-provider-morpheus">Morpheus</span>}
  </div>;
}

function Grade({ model }) {
  const tier = model.rank ? model.ranking?.tier : null;
  if (!tier) return <span className="r-no-grade" title="Grades are Arena human-rank bands only">—</span>;
  return <span className={`r-grade r-grade-${tier}`} title="Arena Overall rank band">{tier}</span>;
}

function RankMark({ model }) {
  const rank = model.primaryRank;
  if (!rank) return <div className="r-rank r-rank-pending"><strong>—</strong><span>Pending</span></div>;
  return <div className={`r-rank r-rank-source-${rank.source}`}>
    <strong>#{rank.rank}</strong>
    <span>{rank.label}</span>
  </div>;
}

function NativeSignal({ model }) {
  const rank = model.primaryRank;
  if (!rank) return <div className="r-primary r-primary-pending"><strong>Pending</strong><span>No published overall rank yet</span></div>;
  if (rank.source === 'arena') {
    return <div className="r-primary r-primary-arena"><strong>{rank.score ?? '—'}</strong><span>Arena score</span><small>{model.benchmarks?.arena?.votes ? `${fmt(model.benchmarks.arena.votes)} human votes` : 'human preference'}</small></div>;
  }
  if (rank.source === 'llmStats') {
    return <div className="r-primary r-primary-source"><strong>#{rank.rank}</strong><span>LLM Stats overall rank</span><small>native score {rank.score ?? '—'} · own scale</small></div>;
  }
  return <div className="r-primary r-primary-source"><strong>#{rank.rank}</strong><span>{rank.label} rank</span><small>native score {rank.score ?? '—'}</small></div>;
}

function PriceCell({ model }) {
  const rows = offers(model);
  if (!rows.length) return <span className="r-muted">Not listed</span>;
  return <div className="r-price-list">{rows.map(row => <div className="r-price" key={row.key}><span className={`r-price-provider r-price-${row.key}`}>{row.label}</span><b>{fmtPrice(row.input)}</b><i>/</i><b>{fmtPrice(row.output)}</b></div>)}</div>;
}

function Freshness({ model }) {
  const age = daysOld(model.releaseDate);
  if (age == null) return <span className="r-muted">Date unknown</span>;
  const width = Math.max(3, Math.min(100, 100 - age / 180 * 100));
  return <div className="r-fresh" title={`${age} days since release / announcement`}><div><i style={{ width: `${width}%` }} /></div><span>{age}d</span></div>;
}

function Evidence({ model, sources }) {
  const b = model.benchmarks || {};
  const rows = [
    b.arena?.score != null && { key: 'arena', label: 'Arena', value: b.arena.rank ? `#${b.arena.rank} · ${b.arena.score}` : `${b.arena.score} · AutoEval` },
    b.artificialAnalysis?.intelligence != null && { key: 'artificialAnalysis', label: 'AA', value: `${b.artificialAnalysis.intelligence}/100` },
    b.llmStats?.overall != null && { key: 'llmStats', label: 'LLM Stats', value: b.llmStats.rank ? `#${b.llmStats.rank} · ${b.llmStats.overall}` : b.llmStats.overall },
  ].filter(Boolean);
  return <div className="r-evidence">
    {rows.map(row => {
      const href = sourceHref(sources, row.key);
      const body = <><b>{row.label}</b><span>{row.value}</span></>;
      return href ? <a href={href} key={row.key} target="_blank" rel="noreferrer">{body}<i>↗</i></a> : <span key={row.key}>{body}</span>;
    })}
    <small>{model.ranking?.sourceCount || 0}/3 overall sources · {model.ranking?.confidence || 'none'}</small>
  </div>;
}

function allSources(model, sourceMap) {
  const keyed = (model.sourceKeys || []).map(key => ({ key, ...sourceMap?.[key] })).filter(item => item.url);
  const researched = (model.researchSources || []).map((item, index) => ({ key: `research-${index}`, ...item }));
  const hf = model.huggingFace ? [{ key: 'hf', label: 'Hugging Face', kind: 'model', url: model.huggingFace }] : [];
  return [...keyed, ...researched, ...hf].filter((item, index, rows) => rows.findIndex(other => other.url === item.url) === index);
}

function BenchmarkMetric({ href, label, value, meta }) {
  return <div className="r-benchmark-metric">
    {href ? <a href={href} target="_blank" rel="noreferrer">{label} ↗</a> : <span>{label}</span>}
    <b>{value}</b>
    <small>{meta}</small>
  </div>;
}

const TASK_BENCHMARKS = [
  ['gpqa', 'GPQA Diamond', '%'],
  ['terminalBench', 'Terminal-Bench', '%'],
  ['sweBenchPro', 'SWE-bench Pro', '%'],
  ['hle', "Humanity's Last Exam", '%'],
  ['frontierMath', 'FrontierMath', '%'],
  ['agentsLastExam', "Agents' Last Exam", '%'],
  ['osWorldVerified', 'OSWorld Verified', '%'],
  ['automationBench', 'AutomationBench', '%'],
  ['frontierCode', 'FrontierCode', '%'],
  ['deepSWE', 'DeepSWE', '%'],
  ['cyberGym', 'CyberGym', '%'],
  ['exploitBench', 'ExploitBench', '%'],
];

function TaskBenchmarks({ model }) {
  const vendor = model.benchmarks?.vendor || {};
  const rows = TASK_BENCHMARKS.map(([key, label, suffix]) => vendor[key] != null ? { key, label, value: `${vendor[key]}${suffix}` } : null).filter(Boolean);
  if (!rows.length) return <div className="r-task-empty">No checked task-level measurements in this snapshot.</div>;
  return <div className="r-task-grid">{rows.map(row => <div key={row.key}><span>{row.label}</span><b>{row.value}</b><small>task-specific evidence; not interchangeable with overall ranks</small></div>)}</div>;
}

function DetailPanel({ model, sources }) {
  const b = model.benchmarks || {};
  const refs = allSources(model, sources);
  const arenaMeta = b.arena?.rank ? `Human rank #${b.arena.rank}${b.arena.votes ? ` · ${fmt(b.arena.votes)} votes` : ''}${b.arena.spread ? ` · spread ${b.arena.spread}` : ''}` : b.arena?.score != null ? `No human rank yet · ${b.arena.spread || 'score-only observation'}` : 'No Arena observation';
  const llmMeta = b.llmStats ? `${b.llmStats.rank ? `Overall rank #${b.llmStats.rank} · ` : ''}reasoning ${b.llmStats.reasoning ?? '—'} · coding ${b.llmStats.coding ?? '—'} · agent ${b.llmStats.agent ?? '—'}` : 'No LLM Stats observation';
  return <div className="r-detail">
    <div className="r-detail-head"><div><span>Best available published rank</span><strong>{model.primaryRank ? `#${model.primaryRank.rank} · ${model.primaryRank.label}` : 'Pending'}</strong><small>Source-native rank. We do not convert it into a site-specific 0–100 grade.</small></div><div><span>Evaluation state</span><strong>{model.evaluationState || model.ranking?.basis}</strong><small>{model.rank ? 'Arena rank determines the S/A/B/C/D band.' : 'No Arena grade until an exact human Arena rank exists.'}</small></div></div>
    <div className="r-benchmark-grid">
      <BenchmarkMetric href={sourceHref(sources, 'arena')} label="Arena Overall" value={b.arena?.score != null ? `${b.arena.score} score` : 'Not evaluated'} meta={arenaMeta} />
      <BenchmarkMetric href={sourceHref(sources, 'artificialAnalysis')} label="Artificial Analysis" value={b.artificialAnalysis?.intelligence != null ? `${b.artificialAnalysis.intelligence}/100` : 'Not evaluated'} meta={b.artificialAnalysis?.variant ? `Intelligence Index · ${b.artificialAnalysis.variant}` : 'Intelligence Index · 0–100'} />
      <BenchmarkMetric href={sourceHref(sources, 'llmStats')} label="LLM Stats" value={b.llmStats?.overall ?? 'Not evaluated'} meta={llmMeta} />
      <BenchmarkMetric href={sourceHref(sources, 'kilo')} label="Kilo coding" value={b.kilo?.completion != null ? `${b.kilo.completion}%` : 'Not evaluated'} meta={b.kilo?.costPerAttempt != null ? `${fmtPrice(b.kilo.costPerAttempt)} / attempt` : 'coding-specific'} />
      <BenchmarkMetric label="Research coverage" value={`${model.ranking?.sourceCount || 0}/3`} meta={`${model.ranking?.confidence || 'none'} coverage across Arena / AA / LLM Stats`} />
    </div>
    <div className="r-detail-label r-task-label">Task benchmark observations</div>
    <TaskBenchmarks model={model} />
    <div className="r-spec-grid"><div><span>Context</span><b>{fmtContext(model.context)}</b></div><div><span>Parameters</span><b>{model.paramsTotalB ? `${model.paramsTotalB}B` : 'Unknown'}</b><small>{model.paramsActiveB ? `${model.paramsActiveB}B active` : ''}</small></div><div><span>Precision</span><b>{model.quantization || 'Not published'}</b></div><div><span>License</span><b>{model.license || model.openness || 'Unknown'}</b></div><div><span>Released / announced</span><b>{fmtDate(model.releaseDate)}</b><small>{model.releaseDateLabel || ''}</small></div><div><span>Capabilities</span><b>{(model.capabilities || []).join(' · ') || 'Unknown'}</b></div></div>
    <div className="r-detail-bottom"><div><span className="r-detail-label">Provider price · input / output · USD / 1M tokens</span><PriceCell model={model} /></div><div><span className="r-detail-label">References</span><div className="r-sources">{refs.map(ref => <a href={ref.url} key={ref.key} target="_blank" rel="noreferrer"><small>{ref.kind || 'source'}</small>{ref.label} ↗</a>)}</div></div></div>
  </div>;
}

function ScaleGuide({ sources }) {
  const items = [
    { key: 'arena', title: 'Arena', value: 'rank + score', body: 'Human-preference rank is the preferred source when the exact configuration has enough votes. The score uses Arena’s own Elo-like display scale.' },
    { key: 'llmStats', title: 'LLM Stats', value: 'rank + own score', body: 'For very new models without an Arena human rank, a published LLM Stats overall rank can be used directly. Its score stays on the LLM Stats scale.' },
    { key: 'artificialAnalysis', title: 'Artificial Analysis', value: '0–100 index', body: 'Independent Intelligence Index. It is shown as supporting evidence and can become the rank source when an explicit source rank is available.' },
    { key: null, title: 'Provider price', value: 'USD / 1M', body: 'Venice and Morpheus input / output prices. Price is never mixed into capability ranking.' },
  ];
  return <section className="r-shell r-scales"><div className="r-section-head"><div><span className="r-kicker">RANKING CONTRACT</span><h2>Use a published rank before inventing one.</h2></div><p>Arena human rank first. If a brand-new model has no exact Arena rank, use another source-native overall rank when available and label the source directly.</p></div><div className="r-scale-grid">{items.map((item, index) => {
    const href = item.key ? sourceHref(sources, item.key) : null;
    return <article key={index}><span>{href ? <a href={href} target="_blank" rel="noreferrer">{item.title} ↗</a> : item.title}</span><strong>{item.value}</strong><p>{item.body}</p></article>;
  })}</div><div className="r-benchmark-note"><b>No fallback number at a glance.</b> GLM 5.3 and DeepSeek V4 Pro 0813 are ranked by their published LLM Stats positions while Arena human ranks are pending. Supporting AA, Arena AutoEval and task-level evidence remains visible in the row details.</div></section>;
}

function ArenaChart({ models }) {
  const rows = models.filter(model => model.rank && model.benchmarks?.arena?.score != null).sort((a,b) => a.rank - b.rank).slice(0, 12);
  if (!rows.length) return null;
  const min = Math.min(...rows.map(model => model.benchmarks.arena.score)) - 5;
  const max = Math.max(...rows.map(model => model.benchmarks.arena.score));
  return <div className="r-bars">{rows.map(model => { const width = 24 + ((model.benchmarks.arena.score - min) / Math.max(1, max - min)) * 76; return <div className="r-bar-row" key={model.id}><span>#{model.rank}</span><b>{model.name}</b><div><i className={`r-bar-${model.provider}`} style={{ width: `${width}%` }} /><strong>{model.benchmarks.arena.score}</strong></div></div>; })}</div>;
}

function RecentRankChart({ models }) {
  const rows = models.filter(model => model.primaryRank && model.primaryRank.source !== 'arena').sort((a,b) => a.primaryRank.rank - b.primaryRank.rank).slice(0, 10);
  if (!rows.length) return <div className="r-empty">No recent source-ranked models outside Arena.</div>;
  return <div className="r-bars">{rows.map(model => <div className="r-bar-row" key={model.id}><span>#{model.primaryRank.rank}</span><b>{model.name}</b><div><i className="r-bar-beta" style={{ width: `${Math.max(26, 100 - model.primaryRank.rank * 5)}%` }} /><strong>{model.primaryRank.label}</strong></div></div>)}</div>;
}

export default function Home() {
  const [data, setData] = useState({ models: [], status: {}, sources: {}, updated: '' });
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const [license, setLicense] = useState('all');
  const [sort, setSort] = useState('primary');
  const [expanded, setExpanded] = useState(null);
  const [compare, setCompare] = useState([]);

  useEffect(() => { fetch('/api/models').then(response => response.json()).then(setData).catch(() => setData(current => ({ ...current, error: true }))); }, []);

  const models = data.models || [];
  const arenaModels = useMemo(() => models.filter(model => model.rank).sort((a, b) => a.rank - b.rank), [models]);
  const recentSourceModels = useMemo(() => models.filter(model => model.primaryRank && model.primaryRank.source !== 'arena').sort((a,b) => a.primaryRank.rank - b.primaryRank.rank), [models]);
  const arenaLeader = arenaModels[0];
  const recentLeader = recentSourceModels[0];
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
      if (sort === 'arena') return (a.rank ?? 9999) - (b.rank ?? 9999);
      if (sort === 'llmStats') return (a.benchmarks?.llmStats?.rank ?? 9999) - (b.benchmarks?.llmStats?.rank ?? 9999) || (b.benchmarks?.llmStats?.overall ?? -1) - (a.benchmarks?.llmStats?.overall ?? -1);
      if (sort === 'intelligence') return (b.benchmarks?.artificialAnalysis?.intelligence ?? -1) - (a.benchmarks?.artificialAnalysis?.intelligence ?? -1);
      if (sort === 'coding') return (b.benchmarks?.kilo?.completion ?? b.benchmarks?.llmStats?.coding ?? -1) - (a.benchmarks?.kilo?.completion ?? a.benchmarks?.llmStats?.coding ?? -1);
      if (sort === 'price') return (bestInput(a) ?? Number.MAX_VALUE) - (bestInput(b) ?? Number.MAX_VALUE);
      if (sort === 'newest') return (b.releaseDate ? new Date(`${b.releaseDate}T00:00:00Z`).getTime() : 0) - (a.releaseDate ? new Date(`${a.releaseDate}T00:00:00Z`).getTime() : 0);
      if (a.primaryRank && b.primaryRank) return a.primaryRank.rank - b.primaryRank.rank || (a.primaryRank.source === 'arena' ? -1 : 1);
      if (a.primaryRank) return -1;
      if (b.primaryRank) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [models, query, provider, license, sort]);

  const compared = compare.map(id => models.find(model => model.id === id)).filter(Boolean);
  const toggleCompare = id => setCompare(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 4 ? [...current, id] : current);

  return <main className="r-app">
    <header className="r-topbar"><a className="r-brand" href="/"><i />LLM INDEX</a><nav><a href="#rankings">Rankings</a><a href="#analysis">Analysis</a><a href="#compare">Compare</a></nav><a className="r-method" href="/methodology">Methodology ↗</a></header>

    <section className="r-hero r-shell"><div><span className="r-kicker">TEXT MODELS · VENICE + MORPHEUS</span><h1>Rank the model.<br/><em>Name the source.</em></h1><p>The default view uses the best published overall rank available for the exact model configuration. Arena human rank is preferred. Very recent models can use a source-native LLM Stats or Artificial Analysis rank until Arena catches up. No synthetic 55/100 fallback masquerading as a model grade.</p></div><aside><div><span>Provider catalog</span><b>{models.length || '—'} text models</b></div><div><span>Research snapshot</span><b>{data.updated || 'Loading…'}</b></div><div><span>Rank hierarchy</span><b>Arena → LLM Stats → AA</b></div></aside></section>

    <ScaleGuide sources={data.sources} />

    <section className="r-shell r-leaders"><div className="r-section-head"><div><span className="r-kicker">LEADERS</span><h2>Source-native positions.</h2></div><p>A rank always carries its source. Grades remain Arena-only.</p></div><div className="r-stat-grid"><article className="r-stat r-stat-purple"><span>Arena leader</span><strong>{arenaLeader ? `#${arenaLeader.rank}` : '—'}</strong><h3>{arenaLeader?.name || 'Loading…'}</h3><p>{arenaLeader ? `${arenaLeader.benchmarks?.arena?.score} Arena score · ${fmt(arenaLeader.benchmarks?.arena?.votes)} votes` : ''}</p></article><article className="r-stat r-stat-cyan"><span>Newest non-Arena source rank</span><strong>{recentLeader ? `#${recentLeader.primaryRank.rank}` : '—'}</strong><h3>{recentLeader?.name || '—'}</h3><p>{recentLeader ? `${recentLeader.primaryRank.label} · native score ${recentLeader.primaryRank.score}` : ''}</p></article><article className="r-stat r-stat-green"><span>Open-weight Arena leader</span><strong>{openLeader ? `#${openLeader.rank}` : '—'}</strong><h3>{openLeader?.name || '—'}</h3><p>{openLeader?.license || openLeader?.openness || ''}</p></article><article className="r-stat"><span>Provider overlap</span><strong>{overlap || '—'}</strong><h3>Venice + Morpheus</h3><p>Explicit shared catalog entries.</p></article></div></section>

    <section id="analysis" className="r-shell r-analysis"><div className="r-section-head"><div><span className="r-kicker">VISUAL ANALYSIS</span><h2>Keep ranking regimes legible.</h2></div><p>Arena scores and LLM Stats ranks are shown in separate panels because they are different measurements.</p></div><div className="r-viz-grid"><article className="r-viz"><header><div><span>ARENA OVERALL</span><h3>Top human-ranked models</h3></div><small>source score</small></header><ArenaChart models={arenaModels} /></article><article className="r-viz"><header><div><span>RECENT SOURCE RANKS</span><h3>Models waiting on Arena human rank</h3></div><small>published position</small></header><RecentRankChart models={recentSourceModels} /></article></div></section>

    <section id="rankings" className="r-shell r-rankings"><div className="r-section-head"><div><span className="r-kicker">LEADERBOARD</span><h2>Text model rankings</h2></div><p>{filtered.length} visible · click a row for benchmarks, architecture, pricing and direct references.</p></div><div className="r-rule"><b>Best available source rank:</b> Arena human Overall first. When the exact new model has no Arena human rank, a published LLM Stats or AA overall rank is used directly and labeled. The source-native score stays on its own scale.</div>
      <div className="r-controls"><label className="r-search"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search model, lab, provider ID…" /></label><div className="r-provider-filter">{['all','venice','morpheus','both'].map(item => <button key={item} onClick={() => setProvider(item)} className={provider === item ? `active ${item}` : item}>{item === 'all' ? 'All' : item[0].toUpperCase() + item.slice(1)}</button>)}</div><select value={license} onChange={event => setLicense(event.target.value)}><option value="all">All licenses</option><option value="open">Open weights</option><option value="closed">Proprietary</option></select><select value={sort} onChange={event => setSort(event.target.value)}><option value="primary">Best source rank</option><option value="arena">Arena rank</option><option value="llmStats">LLM Stats rank</option><option value="intelligence">AA Intelligence</option><option value="coding">Coding</option><option value="price">Lowest input price</option><option value="newest">Newest</option></select></div>

      <div className="r-table-wrap"><table className="r-table"><colgroup><col className="r-col-rank"/><col className="r-col-grade"/><col className="r-col-model"/><col className="r-col-signal"/><col className="r-col-provider"/><col className="r-col-price"/><col className="r-col-release"/><col className="r-col-context"/><col className="r-col-evidence"/><col className="r-col-compare"/></colgroup><thead><tr><th>Source rank</th><th>Arena grade</th><th>Model</th><th>Native result</th><th>Providers</th><th>Price <small>$/1M · in/out</small></th><th>Released</th><th>Context</th><th>Evidence</th><th>+</th></tr></thead><tbody>{filtered.map(model => <Fragment key={model.id}><tr className={expanded === model.id ? 'r-model-row open' : 'r-model-row'} onClick={() => setExpanded(expanded === model.id ? null : model.id)}><td><RankMark model={model} /></td><td><Grade model={model} /></td><td><div className="r-model"><strong>{model.name}</strong><span>{model.organization}</span><small>{model.openness || model.license || 'Unknown license'}</small></div></td><td><NativeSignal model={model} /></td><td><ProviderPills model={model} /></td><td><PriceCell model={model} /></td><td><div className="r-release"><strong>{fmtDate(model.releaseDate)}</strong><Freshness model={model} /></div></td><td><strong className="r-context">{fmtContext(model.context)}</strong></td><td><Evidence model={model} sources={data.sources} /></td><td><button className={compare.includes(model.id) ? 'r-compare active' : 'r-compare'} onClick={event => { event.stopPropagation(); toggleCompare(model.id); }}>{compare.includes(model.id) ? '✓' : '+'}</button></td></tr>{expanded === model.id && <tr className="r-detail-row"><td colSpan="10"><DetailPanel model={model} sources={data.sources} /></td></tr>}</Fragment>)}</tbody></table></div>
    </section>

    <section id="compare" className="r-shell r-compare-section"><div className="r-section-head"><div><span className="r-kicker">COMPARE</span><h2>{compared.length ? `${compared.length} models selected` : 'Select up to four models'}</h2></div><p>Compare source-native ranks, benchmark values, context and provider economics without collapsing them into one unexplained number.</p></div>{compared.length ? <div className="r-compare-grid">{compared.map(model => <article key={model.id}><header><RankMark model={model}/><Grade model={model}/></header><h3>{model.name}</h3><ProviderPills model={model}/><dl><div><dt>Best rank</dt><dd>{model.primaryRank ? `#${model.primaryRank.rank} · ${model.primaryRank.label}` : 'Pending'}</dd></div><div><dt><a href={sourceHref(data.sources,'arena')} target="_blank" rel="noreferrer">Arena ↗</a></dt><dd>{model.benchmarks?.arena?.rank ? `#${model.benchmarks.arena.rank} · ${model.benchmarks.arena.score}` : model.benchmarks?.arena?.score ? `${model.benchmarks.arena.score} · AutoEval` : '—'}</dd></div><div><dt><a href={sourceHref(data.sources,'llmStats')} target="_blank" rel="noreferrer">LLM Stats ↗</a></dt><dd>{model.benchmarks?.llmStats?.rank ? `#${model.benchmarks.llmStats.rank} · ${model.benchmarks.llmStats.overall}` : model.benchmarks?.llmStats?.overall ?? '—'}</dd></div><div><dt><a href={sourceHref(data.sources,'artificialAnalysis')} target="_blank" rel="noreferrer">AA ↗</a></dt><dd>{model.benchmarks?.artificialAnalysis?.intelligence != null ? `${model.benchmarks.artificialAnalysis.intelligence}/100` : '—'}</dd></div><div><dt>Kilo coding</dt><dd>{model.benchmarks?.kilo?.completion != null ? `${model.benchmarks.kilo.completion}%` : '—'}</dd></div><div><dt>Context</dt><dd>{fmtContext(model.context)}</dd></div><div><dt>Released</dt><dd>{fmtDate(model.releaseDate)}</dd></div></dl><PriceCell model={model}/></article>)}</div> : <div className="r-compare-empty">Use the <b>+</b> control in the leaderboard. Selection never changes ranking.</div>}</section>

    <footer className="r-footer r-shell"><div><b>LLM INDEX</b><span>Source-first text-model research across Venice + Morpheus.</span></div><div><a href="/methodology">Methodology</a><a href="https://github.com/bitwikiorg/llm-rankings" target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>
  </main>;
}
