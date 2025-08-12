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
    if (password === process.env.ADMIN_PASSWORD) return res.status(200).json({ ok: true });
    return res.status(401).json({ error: 'Unauthorized' });
})

router.get('/api/fallbacks', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT question, answer, 'timestamp' AS time
            FROM fallback_log
            ORDER BY 'timestamp' DESC
            LIMIT 200
            `);
        res.json(rows);
    } catch (err) {
        console.error('DB ERROR:', err);
        res.status(500).json({ error: "DB failed" });
    }
});


export default router;