import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(dir, '..', 'database');

const db = new Database(path.join(dbDir, 'mesa_soporte.db'));
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(dbDir, 'schema.sql'), 'utf8'));

const columnasTickets = db.pragma('table_info(tickets)');
if (!columnasTickets.some(({ name }) => name === 'solicitante')) {
  db.exec("ALTER TABLE tickets ADD COLUMN solicitante TEXT NOT NULL DEFAULT ''");
}

export default db;
