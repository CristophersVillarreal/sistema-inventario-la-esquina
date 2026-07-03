/* ============================================================
   ui.jsx — Iconos, primitivos y estructura (shell)
   ============================================================ */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------- Iconos (line icons simples) ---------- */
const I = {
  grid:   (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  box:    (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>,
  swap:   (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8"/></svg>,
  truck:  (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 9h4l3 3v5h-7zM6 20a2 2 0 100-4 2 2 0 000 4zM18 20a2 2 0 100-4 2 2 0 000 4z"/></svg>,
  receipt:(p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1z"/><path d="M9 8h6M9 12h6"/></svg>,
  bell:   (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>,
  file:   (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>,
  users:  (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0116 11"/></svg>,
  search: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  plus:   (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  edit:   (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z"/></svg>,
  trash:  (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>,
  eye:    (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
  archive:(p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a1 1 0 001 1h14a1 1 0 001-1V8M10 12h4"/></svg>,
  logout: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  warn:   (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M10.3 3.9 1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01"/></svg>,
  clock:  (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  check:  (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...p}><path d="M20 6 9 17l-5-5"/></svg>,
  x:      (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  cart:   (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/></svg>,
  arrow:  (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  back:   (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  menu:   (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  money:  (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg>,
  trophy: (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M6 9a6 6 0 0012 0V3H6zM6 5H3v2a3 3 0 003 3M18 5h3v2a3 3 0 01-3 3M9 21h6M12 17v4"/></svg>,
  cal:    (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  trend:  (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M22 7 13.5 15.5l-5-5L2 17M16 7h6v6"/></svg>,
  down:   (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>,
  up:     (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  lock:   (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
};

/* ---------- Field con validación ---------- */
function Field({ label, required, error, hint, children }) {
  return (
    <div className={'field' + (error ? ' field--error' : '')}>
      {label && <label className="label">{label}{required && <span className="req"> *</span>}</label>}
      {children}
      {error
        ? <div className="field-error">{I.warn({ width: 12, height: 12 })}{error}</div>
        : hint ? <div className="field-hint">{hint}</div> : null}
    </div>
  );
}

function TextInput({ value, onChange, ...rest }) {
  return <input className="input" value={value} onChange={e => onChange(e.target.value)} {...rest} />;
}
function Select({ value, onChange, children, ...rest }) {
  return <select className="select" value={value} onChange={e => onChange(e.target.value)} {...rest}>{children}</select>;
}

/* ---------- Modal ---------- */
function Modal({ title, onClose, children, footer, lg }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className={'modal' + (lg ? ' modal--lg' : '')} onMouseDown={e => e.stopPropagation()}>
        <div className="modal__head">
          <div className="modal__title">{title}</div>
          <button className="icon-btn icon-btn--bare" onClick={onClose}>{I.x()}</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Toasts ---------- */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };
  const node = (
    <div className="toasts">
      {toasts.map(t => (
        <div key={t.id} className={'toast toast--' + t.kind}>
          {t.kind === 'err' ? I.warn({ width: 16, height: 16 }) : I.check()}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
  return { push, node };
}

/* ---------- Confirm dialog ---------- */
function Confirm({ data, onClose }) {
  if (!data) return null;
  return (
    <Modal title={data.title} onClose={onClose} footer={
      <React.Fragment>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className={'btn ' + (data.danger ? 'btn--danger' : 'btn--primary')} onClick={() => { data.onConfirm(); onClose(); }}>
          {data.confirmLabel || 'Confirmar'}
        </button>
      </React.Fragment>
    }>
      <p className="muted" style={{ margin: 0 }}>{data.message}</p>
    </Modal>
  );
}

/* ---------- Sidebar + shell ---------- */
const NAV_ADMIN = [
  { key: 'dashboard',  label: 'Dashboard',       icon: 'grid' },
  { key: 'productos',  label: 'Productos',        icon: 'box' },
  { key: 'inventario', label: 'Inventario',       icon: 'swap' },
  { key: 'proveedores',label: 'Proveedores',      icon: 'truck' },
  { key: 'ventas',     label: 'Ventas (Salida)',  icon: 'receipt' },
  { key: 'alertas',    label: 'Alertas',          icon: 'bell' },
  { key: 'reportes',   label: 'Reportes',         icon: 'file' },
  { key: 'usuarios',   label: 'Usuarios',         icon: 'users' },
];
const NAV_CAJERO = [
  { key: 'ventas',    label: 'Registrar Venta', icon: 'cart' },
  { key: 'catalogo',  label: 'Catálogo',        icon: 'box' },
  { key: 'alertas',   label: 'Alertas',         icon: 'bell' },
];

function Sidebar({ role, screen, go, open, setOpen }) {
  const nav = role === 'admin' ? NAV_ADMIN : NAV_CAJERO;
  return (
    <React.Fragment>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={'sidebar' + (open ? ' sidebar--open' : '')}>
        <div className="sidebar__brand">
          <b>La Esquina</b>
          <span>Sistema de Inventario</span>
        </div>
        <div className="sidebar__role">
          {role === 'admin' ? I.lock({ width: 14, height: 14 }) : I.cart({ width: 14, height: 14 })}
          Perfil: {role === 'admin' ? 'Administrador' : 'Cajero'}
        </div>
        <nav className="nav">
          <div className="nav__label">{role === 'admin' ? 'Gestión' : 'Operación'}</div>
          {nav.map(n => (
            <button key={n.key}
              className={'nav__item' + (screen === n.key ? ' nav__item--active' : '')}
              onClick={() => { go(n.key); setOpen(false); }}>
              {I[n.icon]()}{n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar__foot">v1.0 · Minimarket "La Esquina"</div>
      </aside>
    </React.Fragment>
  );
}

function Topbar({ page, user, onLogout, onMenu }) {
  return (
    <header className="topbar">
      <button className="hamburger" onClick={onMenu}>{I.menu()}</button>
      <span className="topbar__brand">La Esquina</span>
      <span className="topbar__sep">—</span>
      <span className="topbar__page">{page}</span>
      <span className="topbar__spacer" />
      <span className="topbar__user">Usuario: <b>{user.nombre} {user.apellido}</b> · {user.role === 'admin' ? 'Admin' : 'Cajero'}</span>
      <button className="btn btn--sm" onClick={onLogout}>{I.logout()}<span className="hide-sm">Salir</span></button>
    </header>
  );
}

Object.assign(window, { I, Field, TextInput, Select, Modal, useToasts, Confirm, Sidebar, Topbar, NAV_ADMIN, NAV_CAJERO });
