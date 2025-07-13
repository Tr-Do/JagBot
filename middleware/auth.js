import { isTokenValid } from '../redis.js';

export default async function (req, res, next) {
    let token = null;

    if (req.query.token) {
        token = req.query.token;
    } else if (req.headers['authorization']) {
        token = req.headers['authorization'].replace('Bearer ', '')
    }

    if (!token) return res.status(401).send('Access required');

    const valid = await isTokenValid(token);
    if (!valid) return res.status(401).send('Invalid or expired token');

    next()
};