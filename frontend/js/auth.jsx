/* ============================================================
   auth.jsx — Login y Registro con validaciones
   ============================================================ */

function AuthShell({ children }) {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, letterSpacing: 1, opacity: .6, marginBottom: 18 }}>MINIMARKET</div>
          <h1>La Esquina</h1>
          <p>Sistema de inventario y punto de venta. Control de stock en tiempo real, alertas y reportes.</p>
        </div>
        <div>
          {[
            { i: 'box',   t: 'Control de stock automático y trazable' },
            { i: 'bell',  t: 'Alertas de stock mínimo y caducidad' },
            { i: 'lock',  t: 'Acceso por rol: Administrador y Cajero' },
          ].map((f, k) => (
            <div className="auth__feature" key={k}>
              <span style={{ opacity: .85, marginTop: 1 }}>{I[f.i]({ width: 18, height: 18 })}</span>
              <span>{f.t}</span>
            </div>
          ))}
        </div>
      </aside>
      <main className="auth__main">
        <div className="auth__card">{children}</div>
      </main>
    </div>
  );
}

/* ---------- Login ---------- */
function Login({ onLogin, goRegister, toast }) {
  const [user, setUser] = useState('admin@laesquina.pe');
  const [pass, setPass] = useState('Admin123!');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const errUser = touched && !user.trim() ? 'Ingresa tu usuario o correo.' : '';
  const errPass = touched && !pass ? 'Ingresa tu contraseña.' : '';

  const doLogin = async (correo, password) => {
    setBusy(true);
    try {
      const u = await API.login(correo, password);
      await onLogin(u);
    } catch (err) {
      toast(err.mensaje || err.message || 'No se pudo iniciar sesión.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!user.trim() || !pass) return;
    doLogin(user.trim(), pass);
  };

  // Accesos de demostración (usuarios semilla de la base de datos).
  const demo = (role) => {
    if (role === 'admin') doLogin('admin@laesquina.pe', 'Admin123!');
    else doLogin('maria@laesquina.pe', 'Cajero123!');
  };

  return (
    <AuthShell>
      <h2>Iniciar sesión</h2>
      <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Ingresa tus credenciales para continuar.</p>
      <form onSubmit={submit} style={{ marginTop: 22 }}>
        <Field label="Usuario o correo" required error={errUser}>
          <TextInput value={user} onChange={setUser} placeholder="usuario@dominio.com" />
        </Field>
        <Field label="Contraseña" required error={errPass}>
          <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
        </Field>
        <button className="btn btn--primary btn--block" type="submit" style={{ marginTop: 4 }} disabled={busy}>{busy ? 'Ingresando…' : 'Iniciar Sesión'}</button>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button type="button" className="link-btn" onClick={() => toast('Te enviamos un enlace de recuperación a tu correo.', 'ok')}>¿Olvidaste tu contraseña?</button>
        </div>
      </form>

      <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
        <div className="field-hint" style={{ marginBottom: 8 }}>Acceso rápido de demostración:</div>
        <div className="demo-switch">
          <button className="btn btn--sm" onClick={() => demo('admin')} disabled={busy}>{I.lock({ width: 14, height: 14 })} Entrar como Admin</button>
          <button className="btn btn--sm" onClick={() => demo('cajero')} disabled={busy}>{I.cart({ width: 14, height: 14 })} Entrar como Cajero</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: 'var(--ink-2)' }}>
          ¿No tienes cuenta? <button className="link-btn" onClick={goRegister}>Crear cuenta</button>
        </div>
      </div>
    </AuthShell>
  );
}

/* ---------- Registro ---------- */
function Registro({ goLogin, toast }) {
  const [f, setF] = useState({ nombre: '', apellido: '', email: '', phone: '', password: '', confirm: '', role: 'cajero' });
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF(s => ({ ...s, [k]: v }));
  const blur = (k) => () => setTouched(t => ({ ...t, [k]: true }));

  const errs = {
    nombre: V.name(f.nombre),
    apellido: V.name(f.apellido),
    email: V.email(f.email),
    phone: V.phone(f.phone),
    password: V.password(f.password),
    confirm: f.confirm !== f.password ? 'Las contraseñas no coinciden.' : (!f.confirm ? 'Confirma tu contraseña.' : ''),
  };
  const show = (k) => touched[k] ? errs[k] : '';
  const valid = Object.values(errs).every(e => !e);
  const strength = passwordStrength(f.password);
  const strengthLabel = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'][strength];
  const strengthColor = ['var(--red)', 'var(--red)', 'var(--amber)', 'var(--green)', 'var(--green)'][strength];

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ nombre: 1, apellido: 1, email: 1, phone: 1, password: 1, confirm: 1 });
    if (!valid) return;
    setBusy(true);
    try {
      await API.registro(f);
      toast(`Cuenta creada para ${f.nombre}. Ya puedes iniciar sesión.`, 'ok');
      goLogin();
    } catch (err) {
      // Si el backend devuelve errores por campo (ej. correo repetido), muéstralos.
      if (err.errores) setTouched({ nombre: 1, apellido: 1, email: 1, phone: 1, password: 1, confirm: 1 });
      toast(err.mensaje || err.message || 'No se pudo crear la cuenta.', 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h2>Crear cuenta</h2>
      <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Completa tus datos. Los campos marcados con * son obligatorios.</p>
      <form onSubmit={submit} style={{ marginTop: 20 }}>
        <div className="form-grid">
          <Field label="Nombre" required error={show('nombre')}>
            <input className="input" value={f.nombre} onChange={e => set('nombre')(e.target.value)} onBlur={blur('nombre')} placeholder="Ej. Lucía" />
          </Field>
          <Field label="Apellido" required error={show('apellido')}>
            <input className="input" value={f.apellido} onChange={e => set('apellido')(e.target.value)} onBlur={blur('apellido')} placeholder="Ej. Ramírez" />
          </Field>
        </div>
        <Field label="Correo electrónico" required error={show('email')}>
          <input className="input" value={f.email} onChange={e => set('email')(e.target.value)} onBlur={blur('email')} placeholder="usuario@dominio.com" />
        </Field>
        <Field label="Número de celular" required error={show('phone')} hint="Exactamente 9 dígitos.">
          <input className="input" value={f.phone} onChange={e => set('phone')(e.target.value.replace(/\D/g, '').slice(0, 9))} onBlur={blur('phone')} placeholder="9XX XXX XXX" inputMode="numeric" />
        </Field>
        <Field label="Contraseña" required error={show('password')}>
          <input className="input" type="password" value={f.password} onChange={e => set('password')(e.target.value)} onBlur={blur('password')} placeholder="Mínimo 8 caracteres" />
        </Field>
        {f.password && (
          <div style={{ marginTop: -8, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 3, background: i < strength ? strengthColor : 'var(--line)' }} />
              ))}
            </div>
            <div style={{ fontSize: 11, marginTop: 5, color: strengthColor }}>Seguridad: {strengthLabel} · 1 mayúscula, 1 número y 1 carácter especial.</div>
          </div>
        )}
        <Field label="Confirmar contraseña" required error={show('confirm')}>
          <input className="input" type="password" value={f.confirm} onChange={e => set('confirm')(e.target.value)} onBlur={blur('confirm')} placeholder="Repite tu contraseña" />
        </Field>
        <Field label="Perfil de acceso">
          <Select value={f.role} onChange={set('role')}>
            <option value="cajero">Cajero</option>
            <option value="admin">Administrador</option>
          </Select>
        </Field>
        <button className="btn btn--primary btn--block" type="submit" style={{ marginTop: 4 }} disabled={busy}>{busy ? 'Creando cuenta…' : 'Registrarme'}</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: 'var(--ink-2)' }}>
        ¿Ya tienes cuenta? <button className="link-btn" onClick={goLogin}>Iniciar sesión</button>
      </div>
    </AuthShell>
  );
}

Object.assign(window, { Login, Registro, AuthShell });
