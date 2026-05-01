// Basic Language Storage Engine (v9_Basic)
const Storage = {
    keys: {
        users: 'gvcs_v9_users',
        universities: 'gvcs_v9_universities',
        students: 'gvcs_v9_students',
        certificates: 'gvcs_v9_certificates',
        courses: 'gvcs_v9_courses',
        requests: 'gvcs_v9_requests',
        activity: 'gvcs_v9_activity',
        session: 'gvcs_v9_session'
    },

    // 1. Initial State with Indian Mock Data
    init() {
        if (!localStorage.getItem(this.keys.users)) {
            const data = {
                users: [
                    { id: 'ADM001', email: 'superadmin@gvcs.in', password: 'Password123', name: 'Global SuperAdmin', role: 'superadmin', universityId: 'UNI001', status: 'active' },
                    { id: 'ADM002', email: 'admin@iitb.ac.in', password: 'Password123', name: 'IITB Registrar', role: 'admin', universityId: 'UNI001', status: 'active' },
                    { id: 'STF001', email: 'staff@du.ac.in', password: 'Password123', name: 'DU Staff', role: 'staff', universityId: 'UNI002', status: 'active' },
                    { id: 'STU001', email: 'aryan.sharma@student.in', password: 'Password123', name: 'Aryan Sharma', role: 'student', universityId: 'UNI001', status: 'active' }
                ],
                universities: [
                    { id: 'UNI001', name: 'Indian Institute of Technology Bombay', code: 'IITB', status: 'active', contact_email: 'admin@iitb.ac.in', location: 'Mumbai' },
                    { id: 'UNI002', name: 'University of Delhi', code: 'DU', status: 'active', contact_email: 'admin@du.ac.in', location: 'New Delhi' },
                    { id: 'UNI003', name: 'Anna University', code: 'AU', status: 'active', contact_email: 'admin@annauniv.edu', location: 'Chennai' }
                ],
                students: [
                    { id: '2026IITB101', name: 'Aryan Sharma', fatherName: 'Rajesh Sharma', email: 'aryan.sharma@student.in', phone: '9876543210', courseId: 'CRS001', universityId: 'UNI001', program: 'B.Tech Computer Science' },
                    { id: '2026DU505', name: 'Priya Patel', fatherName: 'Suresh Patel', email: 'priya.patel@student.in', phone: '8765432109', courseId: 'CRS003', universityId: 'UNI002', program: 'B.Com Honors' }
                ],
                courses: [
                    { id: 'CRS001', name: 'B.Tech Computer Science', duration: '4 Years', universityId: 'UNI001', code: 'CS101' },
                    { id: 'CRS002', name: 'M.Tech Data Science', duration: '2 Years', universityId: 'UNI001', code: 'DS202' },
                    { id: 'CRS003', name: 'B.Com Honors', duration: '3 Years', universityId: 'UNI002', code: 'COM303' }
                ],
                certificates: [
                    { id: 'CERT-IITB-88209', student_id: '2026IITB101', studentName: 'Aryan Sharma', university_id: 'UNI001', universityName: 'IIT Bombay', title: 'B.Tech Computer Science', issue_date: '15/01/2026', status: 'issued', visible: true }
                ],
                requests: [],
                activity: []
            };
            Object.keys(this.keys).forEach(k => { if(data[k]) localStorage.setItem(this.keys[k], JSON.stringify(data[k])); });
            this.logActivity('SYSTEM_START', 'Global Admin');
        }
    },

    // 2. Core CRUD Logic
    get(key) {
        const item = localStorage.getItem(this.keys[key] || key);
        return item ? JSON.parse(item) : [];
    },

    save(key, data) {
        localStorage.setItem(this.keys[key] || key, JSON.stringify(data));
    },

    addItem(key, data) {
        const items = this.get(key);
        items.unshift({ ...data, created_at: new Date().toISOString() });
        this.save(key, items);
        this.logActivity(`ADD_${key.toUpperCase()}`, data.id || 'Entry Added');
    },

    updateItem(key, id, newData) {
        let items = this.get(key);
        items = items.map(i => (i.id === id || i.email === id) ? { ...i, ...newData, updated_at: new Date().toISOString() } : i);
        this.save(key, items);
        this.logActivity(`UPDATE_${key.toUpperCase()}`, id);
    },

    deleteItem(key, id) {
        let items = this.get(key);
        items = items.filter(i => (i.id !== id && i.email !== id));
        this.save(key, items);
        this.logActivity(`DELETE_${key.toUpperCase()}`, id);
    },

    // 3. User Session
    getActiveUser() {
        const u = localStorage.getItem(this.keys.session);
        return u ? JSON.parse(u) : null;
    },

    setActiveUser(u) {
        localStorage.setItem(this.keys.session, JSON.stringify(u));
    },

    logout() {
        localStorage.removeItem(this.keys.session);
        window.location.href = 'index.html';
    },

    // 4. Simple Utils & Toasts
    generateId(prefix) {
        const year = new Date().getFullYear();
        return `${year}${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    },

    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    },

    logActivity(action, targetId) {
        const user = this.getActiveUser();
        const logs = this.get('activity');
        logs.unshift({ user: user?.email || 'System', action, target: targetId, timestamp: new Date().toISOString() });
        this.save('activity', logs.slice(0, 50));
    },

    toast(msg, type = 'success') {
        const t = document.createElement('div');
        t.style = `position:fixed; top:20px; right:20px; background:${type === 'success' ? '#2563eb' : '#ef4444'}; color:#fff; padding:15px 25px; font-size:12px; font-weight:800; z-index:9999; box-shadow:10px 10px 0 #000; border:1px solid #000; display:flex; align-items:center;`;
        t.innerHTML = `${type === 'success' ? '✓' : '✖'} &nbsp; ${msg.toUpperCase()}`;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = '0.5s'; setTimeout(() => t.remove(), 500); }, 3000);
    },

    validate(data, fields = []) {
        for (const f of fields) {
            if (!data[f] || data[f].trim() === '') return { ok: false, msg: `PLEASE FILL ${f.toUpperCase()}` };
            if (f === 'email' && !/^\S+@\S+\.\S+$/.test(data[f])) return { ok: false, msg: 'EMAIL FORMAT IS WRONG' };
            if (f === 'phone' && !/^[6-9]\d{9}$/.test(data[f])) return { ok: false, msg: 'MOBILE NUMBER MUST BE 10 DIGITS' };
            if (f === 'aadhaarRef' && !/^\d{4}$/.test(data[f])) return { ok: false, msg: 'AADHAAR REF MUST BE 4 DIGITS' };
        }
        return { ok: true };
    }
};

Storage.init();
