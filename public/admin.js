// Invoke function to enforce authentication before page access
(async function enforceAdminAuth() {
    const authed = sessionStorage.getItem('admin_auth');
    if (authed === 'true') return;

    const pw = prompt('Enter admin password');
    const res = await fetch('/api/admin/login', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
    });
    if (!res.ok) {
        alert('Unauthorized. Redirecting...');
        location.href = '/';
    } else {
        sessionStorage.setItem('admin_auth', 'true');
    }
})();

document.getElementById('studentId').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        generateToken();
    }
})
async function generateToken() {
    const studentId = document.getElementById('studentId').value.trim().toUpperCase();
    const output = document.getElementById('newToken');
    const studentIdPattern = /^[JK]\d{8}$/;
    if (!studentIdPattern.test(studentId)) {
        output.textContent = 'Error: Invalid Student ID';
        return;
    }
    try {
        const res = await fetch('/api/token/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId })
        });
        const data = await res.json();
        if (!res.ok) {
            output.textContent = `Error: ${data.error || 'Token generation failed'}`;
        } else {
            output.textContent = `Token ${data.token}`;
            loadToken();
        }
    } catch (err) {
        output.textContent = 'Request failed';
    }
}

function isExpired(createdAt) {
    return Date.now() - createdAt > 30 * 60 * 1000;
}

async function loadToken() {
    const res = await fetch('/api/token/list');
    const data = await res.json();
    const table = document.getElementById('tokenTable');
    table.innerHTML = '';

    data.forEach(t => {
        const expired = Date.now() - t.createdAt > 30 * 60 * 1000;

        let status;
        let statusClass;

        if (t.revoked) {
            status = "Revoked";
            statusClass = "status-revoked";
        } else if (isExpired(t.createdAt)) {
            status = "Expired";
            statusClass = "status-expired";
        } else {
            status = "Active";
            statusClass = "status-active";
        }

        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${t.studentId}</td>
                <td>${t.token}</td>
                <td class="${statusClass}">${status}</td>
                <td>${status === 'Active' ? `<button onclick="revokeToken('${t.token}')">Revoke</button>` : ''}</td>
                <td>${new Date(t.createdAt).toLocaleString()}</td>
            `
        table.appendChild(row);
    });
}

async function revokeToken(token) {
    await fetch('/api/token/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    loadToken();
}
window.onload = loadToken;