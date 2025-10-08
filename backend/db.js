import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('db.sqlite');

export function initDB() {
  if (fs.existsSync('models.sql')) {
    const sql = fs.readFileSync('models.sql', 'utf8');
    db.exec(sql);
  }
  return db;
}

export default db;
