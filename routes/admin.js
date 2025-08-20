import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

router.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    if (password === process.env.ADMIN_PASSWORD) {
        res.cookie('admin', '1', {
            httpOnly: true,
            signed: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 12 * 60 * 60 * 1000
        });
        return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ error: 'Unauthorized' });
})

function requireAdmin(req, res, next) {
    if (req.signedCookies.admin === '1') return next();
    res.sendStatus(401);
}

router.get('/api/fallbacks', requireAdmin, async (req, res) => {
    let q = null;
    if (typeof req.query.q === 'string' && req.query.q.trim() !== '') {
        q = req.query.q.trim();
    }

    let from = null;
    if (typeof req.query.from === 'string' && req.query.from.trim() !== '') {
        from = req.query.from;
    }
    let to = null;
    if (typeof req.query.to === 'string' && req.query.to.trim() !== '') {
        to = req.query.to;
    }

    let limit = parseInt(req.query.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 50;
    if (limit > 500) limit = 500;

    let offset = parseInt(req.query.offset, 10);
    if (!Number.isFinite(offset) || offset < 0) offset = 0;

    const sql = `
    SELECT question, answer, created_at
    FROM fallback_log
    WHERE ($1::text         IS NULL OR question ILIKE '%'||$1||'%' OR answer ILIKE '%'||$1||'%')
       AND ($2::timestamptz IS NULL OR created_at >= $2)
       AND ($3::timestamptz IS NULL OR created_at <= $3)
    ORDER BY created_at DESC
    LIMIT $4 OFFSET $5
    `;

    try {
        const result = await pool.query(sql, [q, from, to, limit, offset]);
        res.json({
            items: result.rows,
            pagination: { limit, offset, count: result.rows.length }
        });
    } catch (err) {
        console.error('DB ERROR:', err);
        res.status(500).json({ error: 'DB query failed' });
    }
});


export default router;