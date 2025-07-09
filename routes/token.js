const express = require('express');
const router = express.Router();
const { generateToken } = require('../redis');

router.get('/generate-token', async (req, res) => {
    try {
        const token = await generateToken();
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Token generation failed', detail: err.message })
    }
});

module.exports = router;