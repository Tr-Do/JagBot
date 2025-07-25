import redis from 'redis'
const client = redis.createClient();
client.connect();   // Establish connection for token operation execution

// Token is 5 uppercase letters for quick manual entry
// Redis gives auto expiration (30 min) and fast in-memory lookup via setEx
// Metadata supports revocation, timestamp check, and user tracking
async function generateToken(studentId = '') {
    const chars = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    let token = '';
    for (let i = 0; i < 5; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const meta = JSON.stringify({ studentId, createdAt: Date.now(), revoked: false });
    await client.setEx(`token:${token}`, 1800, meta);
    return token;
}

// Redis checks if the token is valid, it has value of 1, if not, value of 0
async function isTokenValid(token) {
    const result = await client.exists(`token:${token}`);
    return result === 1;
}

// Mark token as revoked
// Reset its TTL to 30 min to distinguish from expired tokens
async function revokeToken(token) {
    const val = await client.get(`token:${token}`);
    if (!val) return;
    const parsed = JSON.parse(val);
    parsed.revoked = true;
    await client.setEx(`token:${token}`, 1800, JSON.stringify(parsed));
}

// Retrieve all tokens from Redis
// Extract token IDs and sort them by creation time for admin review
async function listToken() {
    const keys = await client.keys('token:*');
    const results = [];
    for (const key of keys) {
        const raw = await client.get(key);
        const data = JSON.parse(raw);
        results.push({ token: key.split(':')[1], ...data });
    }
    results.sort((a, b) => b.createdAt - a.createdAt);
    return results;
}

export { generateToken, isTokenValid, revokeToken, listToken };