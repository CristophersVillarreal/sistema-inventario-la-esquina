/* ============================================================
   screens-reportes.jsx — Reportes (6 tipos)  [solo Admin]
   ============================================================ */

function ReportHeader({ title, sub, onBack, actions }) {
  return (
    <div>
      <button className="link-btn" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginBottom: 10 }} onClick={onBack}>{I.back({ width: 14, height: 14 })} Volver a Reportes</button>
      <div className="head-row" style={{ marginBottom: 18 }}>
        <div><h1 className="page-title" style={{ textTransform: 'uppercase' }}>{title}</h1><p className="page-sub">{sub}</p></div>
        <div className="btn-group">{actions}</div>
      </div>
    </div>
  );
}

const REPORTS = [
];

function Reportes({ products, moves, sales, toast }) {
  const [view, setView] = useState(null);
  const active = products;
  const pdf = () => toast('Generando PDF del reporte… (descarga simulada).', 'ok');
  const xls = () => toast('Exportando a Excel… (descarga simulada).', 'ok');

  if (!view) {
    return (
      <div className="stack" style={{ gap: 18 }}>
        <div><h1 className="page-title">Reportes</h1><p className="page-sub">Selecciona el tipo de reporte que deseas visualizar.</p></div>
        <div className="report-grid">
          {REPORTS.map(r => (
            <button key={r.key} className="report-card" onClick={() => setView(r.key)}>
              <div className="report-card__icon" style={{ background: r.bg, color: r.color }}>{I[r.icon]()}</div>
              <h3>{r.title}</h3><p>{r.desc}</p>
              <span className="btn btn--sm">Ver Reporte {I.arrow({ width: 13, height: 13 })}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const back = () => setView(null);

  return null;
}

Object.assign(window, { Reportes, REPORTS });
