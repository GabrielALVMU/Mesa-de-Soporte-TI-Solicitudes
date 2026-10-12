import express from 'express';
import cors from 'cors';
import db from './db.js';

const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Crítica'];
const ESTADOS = ['Nuevo', 'En proceso', 'Resuelto', 'Cerrado'];

const app = express();
app.use(cors());
app.use(express.json());

const SELECT_TICKETS = `
  SELECT t.id, t.solicitante, t.titulo, t.descripcion, t.prioridad, t.estado,
         t.fecha_creacion, t.categoria_id, c.nombre AS categoria,
         t.responsable_id, u.nombre AS responsable
  FROM tickets t
  JOIN categorias c ON c.id = t.categoria_id
  LEFT JOIN usuarios u ON u.id = t.responsable_id`;

const texto = (v) => (typeof v === 'string' ? v.trim() : '');

app.get('/api/categorias', (_req, res) => {
  res.json(db.prepare('SELECT id, nombre FROM categorias ORDER BY nombre').all());
});

app.get('/api/usuarios', (_req, res) => {
  res.json(db.prepare('SELECT id, nombre FROM usuarios ORDER BY nombre').all());
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////3
app.get('/api/tickets', (req, res) => {
  const categoriaId = req.query.categoria_id;
  const sql = `${SELECT_TICKETS}${categoriaId ? ' WHERE t.categoria_id = ?' : ''} ORDER BY t.id DESC`;

  if (categoriaId === undefined) {
    return res.json(db.prepare(sql).all());
  }

  const categoriaNum = Number(categoriaId);
  if (!Number.isInteger(categoriaNum) || categoriaNum <= 0) {
    return res.status(400).json({ errores: ['Categoría no válida.'] });
  }

  res.json(db.prepare(sql).all(categoriaNum));
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////1///////////2
app.post('/api/tickets', (req, res) => {
  const solicitante = texto(req.body.solicitante);
  const titulo = texto(req.body.titulo);
  const descripcion = texto(req.body.descripcion);
  const categoriaId = Number(req.body.categoria_id);
  const prioridad = req.body.prioridad;

  const errores = [];
  if (solicitante.length < 3) errores.push('El solicitante debe tener al menos 3 caracteres.');
  if (titulo.length < 5) errores.push('El título debe tener al menos 5 caracteres.');
  if (titulo.length > 100) errores.push('El título no puede superar los 100 caracteres.');
  if (descripcion.length < 10) errores.push('La descripción debe tener al menos 10 caracteres.');
  if (!db.prepare('SELECT 1 FROM categorias WHERE id = ?').get(categoriaId)) {
    errores.push('Selecciona una categoría válida.');
  }
  if (!PRIORIDADES.includes(prioridad)) errores.push('Selecciona una prioridad válida.');
  if (errores.length) return res.status(400).json({ errores });

  const info = db
    .prepare(
      `INSERT INTO tickets (solicitante, titulo, descripcion, categoria_id, prioridad)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(solicitante, titulo, descripcion, categoriaId, prioridad);

  res.status(201).json(db.prepare(`${SELECT_TICKETS} WHERE t.id = ?`).get(info.lastInsertRowid));
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4
app.patch('/api/tickets/:id', (req, res) => {
  const id = Number(req.params.id);
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
  if (!ticket) return res.status(404).json({ errores: ['La solicitud no existe.'] });

  const cambios = [];
  const errores = [];
  const nombreUsuario = (uid) =>
    uid ? db.prepare('SELECT nombre FROM usuarios WHERE id = ?').get(uid)?.nombre : null;

  if ('estado' in req.body) {
    if (!ESTADOS.includes(req.body.estado)) errores.push('Estado no válido.');
    else if (req.body.estado !== ticket.estado) {
      cambios.push({
        campo: 'estado', col: 'estado', valor: req.body.estado,
        anterior: ticket.estado, nuevo: req.body.estado,
      });
    }
  }

  if ('responsable_id' in req.body) {
    const nuevoId =
      req.body.responsable_id === null || req.body.responsable_id === ''
        ? null
        : Number(req.body.responsable_id);
    if (nuevoId !== null && !nombreUsuario(nuevoId)) errores.push('Responsable no válido.');
    else if (nuevoId !== ticket.responsable_id) {
      cambios.push({
        campo: 'responsable', col: 'responsable_id', valor: nuevoId,
        anterior: nombreUsuario(ticket.responsable_id) ?? 'Sin asignar',
        nuevo: nombreUsuario(nuevoId) ?? 'Sin asignar',
      });
    }
  }

  if (errores.length) return res.status(400).json({ errores });

  db.transaction(() => {
    for (const c of cambios) {
      db.prepare(`UPDATE tickets SET ${c.col} = ? WHERE id = ?`).run(c.valor, id);
      db.prepare(
        `INSERT INTO historial_cambios (ticket_id, campo, valor_anterior, valor_nuevo)
         VALUES (?, ?, ?, ?)`
      ).run(id, c.campo, c.anterior, c.nuevo);
    }
  })();

  res.json(db.prepare(`${SELECT_TICKETS} WHERE t.id = ?`).get(id));
});

app.get('/api/tickets/:id/historial', (req, res) => {
  res.json(
    db.prepare('SELECT * FROM historial_cambios WHERE ticket_id = ? ORDER BY id DESC')
      .all(Number(req.params.id))
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API Mesa de Soporte en http://localhost:${PORT}`));
