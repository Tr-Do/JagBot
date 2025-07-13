import express from 'express';
const router = express.Router();
import authMiddleware from '../middleware/auth.js';

router.post('/chat', authMiddleware, async (req, res) => {
    res.send({ reply: "Please wait..." })
});

export default router;