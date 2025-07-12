const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.post('/chat', authMiddleware, async (req, res) => {
    res.send({ reply: "Please wait..." })
});

module.exports = router;