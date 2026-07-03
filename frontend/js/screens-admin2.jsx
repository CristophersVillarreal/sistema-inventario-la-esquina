/* ============================================================
   screens-admin2.jsx — Proveedores, Usuarios, Alertas
   ============================================================ */

/* ===================== PROVEEDORES ===================== */
function SupplierForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { id: '', name: '', ruc: '', phone: '', email: '', contact: '', address: '', status: 'Activo' });
  const [touched, setTouched] = useState({});
  const set = (k) => (v) => setF(s => ({ ...s, [k]: v }));
  const errs = { name: V.required(f.name), ruc: V.ruc(f.ruc), phone: V.phone(f.phone), email: V.email(f.email) };
  const valid = Object.values(errs).every(e => !e);
  const show = (k) => touched[k] ? errs[k] : '';

  return (
    <Modal lg title={initial ? 'Editar Proveedor' : 'Nuevo Proveedor'} onClose={onClose} footer={
      <React.Fragment>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn--primary" onClick={() => { setTouched({ name: 1, ruc: 1, phone: 1, email: 1 }); if (valid) onSave(f); }}>Guardar Proveedor</button>
      </React.Fragment>
    }>
      <div className="form-grid">
        <Field label="Código"><input className="input" value={f.id || '(automático)'} disabled /></Field>
        <Field label="Estado"><Select value={f.status} onChange={set('status')}><option>Activo</option><option>Inactivo</option></Select></Field>
        <div className="col-2"><Field label="Nombre / Razón Social" required error={show('name')}><input className="input" value={f.name} onChange={e => set('name')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, name: 1 }))} placeholder="Distribuidora …" /></Field></div>
        <Field label="RUC" required error={show('ruc')}><input className="input" value={f.ruc} onChange={e => set('ruc')(e.target.value.replace(/\D/g, '').slice(0, 11))} onBlur={() => setTouched(t => ({ ...t, ruc: 1 }))} inputMode="numeric" placeholder="11 dígitos" /></Field>
        <Field label="Teléfono" required error={show('phone')}><input className="input" value={f.phone} onChange={e => set('phone')(e.target.value.replace(/\D/g, '').slice(0, 9))} onBlur={() => setTouched(t => ({ ...t, phone: 1 }))} inputMode="numeric" placeholder="9 dígitos" /></Field>
        <Field label="Correo electrónico" required error={show('email')}><input className="input" value={f.email} onChange={e => set('email')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, email: 1 }))} placeholder="ventas@empresa.pe" /></Field>
        <Field label="Persona de contacto"><input className="input" value={f.contact} onChange={e => set('contact')(e.target.value)} placeholder="Nombre del contacto" /></Field>
        <div className="col-2"><Field label="Dirección"><input className="input" value={f.address} onChange={e => set('address')(e.target.value)} placeholder="Av. …" /></Field></div>
      </div>
    </Modal>
  );
}

function Proveedores({ suppliers, reload, toast, confirm }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('Todos');
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(suppliers[0]?.id || null);

  const filtered = suppliers.filter(s =>
    (status === 'Todos' || s.status === status) &&
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.ruc.includes(q) || s.id.toLowerCase().includes(q.toLowerCase()))
  );
  const sel = suppliers.find(s => s.id === selected);

  const save = async (data) => {
    try {
      if (data.dbId) { await API.editarProveedor(data.dbId, data); toast('Proveedor actualizado.'); }
      else { await API.crearProveedor(data); toast('Proveedor registrado.'); }
      setEditing(null);
      await reload();
    } catch (err) { toast(err.mensaje || err.message, 'err'); }
  };
  const remove = (s) => confirm({
    title: 'Eliminar proveedor',
    message: `¿Está seguro de que desea eliminar el proveedor "${s.name}"?`,
    confirmLabel: 'Eliminar', danger: true,
    onConfirm: async () => {
      try { await API.eliminarProveedor(s.dbId); toast('Proveedor eliminado correctamente.', 'ok'); await reload(); }
      catch (err) { toast(err.mensaje || err.message, 'err'); }
    }
  });

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="head-row">
        <div><h1 className="page-title">Gestión de Proveedores</h1><p className="page-sub">Administra los proveedores del minimarket "La Esquina".</p></div>
        <button className="btn btn--primary" onClick={() => setEditing('new')}>{I.plus()} Nuevo Proveedor</button>
      </div>

      <div className="grid-2-asym">
        <div className="card" style={{ padding: 0 }}>
          <div className="row-wrap" style={{ padding: 16, borderBottom: '1px solid var(--line)' }}>
            <div className="search" style={{ maxWidth: 320 }}>{I.search()}<input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, RUC o código…" /></div>
            <span className="spacer" />
            <div className="chips">{['Todos', 'Activo', 'Inactivo'].map(s => <button key={s} className={'chip' + (status === s ? ' chip--active' : '')} onClick={() => setStatus(s)}>{s}</button>)}</div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Código</th><th>Razón Social</th><th>RUC</th><th>Contacto</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} onClick={() => setSelected(s.id)} style={{ cursor: 'pointer', background: selected === s.id ? 'var(--surface)' : '' }}>
                    <td className="code">{s.id}</td>
                    <td className="t-strong">{s.name}</td>
                    <td className="muted">{s.ruc}</td>
                    <td className="muted">{s.contact}</td>
                    <td><span className={'badge ' + (s.status === 'Activo' ? 'badge--green' : 'badge--red')}><span className={'dot ' + (s.status === 'Activo' ? 'dot--green' : 'dot--red')} />{s.status}</span></td>
                    <td>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="icon-btn" onClick={e => { e.stopPropagation(); setEditing(s); }} title="Editar">{I.edit()}</button>
                        <button className="icon-btn" onClick={e => { e.stopPropagation(); remove(s); }} title="Eliminar" style={{ color: 'var(--red)' }}>{I.trash()}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan="6"><div className="empty">No se encontraron proveedores.</div></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="muted" style={{ padding: 14, fontSize: 12, borderTop: '1px solid var(--line)' }}>Mostrando {filtered.length} de {suppliers.length} proveedores</div>
        </div>

        <div className="card" style={{ padding: 0, alignSelf: 'flex-start' }}>
          <div style={{ background: 'var(--primary)', color: '#fff', padding: '18px 20px', borderRadius: '9px 9px 0 0' }}>
            <div style={{ fontSize: 11, opacity: .6, letterSpacing: .6 }}>PROVEEDOR SELECCIONADO</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>{sel ? sel.name : '—'}</div>
          </div>
          {sel ? (
            <div style={{ padding: 20 }}>
              {[['Código', sel.id], ['RUC', sel.ruc], ['Teléfono', sel.phone], ['Correo', sel.email], ['Contacto', sel.contact], ['Dirección', sel.address]].map(([k, v]) => (
                <div className="kv" key={k}><div className="kv__k" style={{ minWidth: 78 }}>{k}</div><div className="kv__v">{v}</div></div>
              ))}
              <div style={{ marginTop: 12 }}><span className={'badge ' + (sel.status === 'Activo' ? 'badge--green' : 'badge--red')}><span className={'dot ' + (sel.status === 'Activo' ? 'dot--green' : 'dot--red')} />{sel.status}</span></div>
            </div>
          ) : <div className="empty">Selecciona un proveedor de la lista.</div>}
        </div>
      </div>

      {editing && <SupplierForm initial={editing === 'new' ? null : editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ===================== USUARIOS (roles y permisos) ===================== */
function UserForm({ onSave, onClose }) {
  const [f, setF] = useState({ nombre: '', apellido: '', email: '', phone: '', role: 'cajero', password: '' });
  const [touched, setTouched] = useState({});
  const set = (k) => (v) => setF(s => ({ ...s, [k]: v }));
  const errs = { nombre: V.name(f.nombre), apellido: V.name(f.apellido), email: V.email(f.email), phone: V.phone(f.phone), password: V.password(f.password) };
  const valid = Object.values(errs).every(e => !e);
  const show = (k) => touched[k] ? errs[k] : '';

  return (
    <Modal lg title="Nuevo Usuario" onClose={onClose} footer={
      <React.Fragment>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn--primary" onClick={() => { setTouched({ nombre: 1, apellido: 1, email: 1, phone: 1, password: 1 }); if (valid) onSave(f); }}>Crear Usuario</button>
      </React.Fragment>
    }>
      <div className="form-grid">
        <Field label="Nombre" required error={show('nombre')}><input className="input" value={f.nombre} onChange={e => set('nombre')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, nombre: 1 }))} /></Field>
        <Field label="Apellido" required error={show('apellido')}><input className="input" value={f.apellido} onChange={e => set('apellido')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, apellido: 1 }))} /></Field>
        <Field label="Correo electrónico" required error={show('email')}><input className="input" value={f.email} onChange={e => set('email')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, email: 1 }))} placeholder="usuario@laesquina.pe" /></Field>
        <Field label="Celular" required error={show('phone')} hint="9 dígitos."><input className="input" value={f.phone} onChange={e => set('phone')(e.target.value.replace(/\D/g, '').slice(0, 9))} onBlur={() => setTouched(t => ({ ...t, phone: 1 }))} inputMode="numeric" /></Field>
        <Field label="Rol / Permisos" required><Select value={f.role} onChange={set('role')}><option value="cajero">Cajero — registra ventas, consulta catálogo y alertas</option><option value="admin">Administrador — acceso completo</option></Select></Field>
        <Field label="Contraseña temporal" required error={show('password')}><input className="input" type="password" value={f.password} onChange={e => set('password')(e.target.value)} onBlur={() => setTouched(t => ({ ...t, password: 1 }))} placeholder="Mín. 8, mayúscula, número y símbolo" /></Field>
      </div>
    </Modal>
  );
}

function Usuarios({ users, reload, toast, confirm }) {
  const [adding, setAdding] = useState(false);

  const save = async (f) => {
    try {
      await API.crearUsuario(f);
      toast(`Usuario ${f.nombre} creado como ${f.role === 'admin' ? 'Administrador' : 'Cajero'}.`);
      setAdding(false);
      await reload();
    } catch (err) { toast(err.mensaje || err.message, 'err'); }
  };
  const toggle = async (u) => {
    try { await API.cambiarEstadoUsuario(u.dbId, u.status !== 'Activo'); await reload(); }
    catch (err) { toast(err.mensaje || err.message, 'err'); }
  };
  const changeRole = (u, role) => confirm({
    title: 'Cambiar rol',
    message: `¿Cambiar el rol de ${u.nombre} ${u.apellido} a ${role === 'admin' ? 'Administrador' : 'Cajero'}?`,
    confirmLabel: 'Cambiar rol',
    onConfirm: async () => {
      try { await API.cambiarRolUsuario(u.dbId, role); toast('Rol actualizado.'); await reload(); }
      catch (err) { toast(err.mensaje || err.message, 'err'); }
    }
  });

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="head-row">
        <div><h1 className="page-title">Usuarios y Permisos</h1><p className="page-sub">Gestiona las cuentas y el rol de acceso de cada usuario.</p></div>
        <button className="btn btn--primary" onClick={() => setAdding(true)}>{I.plus()} Nuevo Usuario</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Usuario</th><th>Correo</th><th>Celular</th><th>Rol</th><th>Estado</th><th>Registro</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="t-strong">{u.nombre} {u.apellido}</td>
                  <td className="muted">{u.email}</td>
                  <td className="muted">{u.phone}</td>
                  <td><span className={'badge ' + (u.role === 'admin' ? 'badge--muted' : 'badge--green')}>{u.role === 'admin' ? 'Administrador' : 'Cajero'}</span></td>
                  <td><span className={'badge ' + (u.status === 'Activo' ? 'badge--green' : 'badge--red')}><span className={'dot ' + (u.status === 'Activo' ? 'dot--green' : 'dot--red')} />{u.status}</span></td>
                  <td className="muted">{u.created}</td>
                  <td>
                    <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                      <select className="select" style={{ width: 'auto', padding: '6px 8px', fontSize: 12 }} value={u.role} onChange={e => changeRole(u, e.target.value)}>
                        <option value="cajero">Cajero</option><option value="admin">Admin</option>
                      </select>
                      <button className="btn btn--sm" onClick={() => toggle(u)}>{u.status === 'Activo' ? 'Desactivar' : 'Activar'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 10 }}>Matriz de permisos</div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Acción</th><th style={{ textAlign: 'center' }}>Administrador</th><th style={{ textAlign: 'center' }}>Cajero</th></tr></thead>
            <tbody>
              {[
                ['Registrar ventas (salida de stock)', 1, 1],
                ['Consultar catálogo de productos', 1, 1],
                ['Ver alertas de stock y caducidad', 1, 1],
                ['Gestionar productos y movimientos', 1, 0],
                ['Gestionar proveedores', 1, 0],
                ['Ver reportes', 1, 0],
                ['Gestionar usuarios y permisos', 1, 0],
              ].map((r, i) => (
                <tr key={i}><td>{r[0]}</td>
                  <td style={{ textAlign: 'center', color: 'var(--green)' }}>{r[1] ? I.check() : '—'}</td>
                  <td style={{ textAlign: 'center', color: r[2] ? 'var(--green)' : 'var(--ink-3)' }}>{r[2] ? I.check() : I.x({ width: 14, height: 14 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {adding && <UserForm onSave={save} onClose={() => setAdding(false)} />}
    </div>
  );
}

/* ===================== ALERTAS ===================== */
function Alertas({ products }) {
  const active = products;
  const low = active.filter(p => p.stock <= p.min).sort((a, b) => a.stock / a.min - b.stock / b.min);
  const exp = active.filter(p => { const d = daysUntil(p.expiry); return d >= 0 && d <= 30; }).sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry));

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div><h1 className="page-title">Alertas</h1><p className="page-sub">Stock mínimo y productos próximos a vencer.</p></div>

      <div className="card">
        <div className="section-title" style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--red)', marginBottom: 14 }}>{I.warn({ width: 16, height: 16 })} Stock Bajo ({low.length})</div>
        {low.length ? low.map(p => (
          <div className="list-item" key={p.id}>
            <div><div className="t-strong">{p.name}</div><div className="muted" style={{ fontSize: 12 }}>{p.id} · {p.cat}</div></div>
            <div style={{ textAlign: 'right' }}><div className="stock-low">Stock: {p.stock}</div><div className="muted" style={{ fontSize: 12 }}>Mínimo: {p.min}</div></div>
          </div>
        )) : <div className="empty">Sin productos en stock bajo.</div>}
      </div>

      <div className="card">
        <div className="section-title" style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--amber)', marginBottom: 14 }}>{I.clock({ width: 16, height: 16 })} Próximos a Vencer ({exp.length})</div>
        {exp.length ? exp.map(p => {
          const d = daysUntil(p.expiry);
          return (
            <div className="list-item" key={p.id}>
              <div><div className="t-strong">{p.name}</div><div className="muted" style={{ fontSize: 12 }}>{p.id} · {p.cat}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ color: 'var(--amber)', fontWeight: 600 }}>Vence: {p.expiry}</div><div className="muted" style={{ fontSize: 12 }}>{d} día{d !== 1 ? 's' : ''} restantes</div></div>
            </div>
          );
        }) : <div className="empty">Sin productos próximos a vencer.</div>}
      </div>
    </div>
  );
}

Object.assign(window, { Proveedores, SupplierForm, Usuarios, UserForm, Alertas });
