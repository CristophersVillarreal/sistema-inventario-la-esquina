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

/* Genera un PDF limpio (título + tabla de datos) con jsPDF + AutoTable. */
function exportarReportePDF(titulo, columnas, filas, archivo) {
  const lib = window.jspdf;
  if (!lib || !lib.jsPDF) {
    alert('No se pudo cargar el generador de PDF. Verifica tu conexión a internet e inténtalo de nuevo.');
    return;
  }
  const doc = new lib.jsPDF({ orientation: columnas.length >= 7 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });

  // Encabezado del documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(titulo, 14, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text('Minimarket "La Esquina"   ·   Generado: ' + new Date().toLocaleString('es-PE'), 14, 22);
  doc.setTextColor(0);

  // Tabla de datos
  doc.autoTable({
    startY: 28,
    head: [columnas],
    body: filas,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
  });

  // Pie: total de registros
  const y = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 28) + 8;
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text('Total de registros: ' + filas.length, 14, y);

  doc.save(archivo);
}

const REPORTS = [
  { key: 'inv',  icon: 'box',    color: '#1e3a8a', bg: '#eef2ff', title: 'Reporte General de Inventario', desc: 'Resumen completo del stock, valor y categorías de productos.' },
  { key: 'ventas', icon: 'cart', color: '#059669', bg: '#ecfdf5', title: 'Reporte de Ventas', desc: 'Ventas totales, promedio por venta y métodos de pago.' },
];

function Reportes({ products, moves, sales, toast }) {
  const [view, setView] = useState(null);
  const active = products;

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

  /* ---- 1. Inventario ---- */
  if (view === 'inv') {
    const byCat = CATEGORIES.map(c => ({ name: c, value: active.filter(p => p.cat === c).length, color: catColor(c) }));
    const topStock = [...active].sort((a, b) => b.stock - a.stock).slice(0, 6).map(p => ({ label: p.name.split(' ').slice(0, 2).join(' '), value: p.stock }));
    const low = active.filter(p => p.stock <= p.min).length;
    const exp = active.filter(p => { const d = daysUntil(p.expiry); return d >= 0 && d <= 30; }).length;
    const val = active.reduce((s, p) => s + p.price * p.stock, 0);
    return (
      <div className="stack" style={{ gap: 18 }}>
        <ReportHeader title="Reporte General de Inventario" sub="Resumen ejecutivo del inventario actual · La Esquina" onBack={back} actions={<button className="btn btn--sm" onClick={() => exportarReportePDF('REPORTE GENERAL DE INVENTARIO', ['Código', 'Producto', 'Categoría', 'Stock', 'Mínimo', 'Precio (S/)', 'Estado'], active.map(p => [p.id, p.name, p.cat, p.stock, p.min, p.price.toFixed(2), stockState(p).label]), 'reporte-inventario.pdf')}>{I.file({ width: 14, height: 14 })} Exportar PDF</button>} />
        <div className="kpi-grid">
          <div className="kpi"><div className="kpi__icon">{I.box()}</div><div className="kpi__label">Total de Productos</div><div className="kpi__value">{active.length}</div><div className="kpi__sub">Productos registrados</div></div>
          <div className="kpi"><div className="kpi__icon" style={{ color: 'var(--red)' }}>{I.warn()}</div><div className="kpi__label">Bajo Stock</div><div className="kpi__value">{low}</div><div className="kpi__sub">Requieren reposición</div></div>
          <div className="kpi"><div className="kpi__icon" style={{ color: 'var(--amber)' }}>{I.clock()}</div><div className="kpi__label">Próximos a Vencer</div><div className="kpi__value">{exp}</div><div className="kpi__sub">En los próximos 30 días</div></div>
          <div className="kpi kpi--dark"><div className="kpi__icon">{I.money()}</div><div className="kpi__label">Valor del Inventario</div><div className="kpi__value">{soles(val)}</div><div className="kpi__sub">Valor total estimado</div></div>
        </div>
        <div className="grid-2">
          <div className="card"><div className="section-title" style={{ marginBottom: 4 }}>Distribución por categoría</div><div className="page-sub" style={{ marginBottom: 14 }}>Cantidad de productos por categoría</div><Donut data={byCat} /></div>
          <div className="card"><div className="section-title" style={{ marginBottom: 4 }}>Productos con mayor stock</div><div className="page-sub" style={{ marginBottom: 14 }}>Top 6 unidades en almacén</div><VBars data={topStock} /></div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 18 }}><div className="section-title">Detalle de productos</div><div className="page-sub">{active.length} resultados</div></div>
          <div className="table-wrap"><table className="table"><thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th className="num">Stock</th><th className="num">Mínimo</th><th>Estado</th></tr></thead>
            <tbody>{active.map(p => { const st = stockState(p); return <tr key={p.id}><td className="code">{p.id}</td><td className="t-strong">{p.name}</td><td className="muted">{p.cat}</td><td className={'num ' + (p.stock <= p.min ? 'stock-low' : '')}>{p.stock}</td><td className="num muted">{p.min}</td><td><span className={'badge ' + st.cls}>{st.label}</span></td></tr>; })}</tbody>
          </table></div>
        </div>
      </div>
    );
  }

  /* ---- 2. Ventas ---- */
  if (view === 'ventas') {
    const totalV = sales.reduce((s, x) => s + x.total, 0);
    const avg = sales.length ? totalV / sales.length : 0;
    const byProd = {}; sales.forEach(s => byProd[s.name] = (byProd[s.name] || 0) + s.qty);
    const top = Object.entries(byProd).sort((a, b) => b[1] - a[1])[0];
    const payTotals = METHODS.map(m => ({ name: m, value: sales.filter(s => s.method === m).reduce((a, s) => a + s.total, 0), color: m === 'Efectivo' ? 'var(--green)' : m === 'Yape' ? 'var(--blue)' : 'var(--amber)' }));
    return (
      <div className="stack" style={{ gap: 18 }}>
        <ReportHeader title="Reporte de Ventas" sub="Análisis comercial · La Esquina" onBack={back} actions={<button className="btn btn--sm" onClick={() => exportarReportePDF('REPORTE GENERAL DE VENTAS', ['N° Venta', 'Fecha y hora', 'Producto', 'Cant.', 'Método', 'Cajero', 'Total (S/)'], sales.map(s => [s.id, s.date, s.name, s.qty, s.method, s.user, s.total.toFixed(2)]), 'reporte-ventas.pdf')}>{I.file({ width: 14, height: 14 })} Exportar PDF</button>} />
        <div className="kpi-grid">
          <div className="kpi"><div className="kpi__icon" style={{ color: 'var(--green)' }}>{I.money()}</div><div className="kpi__label">Ventas Totales</div><div className="kpi__value">{soles(totalV)}</div><div className="kpi__sub">{sales.length} transacciones</div></div>
          <div className="kpi"><div className="kpi__icon">{I.receipt()}</div><div className="kpi__label">Promedio por Venta</div><div className="kpi__value">{soles(avg)}</div></div>
          <div className="kpi"><div className="kpi__icon" style={{ color: 'var(--amber)' }}>{I.trophy()}</div><div className="kpi__label">Más Vendido</div><div className="kpi__value" style={{ fontSize: 19 }}>{top ? top[0] : '—'}</div><div className="kpi__sub">{top ? top[1] + ' unidades' : ''}</div></div>
          <div className="kpi kpi--dark"><div className="kpi__icon">{I.money()}</div><div className="kpi__label">Métodos de Pago</div><div className="kpi__value">{METHODS.length}</div><div className="kpi__sub">Efectivo · Yape · Tarjeta</div></div>
        </div>
        <div className="grid-2">
          <div className="card"><div className="section-title" style={{ marginBottom: 4 }}>Tendencia semanal</div><div className="page-sub" style={{ marginBottom: 14 }}>Ventas (S/) por día</div><LineChart values={SALES_WEEK} labels={WEEK} /></div>
          <div className="card"><div className="section-title" style={{ marginBottom: 4 }}>Métodos de pago</div><div className="page-sub" style={{ marginBottom: 14 }}>Distribución por monto</div><Donut data={payTotals} /></div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 18 }}><div className="section-title">Ventas registradas</div><div className="page-sub">{sales.length} transacciones</div></div>
          <div className="table-wrap"><table className="table"><thead><tr><th>N° Venta</th><th>Fecha</th><th>Producto</th><th className="num">Cant.</th><th>Método</th><th>Cajero</th><th className="num">Total</th></tr></thead>
            <tbody>{sales.map(s => <tr key={s.id}><td className="code">{s.id}</td><td className="muted">{s.date}</td><td className="t-strong">{s.name}</td><td className="num">{s.qty}</td><td className="muted">{s.method}</td><td className="muted">{s.user}</td><td className="num t-strong">{soles(s.total)}</td></tr>)}</tbody>
          </table></div>
        </div>
      </div>
    );
  }

  return null;
}

Object.assign(window, { Reportes, REPORTS });
