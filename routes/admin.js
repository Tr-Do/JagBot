import express from 'express';
const router = express.Router();

router.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    if (password === process.env.ADMIN_PASSWORD) {
        return res.status(200).json({ ok: true });
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
})
export default router;