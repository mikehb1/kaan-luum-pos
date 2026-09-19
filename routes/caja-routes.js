const express = require('express');

function createCajaRouter(repository, opciones = {}) {
  const router = express.Router();
  if (!repository) return router;

  const respaldos = opciones.respaldos || null;
  function disparar(fn) {
    if (!respaldos || !respaldos.enabled) return;
    // Fire-and-forget: no bloqueamos la respuesta HTTP; los errores se loguean.
    setImmediate(() => {
      Promise.resolve().then(fn).catch((err) => console.error('[respaldos] hook falló:', err));
    });
  }

  router.post('/login', async (req, res, next) => {
    try {
      const result = await repository.login({
        usuario: req.body?.usuario,
        pin: req.body?.pin
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.post('/cambiar-pin', async (req, res, next) => {
    try {
      const result = await repository.cambiarPin({
        usuario: req.body?.usuario,
        pinActual: req.body?.pin_actual,
        pinNuevo: req.body?.pin_nuevo
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.get('/usuarios', async (_req, res, next) => {
    try {
      res.json({ success: true, usuarios: await repository.listarUsuarios() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/usuarios', async (req, res, next) => {
    try {
      const usuario = await repository.crearUsuario({
        usuario: req.body?.usuario,
        pin: req.body?.pin,
        rol: req.body?.rol
      });
      res.status(201).json({ success: true, ...usuario });
    } catch (error) {
      next(error);
    }
  });

  router.put('/usuarios/:usuario', async (req, res, next) => {
    try {
      const result = await repository.editarUsuario({
        usuario: req.params.usuario,
        nuevoUsuario: req.body?.usuario,
        nuevoPin: req.body?.pin,
        nuevoRol: req.body?.rol
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/usuarios/:usuario', async (req, res, next) => {
    try {
      const result = await repository.eliminarUsuario(req.params.usuario);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.post('/usuarios/:usuario/desactivar', async (req, res, next) => {
    try {
      const result = await repository.desactivarUsuario(req.params.usuario);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.post('/usuarios/:usuario/activar', async (req, res, next) => {
    try {
      const result = await repository.activarUsuario(req.params.usuario);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.get('/tickets', async (_req, res, next) => {
    try {
      res.json({ success: true, tickets: await repository.listarTickets() });
    } catch (error) {
      next(error);
    }
  });

  router.get('/inventario', async (_req, res, next) => {
    try {
      res.json({ success: true, inventario: await repository.obtenerInventarioColores() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/inventario/recargar', async (req, res, next) => {
    try {
      const result = await repository.recargarStock({
        color: req.body?.color,
        folio_inicio: req.body?.folio_inicio,
        folio_fin: req.body?.folio_fin,
        prefijo: req.body?.prefijo,
        operador: req.body?.operador
      });
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.put('/inventario/recargar', async (req, res, next) => {
    try {
      const result = await repository.editarUltimaRecarga({
        color: req.body?.color,
        folio_inicio: req.body?.folio_inicio,
        folio_fin: req.body?.folio_fin,
        operador: req.body?.operador
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.post('/inventario/carga-directa', async (req, res, next) => {
    try {
      const result = await repository.cargaStockDirecto({
        color: req.body?.color,
        cantidad: req.body?.cantidad,
        operador: req.body?.operador
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.post('/inventario/asignar-caja', async (req, res, next) => {
    try {
      const result = await repository.asignarACaja({
        color: req.body?.color,
        cantidad: req.body?.cantidad,
        operador: req.body?.operador
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.get('/inventario/servicios', async (_req, res, next) => {
    try {
      res.json({ success: true, inventario: await repository.obtenerInventarioServicios() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/inventario/servicios/:id/recargar', async (req, res, next) => {
    try {
      const result = await repository.recargarStockServicio({
        servicio_id: req.params.id,
        folio_inicio: req.body?.folio_inicio,
        folio_fin: req.body?.folio_fin,
        operador: req.body?.operador
      });
      res.status(201).json({ success: true, inventario: result });
    } catch (error) {
      next(error);
    }
  });

  router.put('/inventario/servicios/:id', async (req, res, next) => {
    try {
      const result = await repository.actualizarInventarioServicio({
        servicio_id: req.params.id,
        stock_total: req.body?.stock_total,
        folio_inicio: req.body?.folio_inicio,
        folio_fin: req.body?.folio_fin,
        operador: req.body?.operador
      });
      res.json({ success: true, inventario: result });
    } catch (error) {
      next(error);
    }
  });

  router.get('/folios/disponibilidad', async (req, res, next) => {
    try {
      const result = await repository.consultarDisponibilidad(req.query?.color);
      res.json({ success: true, disponibilidad: result });
    } catch (error) {
      next(error);
    }
  });

  router.get('/folios/arqueo', async (req, res, next) => {
    try {
      const result = await repository.consultarArqueo(req.query?.color);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.get('/turno-activo', async (_req, res, next) => {
    try {
      res.json({ success: true, turno: await repository.obtenerTurnoAbierto() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/turnos/abrir', async (req, res, next) => {
    try {
      const turno = await repository.abrirTurno({
        operador: req.body?.operador,
        fondo_inicial: req.body?.fondo_inicial,
        tipo_cambio_usd: req.body?.tipo_cambio_usd
      });
      disparar(() => respaldos.respaldarDb('apertura'));
      res.status(201).json({ success: true, turno });
    } catch (error) {
      next(error);
    }
  });

  router.post('/turnos/cerrar', async (req, res, next) => {
    try {
      const turno = await repository.cerrarTurno({
        operador: req.body?.operador,
        efectivo_contado: req.body?.efectivo_contado
      });
      disparar(() => {
        respaldos.respaldarDb('cierre');
        respaldos.escribirReporteCorte(turno);
        respaldos.escribirReporteDiario();
      });
      res.json({ success: true, turno });
    } catch (error) {
      next(error);
    }
  });

  router.get('/turnos/cerrados', async (req, res, next) => {
    try {
      const limite = Number(req.query.limite) || 30;
      res.json({ success: true, turnos: await repository.listarTurnosCerrados(limite) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/ventas', async (req, res, next) => {
    try {
      const result = await repository.crearVenta({
        operador: req.body?.operador,
        items: req.body?.items,
        pagos: req.body?.pagos,
        servicios: req.body?.servicios,
        motivo_cortesia: req.body?.motivo_cortesia,
        autorizado_por: req.body?.autorizado_por
      });
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.get('/ventas', async (req, res, next) => {
    try {
      const ventas = await repository.listarVentas({
        turno_id: req.query.turno_id ? Number(req.query.turno_id) : undefined,
        desde: req.query.desde ? Number(req.query.desde) : undefined,
        hasta: req.query.hasta ? Number(req.query.hasta) : undefined,
        limite: req.query.limite ? Number(req.query.limite) : undefined
      });
      res.json({ success: true, ventas });
    } catch (error) {
      next(error);
    }
  });

  router.get('/ventas/:id', async (req, res, next) => {
    try {
      const detalle = await repository.obtenerVentaDetalle(Number(req.params.id));
      res.json({ success: true, ...detalle });
    } catch (error) {
      next(error);
    }
  });

  router.post('/movimientos', async (req, res, next) => {
    try {
      const result = await repository.registrarMovimientoCaja({
        operador: req.body?.operador,
        tipo: req.body?.tipo,
        monto: req.body?.monto,
        concepto: req.body?.concepto
      });
      res.status(201).json({ success: true, movimiento: result.movimiento, corte: result.corte });
    } catch (error) {
      next(error);
    }
  });

  router.get('/corte', async (_req, res, next) => {
    try {
      res.json({ success: true, ...(await repository.obtenerCorte()) });
    } catch (error) {
      next(error);
    }
  });

  router.get('/config/correo', (req, res, next) => {
    try {
      const desde = repository.getConfig('correo_desde') || '';
      const hasta = repository.getConfig('correo_hasta') || '';
      const tienePassword = !!(repository.getConfig('correo_password'));
      res.json({ success: true, desde, hasta, tienePassword });
    } catch (e) { next(e); }
  });

  router.put('/config/correo', (req, res, next) => {
    try {
      const { desde, password, hasta } = req.body || {};
      if (desde !== undefined) repository.setConfig('correo_desde', String(desde).trim());
      if (password !== undefined && String(password).trim() !== '') {
        repository.setConfig('correo_password', String(password).trim());
      }
      if (hasta !== undefined) repository.setConfig('correo_hasta', String(hasta).trim());
      res.json({ success: true });
    } catch (e) { next(e); }
  });

  router.post('/enviar-corte', async (req, res, next) => {
    try {
      const { csv, csvFilename, cuerpo, html, turnoId } = req.body || {};
      const desde = repository.getConfig('correo_desde');
      const password = repository.getConfig('correo_password');
      const hasta = repository.getConfig('correo_hasta');
      if (!desde || !password || !hasta) {
        const err = new Error('Configura el correo primero en Usuarios → Configuración de correo.');
        err.status = 400;
        throw err;
      }
      const { enviarCorreoCorte } = require('../services/mailer');
      await enviarCorreoCorte({
        desde, password, hasta,
        asunto: 'Corte Turno #' + (turnoId || '?') + ' - Laguna Kaan Luum',
        cuerpo: cuerpo || '',
        html: html || undefined,
        csvContent: csv || '',
        csvFilename: csvFilename || 'corte.csv'
      });
      res.json({ success: true, mensaje: 'Correo enviado a ' + hasta });
    } catch (e) { next(e); }
  });

  router.get('/dashboard', async (_req, res, next) => {
    try {
      res.json({ success: true, ...(await repository.obtenerDashboard()) });
    } catch (error) {
      next(error);
    }
  });

  router.get('/historial', async (req, res, next) => {
    try {
      const turnoId = req.query.turno_id ? Number(req.query.turno_id) : undefined;
      const limite = Number(req.query.limite) || 200;
      res.json({
        success: true,
        movimientos: await repository.obtenerHistorialTurno(turnoId, limite)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createCajaRouter };
