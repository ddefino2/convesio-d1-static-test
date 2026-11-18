export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/d1' && request.method === 'POST') {
      const db = env.DB;

      if (!db) {
        return Response.json(
          { ok: false, error: 'Missing D1 binding: expected env.DB.' },
          { status: 500 },
        );
      }

      try {
        // db.exec() splits its input on newlines to find statement boundaries
        // rather than parsing SQL, so a statement formatted across multiple
        // lines becomes several incomplete "statements" and fails with
        // SQLITE_ERROR. prepare().run() takes the whole string as one
        // statement and isn't affected by internal newlines.
        await db.prepare(`
          CREATE TABLE IF NOT EXISTS d1_test_markers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL
          )
        `).run();

        const createdAt = new Date().toISOString();
        await db.prepare('INSERT INTO d1_test_markers (created_at) VALUES (?)').bind(createdAt).run();
        const summary = await db.prepare('SELECT COUNT(*) AS count, MAX(created_at) AS latest FROM d1_test_markers').first();

        return Response.json({ ok: true, inserted_at: createdAt, ...summary });
      } catch (err) {
        // Surface the real D1 error instead of letting it bubble up uncaught —
        // an uncaught exception here gets swallowed by the dispatch worker's
        // catch-all into a generic "Service Unavailable" page with no detail.
        return Response.json(
          { ok: false, error: 'D1 operation failed', message: err && err.message, stack: err && err.stack },
          { status: 500 },
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
