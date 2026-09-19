// Repositorio "demo" en memoria. Solo se usa en Vercel sin BD real.
// Permite que el jefe navegue toda la UI: login acepta cualquier PIN,
// hay un turno abierto sintético, la lista de tickets/colores está
// hardcodeada. Los writes responden OK pero no persisten — al ser
// serverless en cold start se reinicia el estado.

const TICKETS = [
  { id: 'extranjero', nombre: 'Extranjero',        tipo_visitante: 'adulto', precio: 350, color_brazalete: 'rojo',    prefijo: 'EXT',  activo: true },
  { id: 'nacional',   nombre: 'Nacional',          tipo_visitante: 'adulto', precio: 250, color_brazalete: 'azul',    prefijo: 'NCNL', activo: true },
  { id: 'agencia',    nombre: 'Agencia',           tipo_visitante: 'adulto', precio: 200, color_brazalete: 'naranja', prefijo: 'AGNC', activo: true },
  { id: 'nino',       nombre: 'Niño',              tipo_visitante: 'niño',   precio: 150, color_brazalete: 'rosa',    prefijo: 'NÑ',   activo: true },
  { id: 'local',      nombre: 'Local / Tulumense', tipo_visitante: 'local',  precio: 100, color_brazalete: 'verde',   prefijo: 'LOCAL',activo: true },
  { id: 'apnea',      nombre: 'Apnea',             tipo_visitante: 'adulto', precio: 300, color_brazalete: 'amarillo',prefijo: 'APNA', activo: true },
  { id: 'buzos',      nombre: 'Buzos',             tipo_visitante: 'adulto', precio: 350, color_brazalete: 'morado',  prefijo: 'BUZO', activo: true },
  { id: 'cortesia',   nombre: 'Cortesía',          tipo_visitante: 'adulto', precio: 0,   color_brazalete: 'blanco',  prefijo: 'CRT',  activo: false },
  { id: 'agencia_local',   nombre: 'Agencia Local',   tipo_visitante: 'local',  precio: 200, color_brazalete: 'naranja_local',   prefijo: 'AGNL', activo: true },
  { id: 'agencia_general', nombre: 'Agencia General', tipo_visitante: 'adulto', precio: 250, color_brazalete: 'naranja_general', prefijo: 'AGNG', activo: true }
];

const COLORS = TICKETS.filter((t) => t.activo && t.id !== 'agencia').map((t) => ({
  color: t.color_brazalete,
  stock_total: 100,
  vendidos: 0,
  disponible: 100,
  adentro: 0,
  ultima_recarga: null
}));

function svcInv(servicio_id, nombre, precio, stock_total) {
  return {
    servicio_id, nombre, precio, stock_total,
    stock_almacen: stock_total, stock_caja: stock_total, vendidos: 0,
    en_almacen: 0, disponible: stock_total,
    folio_inicio: null, folio_fin: null, operador: null, actualizado_en: null
  };
}
const SERVICIOS_INVENTARIO = [
  svcInv('kayak', 'Kayak', 200, 10),
  svcInv('paddle', 'Padel', 200, 10),
  svcInv('dron', 'Dron', 250, 1),
  svcInv('nevera', 'Nevera', 100, 5)
];

const USERS = [
  { usuario: 'admin',  rol: 'admin',  activo: true },
  { usuario: 'cajera', rol: 'cajera', activo: true }
];

function fakeShift() {
  return {
    id: 1,
    operador_apertura: 'admin',
    fondo_inicial: 1000,
    tipo_cambio_usd: 18,
    abierto_en: Date.now(),
    cerrado_en: null,
    estado: 'abierto'
  };
}

function createDemoRepository() {
  return {
    login: async ({ usuario }) => ({ usuario: usuario || 'admin', rol: 'admin' }),
    cambiarPin: async () => ({ ok: true }),

    listarUsuarios: async () => USERS,
    crearUsuario: async ({ usuario, rol }) => ({ usuario, rol, activo: true }),
    editarUsuario: async ({ usuario }) => ({ usuario }),
    eliminarUsuario: async (usuario) => ({ usuario, eliminado: true }),
    desactivarUsuario: async (usuario) => ({ usuario, activo: false }),
    activarUsuario: async (usuario) => ({ usuario, activo: true }),

    listarTickets: async () => TICKETS.filter((t) => t.activo),
    obtenerInventarioColores: async () => COLORS,
    recargarStock: async ({ color, folio_inicio, folio_fin }) => {
      const fi = Number(folio_inicio) || 0;
      const ff = Number(folio_fin) || 0;
      const n = ff >= fi ? ff - fi + 1 : 0;
      return { color, agregado: n, folio_inicio: fi, folio_fin: ff, nuevo_stock_total: 100 + n };
    },
    editarUltimaRecarga: async ({ color, folio_inicio, folio_fin }) => {
      const fi = Number(folio_inicio) || 0;
      const ff = Number(folio_fin) || 0;
      return { color, folio_inicio: fi, folio_fin: ff, cantidad: ff >= fi ? ff - fi + 1 : 0 };
    },

    obtenerTurnoAbierto: async () => fakeShift(),
    abrirTurno: async () => fakeShift(),
    cerrarTurno: async () => ({ ...fakeShift(), cerrado_en: Date.now(), estado: 'cerrado', efectivo_esperado: 0, efectivo_contado: 0, diferencia: 0 }),
    listarTurnosCerrados: async () => [],
    listarVentas: async () => [],
    obtenerVentaDetalle: async () => ({ venta: null, folios: [], pagos: [] }),

    crearVenta: async ({ items = [], pagos = [] }) => ({
      venta: { id: Date.now(), total: items.reduce((s, i) => s + (Number(i.precio) || 0) * (Number(i.cantidad) || 0), 0) },
      brazaletes: items.map((i, idx) => ({ folio: 'DEMO-' + idx, color: 'verde', estado: 'adentro' })),
      pagos
    }),
    registrarMovimientoCaja: async ({ tipo, monto, concepto }) => ({
      movimiento: { id: Date.now(), tipo, monto: Number(monto) || 0, concepto, timestamp: Date.now() }
    }),

    obtenerCorte: async () => ({
      turno: fakeShift(),
      operaciones: { ventas_cobradas: 0, monto_cobrado: 0, ticket_promedio: 0, duracion_ms: 0 },
      por_metodo: {},
      brazaletes_por_tipo: [],
      movimientos_caja: [],
      depositos: 0,
      retiros: 0,
      efectivo_esperado: 1000,
      usd_esperado: 0,
      cortesias: { cantidad: 0, valor_comercial: 0 },
      total_ventas: 0
    }),
    obtenerDashboard: async () => ({
      hoy: { ventas: 0, brazaletes: 0, ingresos: 0 },
      turno: fakeShift(),
      adentro_ahora: 0
    }),
    obtenerHistorialTurno: async () => [],
    obtenerCorteDeTurno: async () => ({ turno: fakeShift(), operaciones: {}, por_metodo: {}, brazaletes_por_tipo: [], movimientos_caja: [] }),

    cargaStockDirecto: async ({ color, cantidad }) => ({ color, cargado: Number(cantidad) || 0, stock_caja: 100, stock_total: 100 }),
    obtenerInventarioServicios: async () => SERVICIOS_INVENTARIO,
    actualizarInventarioServicio: async ({ servicio_id, stock_total, folio_inicio, folio_fin }) => {
      const item = SERVICIOS_INVENTARIO.find((s) => s.servicio_id === servicio_id);
      if (!item) throw Object.assign(new Error(`El servicio "${servicio_id}" no existe en el inventario.`), { status: 404 });
      const total = Math.round(Number(stock_total)) || 0;
      item.stock_total = total;
      item.stock_almacen = total;
      item.stock_caja = total;
      item.vendidos = 0;
      item.en_almacen = 0;
      item.disponible = total;
      item.folio_inicio = folio_inicio || null;
      item.folio_fin = folio_fin || null;
      item.actualizado_en = Date.now();
      return item;
    },
    recargarStockServicio: async ({ servicio_id, folio_inicio, folio_fin }) => {
      const item = SERVICIOS_INVENTARIO.find((s) => s.servicio_id === servicio_id);
      if (!item) throw Object.assign(new Error(`El servicio "${servicio_id}" no existe en el inventario.`), { status: 404 });
      const fi = Number(folio_inicio) || 0;
      const ff = Number(folio_fin) || 0;
      const n = ff >= fi ? ff - fi + 1 : 0;
      item.stock_total += n;
      item.stock_almacen += n;
      item.stock_caja += n;
      item.en_almacen = 0;
      item.disponible = item.stock_caja - item.vendidos;
      item.folio_inicio = folio_inicio || null;
      item.folio_fin = folio_fin || null;
      item.actualizado_en = Date.now();
      return item;
    },
    getConfig: () => null,
    setConfig: () => {}
  };
}

module.exports = { createDemoRepository };
