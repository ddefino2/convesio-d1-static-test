export async function onRequestPost(context) {
  const db = context.env.DB;

  if (!db) {
    return Response.json(
      { ok: false, error: 'Missing D1 binding: expected context.env.DB.' },
      { status: 500 },
    );
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS d1_test_markers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL
    );
  `);

  const createdAt = new Date().toISOString();
  await db.prepare('INSERT INTO d1_test_markers (created_at) VALUES (?)').bind(createdAt).run();
  const summary = await db.prepare('SELECT COUNT(*) AS count, MAX(created_at) AS latest FROM d1_test_markers').first();

  return Response.json({ ok: true, inserted_at: createdAt, ...summary });
}
