import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

// Minimal D1 stand-in over node:sqlite.
export function d1() {
  const db = new DatabaseSync(':memory:');
  db.exec(fs.readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  return {
    prepare(sql) {
      const q = sql.replace(/\?(\d+)/g, ':p$1');
      let params = {};
      const stmt = {
        bind(...a) { params = {}; a.forEach((v, i) => { if (q.includes(`:p${i + 1}`)) params[`p${i + 1}`] = v; }); return stmt; },
        async first() { return db.prepare(q).get(params) ?? null; },
        async run() { const r = db.prepare(q).run(params); return { meta: { changes: Number(r.changes) } }; },
      };
      return stmt;
    },
  };
}
