/* ============================================================
   charts.jsx — Gráficos en SVG/CSS (sin librerías)
   ============================================================ */

/* Donut chart con leyenda */
function Donut({ data, size = 168, thickness = 26 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const seg = (
              <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={d.color} strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />
            );
            offset += len;
            return seg;
          })}
        </g>
      </svg>
      <div className="legend">
        {data.map((d, i) => (
          <span key={i}><i style={{ background: d.color }} />{d.name}</span>
        ))}
      </div>
    </div>
  );
}

/* Barras agrupadas (entradas vs salidas) */
function GroupedBars({ data, keys, height = 200 }) {
  const max = Math.max(...data.flatMap(d => keys.map(k => d[k.key]))) || 1;
  const ticks = 4;
  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height, fontSize: 10, color: 'var(--ink-3)', paddingBottom: 18, textAlign: 'right', minWidth: 24 }}>
          {Array.from({ length: ticks + 1 }).map((_, i) => (
            <div key={i}>{Math.round(max - (max / ticks) * i)}</div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div className="bars" style={{ height, borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)', alignItems: 'flex-end' }}>
            {data.map((d, i) => (
              <div key={i} className="bars__group">
                {keys.map(k => (
                  <div key={k.key} className="bar"
                    title={`${k.label}: ${d[k.key]}`}
                    style={{ height: `${(d[k.key] / max) * 100}%`, background: k.color }} />
                ))}
              </div>
            ))}
          </div>
          <div className="bars__labels">
            {data.map((d, i) => <span key={i}>{d.d}</span>)}
          </div>
        </div>
      </div>
      <div className="legend">
        {keys.map(k => <span key={k.key}><i style={{ background: k.color }} />{k.label}</span>)}
      </div>
    </div>
  );
}

/* Barras verticales simples (top stock) */
function VBars({ data, height = 200, color = 'var(--blue)' }) {
  const max = Math.max(...data.map(d => d.value)) || 1;
  return (
    <div>
      <div className="bars" style={{ height, borderBottom: '1px solid var(--line)', gap: '3%' }}>
        {data.map((d, i) => (
          <div key={i} className="bars__group" style={{ flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div className="bar" title={`${d.label}: ${d.value}`}
              style={{ width: '60%', height: `${(d.value / max) * 100}%`, background: color }} />
          </div>
        ))}
      </div>
      <div className="bars__labels">
        {data.map((d, i) => <span key={i} style={{ fontSize: 10 }}>{d.label}</span>)}
      </div>
    </div>
  );
}

/* Barras horizontales (ranking) */
function HBars({ data, color = 'var(--blue)' }) {
  const max = Math.max(...data.map(d => d.value)) || 1;
  return (
    <div className="stack" style={{ gap: 9 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 54px', gap: 10, alignItems: 'center', fontSize: 12 }}>
          <div className="muted" style={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</div>
          <div style={{ background: 'var(--surface)', borderRadius: 4, height: 18 }}>
            <div style={{ width: `${(d.value / max) * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .5s' }} />
          </div>
          <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{d.value}</div>
        </div>
      ))}
    </div>
  );
}

/* Línea (tendencia) */
function LineChart({ values, labels, height = 210, color = 'var(--primary)' }) {
  const w = 640, pad = 28;
  const max = Math.max(...values) * 1.15 || 1;
  const step = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, height - pad - (v / max) * (height - pad * 2)]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${pts[pts.length - 1][0]} ${height - pad} L${pts[0][0]} ${height - pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} width="100%" style={{ display: 'block' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={pad} x2={w - pad} y1={pad + t * (height - pad * 2)} y2={pad + t * (height - pad * 2)} stroke="var(--line)" strokeDasharray="3 4" />
        ))}
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lg)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#fff" stroke={color} strokeWidth="2.5" />)}
      </svg>
      <div className="bars__labels" style={{ padding: '0 14px' }}>
        {labels.map((l, i) => <span key={i} style={{ fontSize: 10 }}>{l}</span>)}
      </div>
    </div>
  );
}

Object.assign(window, { Donut, GroupedBars, VBars, HBars, LineChart });
