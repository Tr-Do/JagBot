document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const fallback = document.getElementById('fb');
    const database = document.getElementById('db');
    const change = document.getElementById('change');

    if (!change || !fallback || !database || !content) {
        console.error('Admin UI: missing elements'); return;
    }
    let authed = false;
    async function ensureAuth() {
        if (authed) return;
        const pwd = prompt('Admin password:');
        const r = await fetch('/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ password: pwd })
        });
        if (!r.ok) throw new Error('Login failed');
        authed = true;
    }
    fallback.addEventListener('click', async () => {
        content.innerHTML = '<p>Loading fallback questions…</p>';
        try {
            await ensureAuth();
            const r = await fetch('/api/fallbacks', { credentials: 'include' });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const data = await r.json();
            content.innerHTML = renderFallbackTable(data);
        } catch (e) {
            console.error(e);
            content.innerHTML = '<p>Failed to load fallback.</p>';
        }
    });

    database.addEventListener('click', () => {
        content.textContent = 'Database view not implemented';
    });
    change.addEventListener('click', () => {
        content.textContent = 'Change log not implemented';
    });
});

function renderFallbackTable(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return '<p>No fallback questions logged.</p>';
    }

    const escapeHTML = (v) =>
        String(v).replace(/[&<>"']/g, ch => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]));

    let rows = '';
    for (const item of items) {
        const question = escapeHTML(item.question ?? '');
        const answer = escapeHTML(item.answer ?? '');
        const t = item.timestamp ?? item.time ?? null;
        const timeStr = t ? new Date(t).toLocaleString() : '-';
        rows += `
      <tr>
        <td>${question}</td>
        <td>${answer}</td>
        <td>${timeStr}</td>
      </tr>`;
    }

    return `
    <table border="1" cellspacing="0" cellpadding="8">
      <thead>
        <tr><th>Question</th><th>Answer</th><th>Time</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
