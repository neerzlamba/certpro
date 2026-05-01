// Simple Language Dashboard Engine (v9_Basic)
window.loadModule = (id) => { if (typeof _renderModule === 'function') _renderModule(id); };

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Identity
    const user = Storage.getActiveUser();
    if (!user) { window.location.href = 'index.html'; return; }
    
    document.getElementById('activeUserEmail').textContent = user.email;
    document.getElementById('activeUserRole').textContent = user.role.toUpperCase();

    // 2. Simple Role-Based Menu (Indian Local English)
    const roleConfig = {
        superadmin: { menu: [
            { id: 'overview', name: 'System Summary' },
            { id: 'universities', name: 'All Universities' },
            { id: 'users', name: 'Admin Users' },
            { id: 'approvals', name: 'Waiting List' },
            { id: 'activity', name: 'Action History' }
        ]},
        admin: { menu: [
            { id: 'overview', name: 'University Home' },
            { id: 'students', name: 'All Students' },
            { id: 'staff', name: 'Our Staff' },
            { id: 'courses', name: 'Degrees / Courses' },
            { id: 'issue', name: 'Issue Certificate' },
            { id: 'requests', name: 'Student Requests' }
        ]},
        staff: { menu: [
            { id: 'overview', name: 'Work Area' },
            { id: 'issue_stf', name: 'Make Draft Cert' },
            { id: 'students', name: 'Find Student' },
            { id: 'certificates', name: 'Certificates List' }
        ]},
        student: { menu: [
            { id: 'certificates', name: 'My Certificates' },
            { id: 'requests', name: 'Apply for Cert' },
            { id: 'profile', name: 'My Bio Profile' }
        ]}
    };

    const nav = document.getElementById('navMenu');
    nav.innerHTML = roleConfig[user.role].menu.map(m => `
        <a href="#" class="nav-link" data-id="${m.id}" onclick="loadModule('${m.id}')">${m.name}</a>
    `).join('');

    // --- ANALYTICS DASHBOARD (SIMPLE NAMES) ---
    function renderOverview() {
        const stats = [
            { label: 'Total Universities', val: Storage.get('universities').length },
            { label: 'Students Registered', val: Storage.get('students').length },
            { label: 'Certificates Issued', val: Storage.get('certificates').length }
        ];

        document.getElementById('moduleContainer').innerHTML = `
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:40px; margin-bottom:80px;">
                ${stats.map(s => `<div class="stat-box"><p class="label">${s.label}</p><p class="stat-value mono">${s.val}</p></div>`).join('')}
            </div>
            <div style="margin-top:60px;">
                <p class="label">RECENT ACTIVITY HISTORY</p>
                <div style="font-size:12px;">${Storage.get('activity').slice(0, 5).map(l => `<div style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;"><span>${new Date(l.timestamp).toLocaleTimeString()}</span><strong style="text-transform:uppercase; font-size:10px;">${l.action}</strong><span class="mono" style="opacity:0.6;">by ${l.user}</span></div>`).join('') || '<p>No activity yet.</p>'}</div>
            </div>
        `;
    }

    // --- SIMPLE GRID TABLES ---
    function renderList(key, labels, filter = {}) {
        let items = Storage.get(key);
        if (filter.role) items = items.filter(i => i.role === filter.role);
        if (user.role !== 'superadmin' && key !== 'universities') {
            items = items.filter(i => (i.universityId === user.universityId || i.id === user.id));
        }

        document.getElementById('moduleContainer').innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
                <input type="text" placeholder="Type here to search..." id="tableSearch" onkeyup="filterTable(this)" style="padding:15px; border:1px solid var(--border); width:320px; font-family:'IBM Plex Sans';">
                ${user.role !== 'staff' && user.role !== 'student' ? `<button class="btn btn-primary" onclick="openCRUD('${key}')">ADD NEW ${key.toUpperCase().slice(0,-1)}</button>` : ''}
            </div>
            <table>
                <thead><tr>${labels.map(l => `<th>${l}</th>`).join('')}<th>ACTION</th></tr></thead>
                <tbody id="tableBody">${items.length ? items.map(i => `<tr>
                    ${labels.map(l => `<td class="${l === 'ID' || l === 'ENROLLMENT' ? 'mono' : ''}">${i[l.toLowerCase()] || i.id || '-'}</td>`).join('')}
                    <td><div style="display:flex; gap:10px;">
                        <button class="btn btn-outline" style="padding:6px 12px; font-size:10px;" onclick="openCRUD('${key}', '${i.id || i.email}')">EDIT</button>
                        ${user.role !== 'staff' ? `<button class="btn btn-outline" style="padding:6px 12px; font-size:10px; border-color:var(--status-revoked); color:var(--status-revoked);" onclick="deleteAction('${key}', '${i.id || i.email}')">DELETE</button>` : ''}
                    </div></td>
                </tr>`).join('') : '<tr><td colspan="100%" style="text-align:center; padding:100px; opacity:0.3; font-weight:800;">DATA LIST IS EMPTY</td></tr>'}</tbody>
            </table>
        `;
    }

    window.filterTable = (input) => { 
        const val = input.value.toLowerCase();
        document.querySelectorAll('#tableBody tr').forEach(tr => tr.style.display = tr.textContent.toLowerCase().includes(val) ? '' : 'none');
    };

    // --- SIMPLE FORM FIELDS ---
    window.openCRUD = (key, editId = null) => {
        const item = editId ? Storage.get(key).find(i => (i.id === editId || i.email === editId)) : null;
        document.getElementById('modalTitle').textContent = editId ? `Update ${key}` : `Enter Details: ${key}`;
        
        let html = `<div class="form-container" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">`;
        if (key === 'universities') {
            html += `<div class="form-group"><label class="label">UNIVERSITY NAME</label><input type="text" name="name" value="${item?.name || ''}"></div>
                     <div class="form-group"><label class="label">UNIQUE CODE</label><input type="text" name="code" value="${item?.code || ''}"></div>`;
        } else {
            html += `<div class="form-group"><label class="label">FULL NAME</label><input type="text" name="name" value="${item?.name || ''}"></div>
                     <div class="form-group"><label class="label">EMAIL ID</label><input type="email" name="email" value="${item?.email || ''}"></div>`;
        }
        if (key === 'students') {
            html += `<div class="form-group"><label class="label">FATHER'S NAME</label><input type="text" name="fatherName" value="${item?.fatherName || ''}"></div>
                     <div class="form-group"><label class="label">MOBILE NO.</label><input type="text" name="phone" value="${item?.phone || ''}"></div>
                     <div class="form-group"><label class="label">AADHAAR (LAST 4 DIGITS)</label><input type="text" name="aadhaarRef" value="${item?.aadhaarRef || ''}" maxlength="4"></div>
                     <div class="form-group"><label class="label">JOINING YEAR</label><input type="text" name="admissionYear" value="${item?.admissionYear || '2026'}"></div>`;
        }
        if (key === 'users') html += `<div class="form-group"><label class="label">SET PASSWORD</label><input type="text" name="password" value="${item?.password || 'Password123'}"></div>`;
        html += `</div>`;

        document.getElementById('modalBody').innerHTML = html;
        document.getElementById('modalOverlay').style.display = 'flex';
        
        document.getElementById('modalSubmitBtn').onclick = () => {
            const formData = Object.fromEntries(new Array(...document.querySelectorAll('#modalBody input')).map(i => [i.name, i.value]));
            const v = Storage.validate(formData, key === 'universities' ? ['name','code'] : (key === 'students' ? ['name','email','phone','aadhaarRef'] : ['name','email']));
            if (!v.ok) { Storage.toast(v.msg, 'error'); return; }

            if (editId) Storage.updateItem(key, editId, formData);
            else {
                formData.id = Storage.generateId(key.substring(0,3).toUpperCase());
                if (key === 'users') formData.role = 'admin';
                formData.universityId = user.universityId;
                Storage.addItem(key, formData);
            }
            Storage.toast('Entry Saved Successfully', 'success'); document.getElementById('modalOverlay').style.display = 'none';
            _renderModule(key);
        };
    };

    // --- CERTIFICATE MODULES ---
    function renderCerts() {
        let certs = Storage.get('certificates');
        if (user.role === 'student') certs = certs.filter(c => c.student_id === user.id);
        else if (user.role !== 'superadmin') certs = certs.filter(c => c.university_id === user.universityId);

        document.getElementById('moduleContainer').innerHTML = `
            <table><thead><tr><th>ROLL_NO</th><th>STUDENT_NAME</th><th>DEGREE_NAME</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
            <tbody>${certs.map(c => `<tr><td class="mono">${c.id}</td><td>${c.studentName}</td><td>${c.title}</td><td><span class="badge badge-valid">VERIFIED ✓</span></td><td><div style="display:flex; gap:10px;"><a href="certificate.html?id=${c.id}" class="btn btn-outline" style="padding:6px 12px; font-size:10px;">OPEN CERTIFICATE</a></div></td></tr>`).join('')}</tbody>
            </table>
        `;
    }

    // --- SIMPLE ROUTER ---
    window._renderModule = (id) => {
        document.querySelectorAll('.nav-link').forEach(i => i.classList.toggle('active', i.getAttribute('data-id') === id));
        document.getElementById('pageTitle').textContent = id.toUpperCase().replace(/_/g, ' ');
        
        switch (id) {
            case 'overview': renderOverview(); break;
            case 'universities': renderList('universities', ['ID','NAME','CODE']); break;
            case 'users': renderList('users', ['ID','NAME','EMAIL','ROLE']); break;
            case 'students': renderList('students', ['ID','NAME','EMAIL','PHONE','PROGRAM']); break;
            case 'staff': renderList('users', ['ID','NAME','EMAIL','STATUS'], { role: 'staff' }); break;
            case 'courses': renderList('courses', ['ID','NAME','CODE']); break;
            case 'certificates': renderCerts(); break;
            case 'activity': renderList('activity', ['TIMESTAMP','ACTION','USER']); break;
            default: document.getElementById('moduleContainer').innerHTML = `<div style="padding:100px; text-align:center; border:1px solid var(--border); opacity:0.3; letter-spacing:0.2em;">COMING_SOON</div>`;
        }
    }

    document.getElementById('modalCancelBtn').onclick = () => { document.getElementById('modalOverlay').style.display = 'none'; };
    window.deleteAction = (k, id) => { if (confirm('Clear Record Permanentally for: ${id}?')) { Storage.deleteItem(k, id); _renderModule(k); } };

    // Initial Load
    loadModule('overview');
});
