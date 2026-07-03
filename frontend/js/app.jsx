/* ============================================================
   app.jsx — App principal: estado, ruteo y control por rol
   Conectada a la API (Node/Express + MySQL).
   ============================================================ */

function App() {
  const [auth, setAuth] = useState('login'); // 'login' | 'registro' | 'app'
  const [booting, setBooting] = useState(true); // restaurando sesión al cargar
  const [role, setRole] = useState('admin');
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('dashboard');
  const [navOpen, setNavOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [moves, setMoves] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { push: toast, node: toastNode } = useToasts();
  const [confirmData, setConfirmData] = useState(null);
  const confirm = (data) => setConfirmData(data);

  // Ventas = movimientos de salida con método de pago, con total calculado por precio actual.
  const sales = useMemo(() => {
    const priceByCode = {};
    products.forEach((p) => { priceByCode[p.id] = p.price; });
    return moves
      .filter((m) => m.type === 'salida' && m.method && !m.anulado)
      .map((m) => ({
        id: m.id.replace('M-', 'V-'),
        code: m.code,
        name: m.name,
        qty: m.qty,
        total: (priceByCode[m.code] || 0) * m.qty,
        method: m.method ? m.method.charAt(0).toUpperCase() + m.method.slice(1) : '',
        user: m.user,
        client: '—',
        date: m.date,
      }));
  }, [moves, products]);

  /* ---------- Carga de datos desde la API según el rol ---------- */
  const reload = async (forRole) => {
    const r = forRole || role;
    setLoading(true);
    try {
      // El cajero solo puede leer catálogo (productos) y alertas (derivadas de productos).
      const productos = await API.getProductos();
      setProducts(productos);
      if (r === 'admin') {
        const [provs, movs, usrs] = await Promise.all([
          API.getProveedores(),
          API.getMovimientos(),
          API.getUsuarios(),
        ]);
        setSuppliers(provs);
        setMoves(movs);
        setUsers(usrs);
      }
    } catch (e) {
      toast(e.mensaje || e.message || 'No se pudieron cargar los datos.', 'err');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Restaurar sesión al cargar (si hay token guardado) ---------- */
  useEffect(() => {
    (async () => {
      if (API.getToken()) {
        try {
          const u = await API.perfil();
          enterApp(u, false);
        } catch (_) {
          API.logout();
        }
      }
      setBooting(false);
    })();
  }, []);

  const enterApp = async (u, notify = true) => {
    const r = u.role === 'admin' ? 'admin' : 'cajero';
    setUser(u);
    setRole(r);
    setScreen(r === 'admin' ? 'dashboard' : 'ventas');
    setAuth('app');
    if (notify) toast(`Bienvenido(a), ${u.nombre}.`);
    await reload(r);
  };

  const logout = () => {
    API.logout();
    setUser(null);
    setProducts([]); setSuppliers([]); setMoves([]); setUsers([]);
    setAuth('login');
    setNavOpen(false);
  };

  if (booting) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--ink-2)', fontSize: 14 }}>Cargando…</div>;
  }
  if (auth === 'login') {
    return <React.Fragment><Login onLogin={enterApp} goRegister={() => setAuth('registro')} toast={toast} />{toastNode}</React.Fragment>;
  }
  if (auth === 'registro') {
    return <React.Fragment><Registro goLogin={() => setAuth('login')} toast={toast} />{toastNode}</React.Fragment>;
  }

  // Guard: si el rol es cajero, solo permitir pantallas autorizadas
  const allowed = role === 'admin'
    ? ['dashboard', 'productos', 'inventario', 'proveedores', 'ventas', 'alertas', 'reportes', 'usuarios']
    : ['ventas', 'catalogo', 'alertas'];
  const current = allowed.includes(screen) ? screen : allowed[0];

  const PAGE_LABEL = {
    dashboard: 'Dashboard', productos: 'Productos', inventario: 'Inventario', proveedores: 'Proveedores',
    ventas: role === 'admin' ? 'Ventas (Salida)' : 'Registrar Venta', alertas: 'Alertas', reportes: 'Reportes',
    usuarios: 'Usuarios', catalogo: 'Catálogo',
  };

  const render = () => {
    switch (current) {
      case 'dashboard':   return <Dashboard products={products} moves={moves} go={setScreen} />;
      case 'productos':   return <Productos products={products} suppliers={suppliers} reload={reload} toast={toast} confirm={confirm} />;
      case 'inventario':  return <Inventario products={products} suppliers={suppliers} moves={moves} reload={reload} toast={toast} />;
      case 'proveedores': return <Proveedores suppliers={suppliers} reload={reload} toast={toast} confirm={confirm} />;
      case 'ventas':      return <Ventas products={products} sales={sales} reload={reload} user={user} toast={toast} />;
      case 'catalogo':    return <Catalogo products={products} />;
      case 'alertas':     return <Alertas products={products} />;
      case 'reportes':    return <Reportes products={products} moves={moves} sales={sales} toast={toast} />;
      case 'usuarios':    return <Usuarios users={users} reload={reload} toast={toast} confirm={confirm} />;
      default: return null;
    }
  };

  return (
    <div className="app">
      <Sidebar role={role} screen={current} go={setScreen} open={navOpen} setOpen={setNavOpen} />
      <div className="app__main">
        <Topbar page={PAGE_LABEL[current]} user={user} onLogout={logout} onMenu={() => setNavOpen(true)} />
        <div className="content">{render()}</div>
      </div>
      <Confirm data={confirmData} onClose={() => setConfirmData(null)} />
      {toastNode}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
