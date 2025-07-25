import express from 'express';
const router = express.Router();
import { generateToken, isTokenValid, revokeToken, listToken } from '../redis.js';
const rateLimit = new Map();


// GET-based token validation (5 attempts/IP) to prevent abuse (Block 1 hour if exceeded)
router.get('/token/validate', async (req, res) => {
    const { token } = req.query;
    const ip = req.ip;

    const now = Date.now();
    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 0, firstFail: now, blockUntil: null });
    }
    const attempt = rateLimit.get(ip);

    if (attempt.count >= 5 && now < attempt.blockUntil) {
        return res.status(429).send('Too many attempts. Try 1 hour later');
    }
    const valid = await isTokenValid(token);
    if (!valid) {
        attempt.count++;
        if (attempt.count >= 5) {
            attempt.blockUntil = now + 3600000; // block 1 hour
        }
        rateLimit.set(ip, attempt);
        return res.status(401).send('Invalid Token');
    }

    // Reset attempt when validation is successful
    rateLimit.set(ip, { count: 0, firstFail: null, blockUntil: null });
    return res.status(200).send('Valid');
});

// POST-based token validation for client scripts and frontend
router.post('/token/validate', async (req, res) => {
    const { token } = req.body;
    if (!token || typeof token != 'string' || token.length !== 5) {
        return res.status(400).json({ error: 'Invalid token' });
    }
    try {
        const valid = await isTokenValid(token);
        if (!valid) {
            return res.status(401).json({ valid: false });
        }
        return res.status(200).json({ valid: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal error' });
    }
});

// Generate new token if student ID matches pattern
router.post('/token/generate', async (req, res) => {
    const { studentId } = req.body;
    const idPattern = /^[JK]\d{8}$/i;
    if (!idPattern.test(studentId.trim())) {
        return res.status(400).json({ error: 'Invalid student ID format' })
    }
    const token = await generateToken(studentId);
    res.json({ token });
});

router.get('/token/list', async (req, res) => {
    const data = await listToken();
    res.json(data);
})

router.post('/token/revoke', async (req, res) => {
    const { token } = req.body;
    await revokeToken(token);
    res.status(200).send('Revoked');
});

export default router;