/* ============================================================
   screens-ventas.jsx — Registrar Venta (POS, salida de stock)
   y Catálogo de productos (consulta).  Usado por Admin y Cajero.
   ============================================================ */

const METHODS = ['Efectivo', 'Yape', 'Tarjeta'];

/* ===================== REGISTRAR VENTA (POS) ===================== */
function Ventas({ products, sales, reload, user, toast }) {
  const active = products;
  const [tab, setTab] = useState('nueva');
  const [cart, setCart] = useState([]);
  const [pick, setPick] = useState(active[0]?.id || '');
  const [qty, setQty] = useState('1');
  const [method, setMethod] = useState('Efectivo');
  const [client, setClient] = useState('');
  const [dni, setDni] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [histQ, setHistQ] = useState('');

  const prod = products.find(p => p.id === pick);
  const inCart = (id) => cart.filter(c => c.code === id).reduce((s, c) => s + c.qty, 0);
  const available = prod ? prod.stock - inCart(prod.id) : 0;

  const add = () => {
    const n = parseInt(qty, 10);
    if (!prod) return;
    if (!n || n <= 0) { setErr('Ingresa una cantidad válida.'); return; }
    if (n > available) { setErr(`Stock insuficiente para ${prod.name}. Disponible: ${available} und.`); return; }
    setErr('');
    setCart(c => {
      const ex = c.find(x => x.code === prod.id);
      if (ex) return c.map(x => x.code === prod.id ? { ...x, qty: x.qty + n } : x);
      return [...c, { code: prod.id, name: prod.name, price: prod.price, qty: n }];
    });
    setQty('1');
  };
  const removeLine = (code) => setCart(c => c.filter(x => x.code !== code));
  const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const dniErr = V.dni(dni);

  const register = async () => {
    if (!cart.length) { setErr('Agrega al menos un producto a la venta.'); return; }
    if (dniErr) { setErr(dniErr); return; }
    const cname = client.trim() || 'Cliente mostrador';
    setBusy(true);
    try {
      // Cada línea del carrito = un movimiento de salida (venta) con su método de pago.
      // El backend valida stock, descuenta y registra el rastro usuario/fecha.
      for (const l of cart) {
        await API.salida({ code: l.code, qty: l.qty, method, client: cname, note: `Venta · ${method}` });
      }
      toast(`Venta registrada: ${cart.length} producto(s) · ${soles(total)} · ${method}.`);
      setCart([]); setClient(''); setDni(''); setErr('');
      await reload();
    } catch (e) {
      const msg = e.mensaje || e.message || 'No se pudo registrar la venta.';
      setErr(msg);
      toast(msg, 'err');
      await reload(); // refresca el stock por si alguna línea ya se procesó
    } finally {
      setBusy(false);
    }
  };

  const filteredSales = sales.filter(s => !histQ || s.name.toLowerCase().includes(histQ.toLowerCase()) || s.id.toLowerCase().includes(histQ.toLowerCase()) || (s.client || '').toLowerCase().includes(histQ.toLowerCase()));

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div><h1 className="page-title">Registrar Venta</h1><p className="page-sub">Punto de venta · registra la salida de stock. Valida existencias antes de vender.</p></div>

      <div className="tabs">
        <button className={'tab' + (tab === 'nueva' ? ' tab--active' : '')} onClick={() => setTab('nueva')}>{I.cart({ width: 15, height: 15 })} Nueva Venta</button>
        <button className={'tab' + (tab === 'hist' ? ' tab--active' : '')} onClick={() => setTab('hist')}>{I.clock({ width: 15, height: 15 })} Historial</button>
      </div>

      {tab === 'nueva' ? (
        <div className="grid-2-asym">
          <div className="card card--pad-lg">
            <div className="section-title" style={{ marginBottom: 16 }}>Detalle de la venta</div>
            <div className="row" style={{ alignItems: 'flex-end', gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1 }}><Field label="Producto"><Select value={pick} onChange={setPick}>{active.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name} (stock {p.stock})</option>)}</Select></Field></div>
              <div style={{ width: 92 }}><Field label="Cantidad"><input className="input" value={qty} onChange={e => setQty(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" /></Field></div>
              <button className="btn btn--primary" style={{ marginBottom: 16 }} onClick={add} disabled={available <= 0}>{I.plus()} Agregar</button>
            </div>
            {prod && <div className="field-hint" style={{ marginTop: -2, marginBottom: 10 }}>Disponible para vender: <b style={{ color: available > 0 ? 'var(--ink)' : 'var(--red)' }}>{available} und.</b> · {soles(prod.price)} c/u</div>}
            {err && <div className="field-error" style={{ marginBottom: 12 }}>{I.warn({ width: 12, height: 12 })}{err}</div>}

            <div className="card" style={{ padding: 0, marginTop: 6 }}>
              <table className="table">
                <thead><tr><th>Producto</th><th className="num">Cant.</th><th className="num">P. Unit.</th><th className="num">Subtotal</th><th></th></tr></thead>
                <tbody>
                  {cart.length ? cart.map(l => (
                    <tr key={l.code}>
                      <td className="t-strong">{l.name}<div className="muted" style={{ fontSize: 11 }}>{l.code}</div></td>
                      <td className="num">{l.qty}</td>
                      <td className="num">{soles(l.price)}</td>
                      <td className="num t-strong">{soles(l.price * l.qty)}</td>
                      <td style={{ textAlign: 'right' }}><button className="icon-btn icon-btn--bare" style={{ color: 'var(--red)' }} onClick={() => removeLine(l.code)}>{I.trash()}</button></td>
                    </tr>
                  )) : <tr><td colSpan="5"><div className="empty">No hay productos. Selecciona uno y presiona "Agregar".</div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card card--pad-lg" style={{ alignSelf: 'flex-start' }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Resumen</div>
            <Field label="Cliente (opcional)"><input className="input" value={client} onChange={e => setClient(e.target.value)} placeholder="Nombre del cliente" /></Field>
            <Field label="DNI (opcional)" error={dni && dniErr ? dniErr : ''}><input className="input" value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric" placeholder="8 dígitos" /></Field>
            <Field label="Método de pago">
              <div className="chips">{METHODS.map(m => <button key={m} className={'chip' + (method === m ? ' chip--active' : '')} onClick={() => setMethod(m)}>{m}</button>)}</div>
            </Field>
            <div style={{ borderTop: '1px solid var(--line)', margin: '6px 0 14px', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="muted">Total a pagar</span>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: -1 }}>{soles(total)}</span>
            </div>
            <button className="btn btn--primary btn--block" onClick={register} disabled={!cart.length || busy}>{I.receipt({ width: 15, height: 15 })} {busy ? 'Registrando…' : 'Registrar Venta'}</button>
            {cart.length > 0 && <button className="btn btn--block" style={{ marginTop: 8 }} onClick={() => { setCart([]); setClient(''); setDni(''); setErr(''); }}>Vaciar</button>}
          </div>
        </div>
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          <div className="search" style={{ maxWidth: 420 }}>{I.search()}<input value={histQ} onChange={e => setHistQ(e.target.value)} placeholder="Buscar por producto, cliente o N° venta…" /></div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>N° Venta</th><th>Fecha</th><th>Producto</th><th>Cliente</th><th className="num">Cant.</th><th>Método</th><th>Cajero</th><th className="num">Total</th></tr></thead>
                <tbody>
                  {filteredSales.map(s => (
                    <tr key={s.id}>
                      <td className="code">{s.id}</td>
                      <td className="muted">{s.date}</td>
                      <td className="t-strong">{s.name}</td>
                      <td className="muted">{s.client}</td>
                      <td className="num">{s.qty}</td>
                      <td><span className={'badge ' + (s.method === 'Efectivo' ? 'badge--green' : s.method === 'Yape' ? 'badge--muted' : 'badge--amber')}>{s.method}</span></td>
                      <td className="muted">{s.user}</td>
                      <td className="num t-strong">{soles(s.total)}</td>
                    </tr>
                  ))}
                  {!filteredSales.length && <tr><td colSpan="8"><div className="empty">Sin ventas que coincidan.</div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== CATÁLOGO (consulta, solo lectura) ===================== */
function Catalogo({ products }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todos');
  const active = products;
  const filtered = active.filter(p => (cat === 'Todos' || p.cat === cat) && (p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div><h1 className="page-title">Catálogo de Productos</h1><p className="page-sub">Consulta de productos y existencias (solo lectura).</p></div>
      <div className="row-wrap">
        <div className="search" style={{ maxWidth: 380 }}>{I.search()}<input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o código…" /></div>
        <div className="chips">{['Todos', ...CATEGORIES].map(c => <button key={c} className={'chip' + (cat === c ? ' chip--active' : '')} onClick={() => setCat(c)}>{c}</button>)}</div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th className="num">Precio</th><th className="num">Stock</th><th>Estado</th></tr></thead>
            <tbody>
              {filtered.map(p => {
                const st = stockState(p);
                return (
                  <tr key={p.id}>
                    <td className="code">{p.id}</td>
                    <td className="t-strong">{p.name}</td>
                    <td className="muted">{p.cat}</td>
                    <td className="num">{soles(p.price)}</td>
                    <td className={'num ' + (p.stock <= p.min ? 'stock-low' : '')}>{p.stock}</td>
                    <td><span className={'badge ' + st.cls}>{st.label}</span></td>
                  </tr>
                );
              })}
              {!filtered.length && <tr><td colSpan="6"><div className="empty">No se encontraron productos.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Ventas, Catalogo, METHODS });
