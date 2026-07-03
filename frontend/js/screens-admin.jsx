/* ============================================================
   screens-admin.jsx — Dashboard, Productos, Inventario,
   Proveedores, Usuarios  (perfil Administrador)
   ============================================================ */

/* ===================== DASHBOARD ===================== */
function Dashboard({ products, moves, go }) {
  const active = products;
  const lowStock = active.filter(p => p.stock <= p.min);
  const expiring = active.filter(p => { const d = daysUntil(p.expiry); return d >= 0 && d <= 30; });
  const invValue = active.reduce((s, p) => s + p.price * p.stock, 0);

  const alerts = [
    ...lowStock.slice(0, 2).map(p => ({ tag: 'Stock', t: `Producto ${p.name} — Stock mínimo alcanzado`, cls: 'badge--red' })),
    ...expiring.slice(0, 2).map(p => ({ tag: 'Vencimiento', t: `Producto ${p.name} — Próximo a vencer (${p.expiry})`, cls: 'badge--amber' })),
  ];

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div><h1 className="page-title">Resumen General</h1><p className="page-sub">Estado actual del inventario · {TODAY.toLocaleDateString('es-PE')}</p></div>

      <div className="kpi-grid">
        <div className="kpi"><div className="kpi__icon">{I.box()}</div><div className="kpi__label">Total Productos</div><div className="kpi__value">{active.length}</div><div className="kpi__sub">Productos activos</div></div>
        <div className="kpi"><div className="kpi__icon" style={{ color: 'var(--red)' }}>{I.warn()}</div><div className="kpi__label">Stock Bajo</div><div className="kpi__value" style={{ color: lowStock.length ? 'var(--red)' : 'inherit' }}>{lowStock.length}</div><div className="kpi__sub">Requieren reposición</div></div>
        <div className="kpi"><div className="kpi__icon" style={{ color: 'var(--amber)' }}>{I.clock()}</div><div className="kpi__label">Próximos a Vencer</div><div className="kpi__value" style={{ color: expiring.length ? 'var(--amber)' : 'inherit' }}>{expiring.length}</div><div className="kpi__sub">En los próximos 30 días</div></div>
        <div className="kpi kpi--dark"><div className="kpi__icon">{I.money()}</div><div className="kpi__label">Valor Inventario</div><div className="kpi__value">{soles(invValue)}</div><div className="kpi__sub">Valor total estimado</div></div>
      </div>

      <div className="card">
        <div className="card__head"><div className="section-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{I.bell({ width: 16, height: 16 })} Alertas Recientes</div><button className="btn btn--sm" onClick={() => go('alertas')}>Ver todas {I.arrow({ width: 13, height: 13 })}</button></div>
        {alerts.length ? alerts.map((a, i) => (
          <div className="alert-line" key={i}><span className={'badge ' + a.cls}>{a.tag}</span><span>{a.t}</span></div>
        )) : <div className="empty">Sin alertas pendientes.</div>}
      </div>

      <div className="card">
        <div className="card__head"><div><div className="section-title">Movimientos del Mes</div><div className="page-sub" style={{ marginTop: 2 }}>Entradas vs salidas por día</div></div></div>
        <GroupedBars data={MOVE_WEEK} keys={[{ key: 'entradas', label: 'Entradas', color: 'var(--green)' }, { key: 'salidas', label: 'Salidas', color: 'var(--red)' }]} />
      </div>

      <div className="card">
        <div className="card__head"><div className="section-title">Últimos Movimientos</div><button className="btn btn--sm" onClick={() => go('inventario')}>Ir a Inventario {I.arrow({ width: 13, height: 13 })}</button></div>
        {moves.slice(0, 5).map(m => (
          <div className="list-item" key={m.id}>
            <div><div className="t-strong">{m.name}</div><div className="muted" style={{ fontSize: 12 }}>{m.code} · {m.user}</div></div>
            <div style={{ textAlign: 'right' }}>
              <span className={'badge ' + (m.type === 'entrada' ? 'badge--green' : 'badge--red')}>{m.type === 'entrada' ? 'ENTRADA +' + m.qty : 'SALIDA −' + m.qty}</span>
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{m.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== PRODUCTOS ===================== */
function ProductForm({ initial, suppliers, onSave, onClose }) {
  const [f, setF] = useState(initial || { id: '', name: '', cat: 'Panadería', price: '', stock: '', min: '', expiry: '', supplier: suppliers[0]?.id || '' });
  const [touched, setTouched] = useState({});
  const set = (k) => (v) => setF(s => ({ ...s, [k]: v }));
  const errs = { name: V.required(f.name), price: V.positive(f.price), stock: f.stock === '' || isNaN(+f.stock) || +f.stock < 0 ? 'Ingresa un stock válido (≥ 0).' : '', min: V.positive(f.min) };
  const valid = Object.values(errs).every(e => !e);
  const show = (k) => touched[k] ? errs[k] : '';

  return (
    <Modal lg title={initial ? 'Editar Producto' : 'Nuevo Producto'} onClose={onClose} footer={
      <React.Fragment>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn--primary" onClick={() => { setTouched({ name: 1, price: 1, stock: 1, min: 1 }); if (valid) onSave({ ...f, price: +f.price, stock: +f.stock, min: +f.min }); }}>Guardar Producto</button>
      </React.Fragment>
    }>
      <div className="form-grid">
        <Field label="Código"><input className="input" value={f.id || '(automático)'} disabled /></Field>
        <Field label="Categoría"><Select value={f.cat} onChange={set('cat')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
        <div className="col-2"><Field label="Nombre del producto" required error={show('name')}><input className="input" value={f.name} onChange={e => set('name')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, name: 1 }))} placeholder="Ej. Leche Gloria 1L" /></Field></div>
        <Field label="Precio (S/)" required error={show('price')}><input className="input" value={f.price} onChange={e => set('price')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, price: 1 }))} inputMode="decimal" placeholder="0.00" /></Field>
        <Field label="Proveedor preseleccionado"><Select value={f.supplier} onChange={set('supplier')}>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <Field label="Stock actual" required error={show('stock')}><input className="input" value={f.stock} onChange={e => set('stock')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, stock: 1 }))} inputMode="numeric" placeholder="0" /></Field>
        <Field label="Stock mínimo" required error={show('min')}><input className="input" value={f.min} onChange={e => set('min')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, min: 1 }))} inputMode="numeric" placeholder="0" /></Field>
        <Field label="Fecha de caducidad" hint="Opcional, para alertas de vencimiento."><input className="input" type="date" value={f.expiry} onChange={e => set('expiry')(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

function Productos({ products, suppliers, reload, toast, confirm }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todos');
  const [editing, setEditing] = useState(null); // null | 'new' | product

  const filtered = products.filter(p =>
    (cat === 'Todos' || p.cat === cat) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()))
  );

  const save = async (data) => {
    try {
      if (data.dbId) { await API.editarProducto(data.dbId, data); toast('Producto actualizado correctamente.'); }
      else { await API.crearProducto(data); toast('Producto creado correctamente.'); }
      setEditing(null);
      await reload();
    } catch (err) { toast(err.mensaje || err.message, 'err'); }
  };

  const remove = (p) => confirm({
    title: 'Eliminar producto',
    message: '¿Está seguro de que desea eliminar este producto?',
    confirmLabel: 'Eliminar',
    danger: true,
    onConfirm: async () => {
      try {
        await API.eliminarProducto(p.dbId);
        toast('Producto eliminado correctamente.');
        await reload();
      } catch (err) { toast(err.mensaje || err.message, 'err'); }
    }
  });

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="head-row">
        <div><h1 className="page-title">Productos</h1><p className="page-sub">Catálogo y gestión de productos.</p></div>
        <button className="btn btn--primary" onClick={() => setEditing('new')}>{I.plus()} Nuevo Producto</button>
      </div>

      <div className="row-wrap">
        <div className="search" style={{ maxWidth: 380 }}>{I.search()}<input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o código…" /></div>
        <div className="chips">
          {['Todos', ...CATEGORIES].map(c => <button key={c} className={'chip' + (cat === c ? ' chip--active' : '')} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th className="num">Precio</th><th className="num">Stock</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
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
                    <td>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn--sm" onClick={() => setEditing(p)}>{I.edit()} Editar</button>
                        <button className="btn btn--sm btn--danger" onClick={() => remove(p)}>{I.trash()} Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && <tr><td colSpan="7"><div className="empty">No se encontraron productos.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <ProductForm initial={editing === 'new' ? null : editing} suppliers={suppliers} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ===================== INVENTARIO ===================== */
function Inventario({ products, suppliers, moves, reload, toast }) {
  const active = products;
  const [f, setF] = useState({ type: 'entrada', code: active[0]?.id || '', qty: '', supplier: '', note: '' });
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF(s => ({ ...s, [k]: v }));
  const prod = products.find(p => p.id === f.code);

  const qtyErr = (() => {
    if (f.qty === '' || isNaN(+f.qty) || +f.qty <= 0) return 'Ingresa una cantidad mayor a 0.';
    if (f.type === 'salida' && prod && +f.qty > prod.stock) return `Stock insuficiente. Disponible: ${prod.stock} unidades.`;
    return '';
  })();

  const register = async () => {
    setTouched({ qty: 1 });
    if (qtyErr || !f.code || !prod) return;
    const qty = +f.qty;
    setBusy(true);
    try {
      if (f.type === 'entrada') await API.entrada({ code: prod.id, qty, note: f.note });
      else await API.salida({ code: prod.id, qty, note: f.note }); // salida de almacén (ajuste/merma), sin método de pago
      toast(`Movimiento registrado: ${f.type === 'entrada' ? 'entrada' : 'salida'} de ${qty} und. de ${prod.name}.`);
      setF({ type: 'entrada', code: f.code, qty: '', supplier: '', note: '' });
      setTouched({});
      await reload();
    } catch (err) {
      toast(err.mensaje || err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div><h1 className="page-title">Inventario · Movimientos</h1><p className="page-sub">Registra entradas (compras) y salidas. El stock se actualiza automáticamente.</p></div>
      <div className="grid-2-asym">
        <div className="card card--pad-lg">
          <div className="section-title" style={{ marginBottom: 18 }}>Registrar Movimiento</div>
          <div className="form-grid">
            <Field label="Tipo de movimiento"><Select value={f.type} onChange={set('type')}><option value="entrada">Entrada (Compra)</option><option value="salida">Salida (Ajuste / Merma)</option></Select></Field>
            <Field label="Producto"><Select value={f.code} onChange={set('code')}>{active.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}</Select></Field>
            <Field label="Cantidad" required error={touched.qty ? qtyErr : ''} hint={prod ? `Stock actual: ${prod.stock} und.` : ''}><input className="input" value={f.qty} onChange={e => set('qty')(e.target.value.replace(/[^\d]/g, ''))} onBlur={() => setTouched({ qty: 1 })} inputMode="numeric" placeholder="0" /></Field>
            <Field label="Proveedor (opcional)"><Select value={f.supplier} onChange={set('supplier')} disabled={f.type === 'salida'}><option value="">— Seleccionar —</option>{suppliers.filter(s => s.status === 'Activo').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            <div className="col-2"><Field label="Observaciones"><textarea className="textarea" value={f.note} onChange={e => set('note')(e.target.value)} placeholder="Notas internas del movimiento…" /></Field></div>
          </div>
          <button className="btn btn--primary btn--block" onClick={register} disabled={busy}>{f.type === 'entrada' ? I.down() : I.up()} {busy ? 'Registrando…' : 'Registrar Movimiento'}</button>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Movimientos Recientes</div>
          <div className="stack" style={{ gap: 9 }}>
            {moves.slice(0, 7).map(m => (
              <div className="list-item" key={m.id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}><div className="t-strong">{m.name}</div><span className={'badge ' + (m.type === 'entrada' ? 'badge--green' : 'badge--red')}>{m.type.toUpperCase()}</span></div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="muted" style={{ fontSize: 12 }}>{m.code} · {m.user}</span>
                  <span style={{ fontWeight: 600, color: m.type === 'entrada' ? 'var(--green)' : 'var(--red)' }}>{m.type === 'entrada' ? '+' : '−'}{m.qty}</span>
                </div>
                <div className="muted" style={{ fontSize: 11 }}>{m.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Productos, ProductForm, Inventario });
