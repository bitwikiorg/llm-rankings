'use client';

import { useEffect, useMemo, useState } from 'react';

const TIER_META = {
  S: { label: 'Frontier', description: 'Best available evidence across independent signals.' },
  A: { label: 'Elite', description: 'Frontier-adjacent capability with strong benchmark evidence.' },
  B: { label: 'Strong', description: 'Capable production models with meaningful strengths.' },
  C: { label: 'Specialist', description: 'Useful specialists, efficiency picks, or narrower models.' },
  D: { label: 'Utility', description: 'Lower aggregate capability or limited benchmark evidence.' },
  U: { label: 'Unranked', description: 'Provider-listed model without enough independent benchmark data.' },
};

const fmtContext = n => n == null ? '—' : n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `${Math.round(n / 1000)}K`;
const fmtParams = n => n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(n % 1000 ? 1 : 0)}T` : `${n}B`;
const fmtPrice = p => p == null ? '—' : `$${Number(p).toFixed(p < 1 ? 2 : 2)}`;

function ProviderBadge({ name, active, live }) {
  if (!active) return null;
  return <span className={`badge provider ${name}`}>{name === 'morpheus' ? 'MOR' : 'VEN'}{live ? ' · live' : ''}</span>;
}

export default function Home() {
  const [data, setData] = useState({ models: [], status: {}, updated: '' });
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const [tier, setTier] = useState('all');
  const [openness, setOpenness] = useState('all');
  const [capability, setCapability] = useState('all');
  const [sort, setSort] = useState('rank');
  const [compare, setCompare] = useState([]);

  useEffect(() => { fetch('/api/models').then(r => r.json()).then(setData); }, []);

  const models = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...data.models].filter(m => {
      if (q && !`${m.name} ${m.organization} ${(m.aliases || []).join(' ')}`.toLowerCase().includes(q)) return false;
      if (provider !== 'all' && !m.providers?.[provider]) return false;
      if (tier !== 'all' && m.ranking?.tier !== tier) return false;
      if (openness === 'open' && !String(m.openness).toLowerCase().includes('open')) return false;
      if (openness === 'closed' && String(m.openness).toLowerCase().includes('open')) return false;
      if (capability !== 'all' && !(m.capabilities || []).includes(capability)) return false;
      return true;
    }).sort((a, b) => {
      if (sort === 'context') return (b.context || 0) - (a.context || 0);
      if (sort === 'price') return ((a.prices?.morpheus?.input ?? a.prices?.venice?.input ?? a.prices?.reference?.input ?? 9999) - (b.prices?.morpheus?.input ?? b.prices?.venice?.input ?? b.prices?.reference?.input ?? 9999));
      if (sort === 'release') return String(b.releaseDate || '').localeCompare(String(a.releaseDate || ''));
      return (b.ranking?.score ?? -1) - (a.ranking?.score ?? -1);
    });
  }, [data.models, query, provider, tier, openness, capability, sort]);

  const tiers = useMemo(() => Object.keys(TIER_META).map(t => ({ tier: t, models: data.models.filter(m => m.ranking?.tier === t).slice(0, 6) })), [data.models]);
  const compareModels = compare.map(id => data.models.find(m => m.id === id)).filter(Boolean);
  const liveCount = Number(Boolean(data.status?.venice?.live)) + Number(Boolean(data.status?.morpheus?.live));

  const toggleCompare = id => setCompare(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#">LLM//RANK</a>
        <nav><a href="#ranking">Ranking</a><a href="#compare">Compare</a><a href="/methodology">Methodology</a><a href="https://github.com/bitwikiorg/llm-rankings" target="_blank">GitHub</a></nav>
      </header>

      <section className="hero shell">
        <div className="eyebrow"><span className="pulse" /> text models only · research snapshot {data.updated || 'loading'}</div>
        <h1>LLM Power Rankings</h1>
        <p>Tiered model intelligence with provider availability, price, context, release metadata, open-weight details, quantization, and independent benchmark evidence.</p>
        <div className="heroStats">
          <div><b>{data.models.length || '—'}</b><span>models tracked</span></div>
          <div><b>{liveCount}/2</b><span>provider APIs live</span></div>
          <div><b>4</b><span>benchmark families</span></div>
          <div><b>1–4</b><span>models per compare</span></div>
        </div>
      </section>

      <section className="shell providerStatus">
        <div><ProviderBadge name="venice" active live={data.status?.venice?.live} /><span>{data.status?.venice?.live ? 'Current Venice text catalog overlaid' : 'Venice snapshot mode'}</span></div>
        <div><ProviderBadge name="morpheus" active live={data.status?.morpheus?.live} /><span>{data.status?.morpheus?.live ? 'Current Morpheus catalog overlaid' : 'Morpheus snapshot mode'}</span></div>
      </section>

      <section className="shell tierBoard" aria-label="Tier overview">
        {tiers.filter(x => x.models.length).map(({ tier: t, models: rows }) => (
          <div className="tierRow" key={t}>
            <div className={`tierLetter tier-${t}`}><strong>{t}</strong><span>{TIER_META[t].label}</span></div>
            <div className="tierCards">
              {rows.map(m => <button key={m.id} className="tierCard" onClick={() => toggleCompare(m.id)}>
                <span className="modelName">{m.name}</span><span>{m.organization}</span><b>{m.ranking.score == null ? '—' : m.ranking.score.toFixed(1)}</b>
              </button>)}
            </div>
          </div>
        ))}
      </section>

      <section id="ranking" className="shell rankingSection">
        <div className="sectionHead"><div><span className="kicker">RESEARCH TABLE</span><h2>Provider model leaderboard</h2></div><p>Ranking is evidence-weighted, not a claim that one scalar captures every task.</p></div>
        <div className="controls">
          <input aria-label="Search models" placeholder="Search model or lab…" value={query} onChange={e => setQuery(e.target.value)} />
          <select value={provider} onChange={e => setProvider(e.target.value)}><option value="all">All providers</option><option value="venice">Venice</option><option value="morpheus">Morpheus</option></select>
          <select value={tier} onChange={e => setTier(e.target.value)}><option value="all">All tiers</option>{Object.keys(TIER_META).map(t => <option key={t} value={t}>Tier {t}</option>)}</select>
          <select value={openness} onChange={e => setOpenness(e.target.value)}><option value="all">Any license</option><option value="open">Open weights</option><option value="closed">Proprietary</option></select>
          <select value={capability} onChange={e => setCapability(e.target.value)}><option value="all">Any capability</option><option value="reasoning">Reasoning</option><option value="coding">Coding</option><option value="tools">Tools</option><option value="vision">Vision</option></select>
          <select value={sort} onChange={e => setSort(e.target.value)}><option value="rank">Sort: score</option><option value="price">Sort: input price</option><option value="context">Sort: context</option><option value="release">Sort: newest</option></select>
        </div>

        <div className="tableWrap">
          <table>
            <thead><tr><th>#</th><th>Model</th><th>Tier</th><th>Score</th><th>Providers</th><th>Released</th><th>Context</th><th>Params</th><th>Precision / quantization</th><th>Input / Output $M</th><th>Evidence</th><th>Compare</th></tr></thead>
            <tbody>{models.map(m => {
              const price = m.prices?.morpheus || m.prices?.venice || m.prices?.reference;
              return <tr key={m.id}>
                <td className="rank">{m.rank || '—'}</td>
                <td><div className="modelCell"><strong>{m.name}</strong><span>{m.organization || 'Unknown'} · {m.openness}</span><div className="capList">{(m.capabilities || []).slice(0, 4).map(c => <small key={c}>{c}</small>)}</div></div></td>
                <td><span className={`tierPill tier-${m.ranking?.tier}`}>{m.ranking?.tier || 'U'}</span></td>
                <td><strong>{m.ranking?.score == null ? '—' : m.ranking.score.toFixed(1)}</strong><span className="sub">{m.ranking?.confidence || 0}% confidence</span></td>
                <td><div className="providerStack"><ProviderBadge name="venice" active={m.providers?.venice} live={data.status?.venice?.live} /><ProviderBadge name="morpheus" active={m.providers?.morpheus} live={data.status?.morpheus?.live} /></div></td>
                <td>{m.releaseDate || '—'}</td><td>{fmtContext(m.context)}</td>
                <td>{fmtParams(m.paramsTotalB)}<span className="sub">{m.paramsActiveB ? `${fmtParams(m.paramsActiveB)} active` : ''}</span></td>
                <td className="quant">{m.quantization || '—'}</td>
                <td>{price ? `${fmtPrice(price.input)} / ${fmtPrice(price.output)}` : '—'}</td>
                <td><span className="evidence">{m.ranking?.signals?.length || 0}/4</span></td>
                <td><button className={`compareBtn ${compare.includes(m.id) ? 'selected' : ''}`} onClick={() => toggleCompare(m.id)}>{compare.includes(m.id) ? 'Added' : '+'}</button></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </section>

      <section id="compare" className="shell compareSection">
        <div className="sectionHead"><div><span className="kicker">COMPARE</span><h2>{compareModels.length ? `${compareModels.length} selected` : 'Select up to four models'}</h2></div><button className="ghost" onClick={() => setCompare([])}>Clear</button></div>
        {compareModels.length ? <div className="compareGrid">{compareModels.map(m => {
          const price = m.prices?.morpheus || m.prices?.venice || m.prices?.reference;
          return <article key={m.id} className="compareCard"><div className="compareTop"><span className={`tierPill tier-${m.ranking.tier}`}>{m.ranking.tier}</span><button onClick={() => toggleCompare(m.id)}>×</button></div><h3>{m.name}</h3><p>{m.organization}</p>
            <dl><div><dt>Composite</dt><dd>{m.ranking.score ?? '—'}</dd></div><div><dt>Context</dt><dd>{fmtContext(m.context)}</dd></div><div><dt>Total params</dt><dd>{fmtParams(m.paramsTotalB)}</dd></div><div><dt>Active params</dt><dd>{fmtParams(m.paramsActiveB)}</dd></div><div><dt>Input / output</dt><dd>{price ? `${fmtPrice(price.input)} / ${fmtPrice(price.output)}` : '—'}</dd></div><div><dt>Quantization</dt><dd>{m.quantization || '—'}</dd></div><div><dt>Released</dt><dd>{m.releaseDate || '—'}</dd></div><div><dt>License</dt><dd>{m.license || '—'}</dd></div></dl>
            <div className="links">{m.huggingFace && <a href={m.huggingFace} target="_blank">Hugging Face ↗</a>}{m.official && <a href={m.official} target="_blank">Official ↗</a>}</div>
          </article>;
        })}</div> : <div className="emptyCompare">Use the <b>+</b> control in the leaderboard or click a tier card.</div>}
      </section>

      <footer className="shell footer"><div><b>LLM//RANK</b><span>Research interface for text-model comparison.</span></div><div><a href="https://docs.venice.ai/models/overview">Venice</a><a href="https://apidocs.mor.org/documentation/models">Morpheus</a><a href="https://llm-stats.com/leaderboards/llm-leaderboard">LLM Stats</a><a href="https://artificialanalysis.ai/">Artificial Analysis</a><a href="https://arena.ai/leaderboard/text">Arena</a><a href="https://kilo.ai/kilobench">KiloBench</a></div></footer>
    </main>
  );
}
