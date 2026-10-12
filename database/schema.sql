
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre  TEXT NOT NULL,
  email   TEXT NOT NULL UNIQUE,
  rol     TEXT NOT NULL DEFAULT 'Responsable'
);

CREATE TABLE IF NOT EXISTS categorias (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre  TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tickets (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,      
  solicitante     TEXT NOT NULL DEFAULT '',
  titulo          TEXT NOT NULL,
  descripcion     TEXT NOT NULL,
  categoria_id    INTEGER NOT NULL REFERENCES categorias(id),
  prioridad       TEXT NOT NULL CHECK (prioridad IN ('Baja','Media','Alta','Crítica')),
  estado          TEXT NOT NULL DEFAULT 'Nuevo'
                  CHECK (estado IN ('Nuevo','En proceso','Resuelto','Cerrado')),
  responsable_id  INTEGER REFERENCES usuarios(id),
  fecha_creacion  TEXT NOT NULL DEFAULT (datetime('now','localtime'))  -- RF-02
);

CREATE TABLE IF NOT EXISTS historial_cambios (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id       INTEGER NOT NULL REFERENCES tickets(id),
  campo           TEXT NOT NULL,
  valor_anterior  TEXT,
  valor_nuevo     TEXT,
  fecha           TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

INSERT OR IGNORE INTO categorias (nombre) VALUES
  ('Hardware'), ('Software'), ('Redes'), ('Accesos y cuentas'), ('Otro');

INSERT OR IGNORE INTO usuarios (nombre, email, rol) VALUES
  ('Integrante A', 'a@mesa.local', 'Responsable'),
  ('Integrante B', 'b@mesa.local', 'Responsable'),
  ('Integrante C', 'c@mesa.local', 'Responsable');
