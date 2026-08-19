'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

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
  if (!tier) return <span className="r-no-grade" title="Grades are Arena rank bands only">—</span>;
  return <span className={`r-grade r-grade-${tier}`} title="Arena Overall rank band">{tier}</span>;
}

function RankMark({ model }) {
  if (model.rank) return <div className="r-rank"><strong>#{model.rank}</strong><span>Arena rank</span></div>;
  if (model.fallbackRank) return <div className="r-rank r-rank-beta"><strong>β{model.fallbackRank}</strong><span>Fallback rank</span></div>;
  return <div className="r-rank r-rank-pending"><strong>—</strong><span>Pending</span></div>;
}

function EvaluationSignal({ model }) {
  const arena = model.benchmarks?.arena;
  if (model.rank) return <div className="r-primary r-primary-arena">
    <strong>{arena?.score ?? '—'}</strong>
    <span>Arena score · Elo-like scale</span>
    <small>{arena?.votes ? `${fmt(arena.votes)} votes` : 'human preference'}</small>
  </div>;
  if (model.ranking?.aggregate != null) return <div className="r-primary r-primary-beta">
    <strong>{fmt1(model.ranking.aggregate)}<i>/100</i></strong>
    <span>β fallback index · derived</span>
    <small>{model.ranking.sourceCount}/3 sources · {model.ranking.confidence}</small>
  </div>;
  return <div className="r-primary r-primary-pending"><strong>Pending</strong><span>No independent overall score</span></div>;
}

function PriceCell({ model }) {
  const rows = offers(model);
  if (!rows.length) return <span className="r-muted">Not listed</span>;
  return <div className="r-price-list">{rows.map(row => <div className="r-price" key={row.key}><span className={`r-price-provider r-price-${row.key}`}>{row.label}</span><b>{fmtPrice(row.input)}</b><i>/</i><b>{fmtPrice(row.output)}</b></div>)}</div>;
}

function Freshness({ model }) {
  const age = daysOld(model.releaseDate);
  if (age == null) return <span className="r-muted">Release unknown</span>;
  const width = Math.max(3, Math.min(100, 100 - age / 180 * 100));
  return <div className="r-fresh" title={`${age} days since release`}><div><i style={{ width: `${width}%` }} /></div><span>{age}d</span></div>;
}

function Evidence({ model, sources }) {
  const b = model.benchmarks || {};
  const rows = [
    b.arena?.score != null && { key: 'arena', label: 'Arena', value: b.arena.score },
    b.artificialAnalysis?.intelligence != null && { key: 'artificialAnalysis', label: 'AA', value: `${b.artificialAnalysis.intelligence}/100` },
    b.llmStats?.overall != null && { key: 'llmStats', label: 'LLM Stats', value: b.llmStats.overall },
  ].filter(Boolean);
  return <div className="r-evidence">
    {rows.map(row => {
      const href = sourceHref(sources, row.key);
      const body = <><b>{row.label}</b><span>{row.value}</span></>;
      return href ? <a href={href} key={row.key} target="_blank" rel="noreferrer">{body}<i>↗</i></a> : <span key={row.key}>{body}</span>;
    })}
    <small>{model.ranking?.sourceCount || 0}/3 overall · {model.ranking?.confidence || 'none'}</small>
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
  ['mmmuPro', 'MMMU-Pro', '%'],
  ['automationBench', 'AutomationBench', '%'],
  ['frontierCode', 'FrontierCode', '%'],
  ['deepSWE', 'DeepSWE', '%'],
];

function TaskBenchmarks({ model }) {
  const vendor = model.benchmarks?.vendor || {};
  const rows = TASK_BENCHMARKS.map(([key, label, suffix]) => vendor[key] != null ? { key, label, value: `${vendor[key]}${suffix}` } : null).filter(Boolean);
  if (!rows.length) return <div className="r-task-empty">No checked per-benchmark task measurements in this snapshot.</div>;
  return <div className="r-task-grid">{rows.map(row => <div key={row.key}><span>{row.label}</span><b>{row.value}</b><small>reported / contextual; not part of Arena rank</small></div>)}</div>;
}

function AggregateBreakdown({ model, sources }) {
  const rows = model.ranking?.aggregateComponents || [];
  if (!rows.length) return null;
  return <div className="r-aggregate-box">
    <div className="r-detail-label">β fallback construction · raw scales converted to within-source percentiles before combining</div>
    <div className="r-aggregate-components">{rows.map(row => {
      const href = sourceHref(sources, row.key);
      return <div key={row.key}>
        <span>{href ? <a href={href} target="_blank" rel="noreferrer">{row.label} ↗</a> : row.label}</span>
        <b>raw {row.raw} → percentile {fmt1(row.percentile)}</b>
        <small>{row.effectiveWeight}% effective weight after missing-source renormalization</small>
      </div>;
    })}</div>
  </div>;
}

function DetailPanel({ model, sources }) {
  const b = model.benchmarks || {};
  const refs = allSources(model, sources);
  const arenaMeta = b.arena?.rank ? `Rank #${b.arena.rank}${b.arena.votes ? ` · ${fmt(b.arena.votes)} votes` : ''}${b.arena.spread ? ` · spread ${b.arena.spread}` : ''}` : b.arena?.score != null ? `AutoEval / score only${b.arena.spread ? ` · ${b.arena.spread}` : ''}` : 'No Arena observation';
  return <div className="r-detail">
    <div className="r-detail-head"><div><span>Evaluation state</span><strong>{model.evaluationState || model.ranking?.basis}</strong></div><div><span>Ranking basis</span><strong>{model.ranking?.basis}</strong><small>{model.rank ? 'S/A/B/C/D is derived only from Arena rank.' : model.fallbackRank ? 'β is a separate fallback ranking regime. It is not comparable to an Arena score.' : 'No grade or fallback rank without independent evidence.'}</small></div></div>
    <div className="r-benchmark-grid">
      <BenchmarkMetric href={sourceHref(sources, 'arena')} label="Arena Overall" value={b.arena?.score != null ? `${b.arena.score} score` : 'Not evaluated'} meta={arenaMeta} />
      <BenchmarkMetric href={sourceHref(sources, 'artificialAnalysis')} label="Artificial Analysis" value={b.artificialAnalysis?.intelligence != null ? `${b.artificialAnalysis.intelligence}/100` : 'Not evaluated'} meta={b.artificialAnalysis?.variant ? `Intelligence Index · ${b.artificialAnalysis.variant}` : 'Intelligence Index · 0–100'} />
      <BenchmarkMetric href={sourceHref(sources, 'llmStats')} label="LLM Stats" value={b.llmStats?.overall ?? 'Not evaluated'} meta={b.llmStats ? `Score · reasoning ${b.llmStats.reasoning ?? '—'} · coding ${b.llmStats.coding ?? '—'} · agent ${b.llmStats.agent ?? '—'}` : 'TrueSkill-derived score · own scale'} />
      <BenchmarkMetric href={sourceHref(sources, 'kilo')} label="Kilo coding" value={b.kilo?.completion != null ? `${b.kilo.completion}%` : 'Not evaluated'} meta={b.kilo?.costPerAttempt != null ? `${fmtPrice(b.kilo.costPerAttempt)} / attempt` : 'coding-specific; excluded from overall fallback'} />
      <BenchmarkMetric label="β fallback index" value={model.ranking?.aggregate != null ? `${fmt1(model.ranking.aggregate)}/100` : 'Insufficient evidence'} meta={`${model.ranking?.sourceCount || 0}/3 sources · ${model.ranking?.confidence || 'none'} · derived percentile index`} />
    </div>
    <AggregateBreakdown model={model} sources={sources} />
    <div className="r-detail-label r-task-label">Task benchmark observations</div>
    <TaskBenchmarks model={model} />
    <div className="r-spec-grid"><div><span>Context</span><b>{fmtContext(model.context)}</b></div><div><span>Parameters</span><b>{model.paramsTotalB ? `${model.paramsTotalB}B` : 'Unknown'}</b><small>{model.paramsActiveB ? `${model.paramsActiveB}B active` : ''}</small></div><div><span>Precision</span><b>{model.quantization || 'Not published'}</b></div><div><span>License</span><b>{model.license || model.openness || 'Unknown'}</b></div><div><span>Released</span><b>{fmtDate(model.releaseDate)}</b></div><div><span>Capabilities</span><b>{(model.capabilities || []).join(' · ') || 'Unknown'}</b></div></div>
    <div className="r-detail-bottom"><div><span className="r-detail-label">Provider price · input / output · USD / 1M tokens</span><PriceCell model={model} /></div><div><span className="r-detail-label">References</span><div className="r-sources">{refs.map(ref => <a href={ref.url} key={ref.key} target="_blank" rel="noreferrer"><small>{ref.kind || 'source'}</small>{ref.label} ↗</a>)}</div></div></div>
  </div>;
}

function ScaleGuide({ sources }) {
  const items = [
    { key: 'arena', title: 'Arena score', value: '≈ 1000–1500+', body: 'Bradley–Terry human-preference rating displayed on an Elo-like scale. Higher is better. Not a percentage.' },
    { key: 'artificialAnalysis', title: 'AA Intelligence Index', value: '0–100', body: 'Artificial Analysis composite across current capability evaluations. Higher is better.' },
    { key: 'llmStats', title: 'LLM Stats Score', value: 'own scale', body: 'TrueSkill-derived conservative rating (μ − 3σ). Do not compare its number directly with Arena or AA.' },
    { key: null, title: 'β fallback index', value: '0–100', body: 'Our derived percentile aggregate used only when no exact human Arena rank exists. It is not Arena Elo and not an AA score.' },
    { key: null, title: 'Provider price', value: 'USD / 1M', body: 'Input / output token price from Venice or Morpheus. Lower is cheaper; it is not a quality score.' },
  ];
  return <section className="r-shell r-scales"><div className="r-section-head"><div><span className="r-kicker">SCALE GUIDE</span><h2>These numbers are not interchangeable.</h2></div><p>Every source keeps its native scale. The β fallback converts source values to percentiles before aggregation; raw scores are never averaged directly.</p></div><div className="r-scale-grid">{items.map((item, index) => {
    const href = item.key ? sourceHref(sources, item.key) : null;
    return <article key={index}><span>{href ? <a href={href} target="_blank" rel="noreferrer">{item.title} ↗</a> : item.title}</span><strong>{item.value}</strong><p>{item.body}</p></article>;
  })}</div><div className="r-benchmark-note"><b>Benchmark coverage:</b> MMLU, HumanEval, MT-Bench and BBH are not currently in the checked snapshot and are not synthesized from family-level or stale proxy results. Current source suites emphasize newer evaluations such as GPQA, HLE, SWE-bench, Terminal-Bench and SciCode; exact task measurements appear when a model/configuration has sourced evidence.</div></section>;
}

function ArenaChart({ models }) {
  const rows = models.filter(model => model.rank && model.benchmarks?.arena?.score != null).slice(0, 12);
  if (!rows.length) return null;
  const min = Math.min(...rows.map(model => model.benchmarks.arena.score)) - 5;
  const max = Math.max(...rows.map(model => model.benchmarks.arena.score));
  return <div className="r-bars">{rows.map(model => { const width = 24 + ((model.benchmarks.arena.score - min) / Math.max(1, max - min)) * 76; return <div className="r-bar-row" key={model.id}><span>#{model.rank}</span><b>{model.name}</b><div><i className={`r-bar-${model.provider}`} style={{ width: `${width}%` }} /><strong>{model.benchmarks.arena.score}</strong></div></div>; })}</div>;
}

function AggregateChart({ models }) {
  const rows = models.filter(model => !model.rank && model.ranking?.aggregate != null).slice(0, 10);
  if (!rows.length) return <div className="r-empty">No fallback aggregates.</div>;
  return <div className="r-bars">{rows.map(model => <div className="r-bar-row" key={model.id}><span>β{model.fallbackRank}</span><b>{model.name}</b><div><i className="r-bar-beta" style={{ width: `${Math.max(4, model.ranking.aggregate)}%` }} /><strong>{fmt1(model.ranking.aggregate)}/100</strong></div></div>)}</div>;
}

function CompareMetric({ label, value, href }) {
  return <div><dt>{href ? <a href={href} target="_blank" rel="noreferrer">{label} ↗</a> : label}</dt><dd>{value}</dd></div>;
}

export default function Home() {
  const [data, setData] = useState({ models: [], status: {}, sources: {}, benchmarkSnapshot: {}, updated: '' });
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const [license, setLicense] = useState('all');
  const [sort, setSort] = useState('primary');
  const [expanded, setExpanded] = useState(null);
  const [compare, setCompare] = useState([]);

  useEffect(() => { fetch('/api/models').then(response => response.json()).then(setData).catch(() => setData(current => ({ ...current, error: true }))); }, []);

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
    <section className="r-hero r-shell"><div><span className="r-kicker">TEXT MODELS · VENICE + MORPHEUS</span><h1>Rank the evidence.<br/><em>Keep the scales separate.</em></h1><p>Arena Overall leads when an exact human rank exists. Arena score, Artificial Analysis, LLM Stats, β fallback and provider price are different measurements with different scales; the interface now labels each one explicitly and links directly to its source.</p></div><aside><div><span>Provider catalog</span><b>{models.length || '—'} text models</b></div><div><span>Research snapshot</span><b>{data.updated || 'Loading…'}</b></div><div><span>Primary rule</span><b>Arena human rank → β fallback</b></div></aside></section>

    <ScaleGuide sources={data.sources} />

    <section className="r-shell r-leaders"><div className="r-section-head"><div><span className="r-kicker">LEADERS</span><h2>Signal first.</h2></div><p>S/A/B/C/D grades are Arena rank bands only. Fallback models have β ranks but no Arena grade.</p></div><div className="r-stat-grid"><article className="r-stat r-stat-purple"><span>Arena leader · score</span><strong>{arenaLeader?.benchmarks?.arena?.score ?? '—'}</strong><h3>{arenaLeader?.name || 'Loading…'}</h3><p>{arenaLeader ? `Arena #${arenaLeader.rank} · ${fmt(arenaLeader.benchmarks?.arena?.votes)} votes · Elo-like score scale` : ''}</p></article><article className="r-stat r-stat-cyan"><span>Fallback leader · β index</span><strong>{fallbackLeader?.ranking?.aggregate != null ? `${fmt1(fallbackLeader.ranking.aggregate)}/100` : '—'}</strong><h3>{fallbackLeader?.name || 'No fallback models'}</h3><p>{fallbackLeader ? `β${fallbackLeader.fallbackRank} · ${fallbackLeader.ranking.confidence} confidence · ${fallbackLeader.ranking.sourceCount}/3 sources · not Arena score` : ''}</p></article><article className="r-stat r-stat-green"><span>Open-weight Arena leader</span><strong>{openLeader ? `#${openLeader.rank}` : '—'}</strong><h3>{openLeader?.name || '—'}</h3><p>{openLeader?.license || openLeader?.openness || ''}</p></article><article className="r-stat"><span>Provider overlap</span><strong>{overlap || '—'}</strong><h3>Venice + Morpheus</h3><p>Explicit shared catalog entries.</p></article></div></section>

    <section id="analysis" className="r-shell r-analysis"><div className="r-section-head"><div><span className="r-kicker">VISUAL ANALYSIS</span><h2>Two ranking regimes.</h2></div><p>Arena score and β fallback index are deliberately charted separately because their numeric scales are incomparable.</p></div><div className="r-viz-grid"><article className="r-viz"><header><div><span>ARENA OVERALL</span><h3>Top human-ranked models</h3></div><small>Bradley–Terry · Elo-like score</small></header><ArenaChart models={arenaModels} /></article><article className="r-viz"><header><div><span>β FALLBACK</span><h3>Models without exact human Arena rank</h3></div><small>derived 0–100 percentile index</small></header><AggregateChart models={fallbackModels} /></article></div></section>

    <section id="rankings" className="r-shell r-rankings"><div className="r-section-head"><div><span className="r-kicker">LEADERBOARD</span><h2>Text model rankings</h2></div><p>{filtered.length} visible · click a row for raw metrics, derivation, task benchmarks and source links.</p></div><div className="r-rule"><b>Primary order:</b> exact Arena Overall human rank first. If none exists, a <b>β fallback rank</b> orders only the fallback subset using a derived 0–100 percentile index. <b>β1 is not “overall #1” and 55/100 is not comparable to an Arena score near 1500.</b></div>
      <div className="r-controls"><label className="r-search"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search model, lab, provider ID…" /></label><div className="r-provider-filter">{['all','venice','morpheus','both'].map(item => <button key={item} onClick={() => setProvider(item)} className={provider === item ? `active ${item}` : item}>{item === 'all' ? 'All' : item[0].toUpperCase() + item.slice(1)}</button>)}</div><select value={license} onChange={event => setLicense(event.target.value)}><option value="all">All licenses</option><option value="open">Open weights</option><option value="closed">Proprietary</option></select><select value={sort} onChange={event => setSort(event.target.value)}><option value="primary">Primary order</option><option value="aggregate">β fallback index</option><option value="intelligence">AA Intelligence</option><option value="coding">Coding</option><option value="price">Lowest input price</option><option value="newest">Newest</option></select></div>

      <div className="r-table-wrap"><table className="r-table"><colgroup><col className="r-col-rank"/><col className="r-col-grade"/><col className="r-col-model"/><col className="r-col-signal"/><col className="r-col-provider"/><col className="r-col-price"/><col className="r-col-release"/><col className="r-col-context"/><col className="r-col-evidence"/><col className="r-col-compare"/></colgroup><thead><tr><th>Rank</th><th>Arena tier</th><th>Model</th><th>Evaluation <small>native / derived scale</small></th><th>Providers</th><th>Price <small>USD / 1M · in/out</small></th><th>Released</th><th>Context</th><th>Evidence <small>click source</small></th><th>+</th></tr></thead><tbody>{filtered.map(model => <Fragment key={model.id}><tr className={expanded === model.id ? 'r-model-row open' : 'r-model-row'} onClick={() => setExpanded(expanded === model.id ? null : model.id)}><td><RankMark model={model} /></td><td><Grade model={model} /></td><td><div className="r-model"><strong>{model.name}</strong><span>{model.organization}</span><small>{model.openness || model.license || 'Unknown license'}</small></div></td><td><EvaluationSignal model={model} /></td><td><ProviderPills model={model} /></td><td><PriceCell model={model} /></td><td><div className="r-release"><strong>{fmtDate(model.releaseDate)}</strong><Freshness model={model} /></div></td><td><strong className="r-context">{fmtContext(model.context)}</strong></td><td><Evidence model={model} sources={data.sources} /></td><td><button className={compare.includes(model.id) ? 'r-compare active' : 'r-compare'} onClick={event => { event.stopPropagation(); toggleCompare(model.id); }}>{compare.includes(model.id) ? '✓' : '+'}</button></td></tr>{expanded === model.id && <tr className="r-detail-row"><td colSpan="10"><DetailPanel model={model} sources={data.sources} /></td></tr>}</Fragment>)}</tbody></table></div>
    </section>

    <section id="compare" className="r-shell r-compare-section"><div className="r-section-head"><div><span className="r-kicker">COMPARE</span><h2>{compared.length ? `${compared.length} models selected` : 'Select up to four models'}</h2></div><p>Every metric keeps its unit and source. No cross-scale arithmetic is implied by proximity in the card.</p></div>{compared.length ? <div className="r-compare-grid">{compared.map(model => <article key={model.id}><header><RankMark model={model}/><Grade model={model}/></header><h3>{model.name}</h3><ProviderPills model={model}/><dl><CompareMetric label="Primary rank" value={model.rank ? `Arena #${model.rank}` : model.fallbackRank ? `β${model.fallbackRank} fallback-only` : 'Pending'} /><CompareMetric label="Arena score" value={model.benchmarks?.arena?.score != null ? `${model.benchmarks.arena.score} · ${fmt(model.benchmarks.arena.votes)} votes` : '—'} href={sourceHref(data.sources, 'arena')} /><CompareMetric label="AA Intelligence" value={model.benchmarks?.artificialAnalysis?.intelligence != null ? `${model.benchmarks.artificialAnalysis.intelligence}/100` : '—'} href={sourceHref(data.sources, 'artificialAnalysis')} /><CompareMetric label="LLM Stats Score" value={model.benchmarks?.llmStats?.overall ?? '—'} href={sourceHref(data.sources, 'llmStats')} /><CompareMetric label="Kilo coding" value={model.benchmarks?.kilo?.completion != null ? `${model.benchmarks.kilo.completion}%` : '—'} href={sourceHref(data.sources, 'kilo')} /><CompareMetric label="β fallback index" value={model.ranking?.aggregate != null ? `${fmt1(model.ranking.aggregate)}/100` : '—'} /><CompareMetric label="Context" value={fmtContext(model.context)} /><CompareMetric label="Released" value={fmtDate(model.releaseDate)} /></dl><PriceCell model={model}/></article>)}</div> : <div className="r-compare-empty">Use the <b>+</b> control in the leaderboard. Selection never changes ranking.</div>}</section>
    <footer className="r-footer r-shell"><div><b>LLM INDEX</b><span>Source-first text-model research across Venice + Morpheus.</span></div><div><a href="/methodology">Methodology</a><a href="https://github.com/bitwikiorg/llm-rankings" target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>
  </main>;
}
