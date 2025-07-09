const redis = require('redis');
const { randomBytes } = require('crypto');

const client = redis.createClient();
client.connect();

async function generateToken() {
    const token = randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    await client.setEx(`token:${token}`, 1800, 'valid');
    return token;
}

async function isTokenValid(token) {
    const result = await client.exists(`token:${token}`);
    return result === 1;
}

module.exports = { generateToken, isTokenValid };