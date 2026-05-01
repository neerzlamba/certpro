function getSession() {
  return JSON.parse(localStorage.getItem('session')) || null;
}

function login(email, password) {
  const users = getAll('users');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return false;
  if (user.status === 'blocked') return 'blocked';
  
  const session = {
    userId: user.id,
    role: user.role,
    universityId: user.universityId,
    loginTime: new Date().toISOString()
  };
  localStorage.setItem('session', JSON.stringify(session));
  return user.role;
}

function logout() {
  localStorage.removeItem('session');
  window.location.href = '../portal.html?tab=login';
}

function requireRole(role) {
  const session = getSession();
  if (!session) { 
    window.location.href = '../portal.html?tab=login'; 
    return null; 
  }
  if (role && session.role !== role) { 
    window.location.href = '../portal.html?tab=login'; 
    return null; 
  }
  return session;
}

function requireRoles(rolesArray) {
  const session = getSession();
  if (!session) { 
    window.location.href = '../portal.html?tab=login'; 
    return null; 
  }
  if (!rolesArray.includes(session.role)) { 
    window.location.href = '../portal.html?tab=login'; 
    return null; 
  }
  return session;
}

function hasPermission(permissionNode) {
  const session = getSession();
  if (!session) return false;
  if (session.role === 'superadmin') return true;

  // Default permission sets — VERSIONED so upgrades auto-apply
  const PERM_VERSION = 'v11';
  const DEFAULTS = {
    admin: [
      // Certificates
      'approve_cert','revoke_cert','create_cert','edit_cert','delete_cert','view_all_certs',
      // Requests
      'approve_request','reject_request','forward_request','view_all_reqs',
      // People
      'manage_staff','manage_students','block_user','delete_user','reset_password',
      // Settings
      'manage_courses','manage_cert_types','manage_unis'
    ],
    staff: [
      'forward_request','view_all_reqs'
    ],
    student: [
      'request_cert'
    ]
  };

  const storedVersion = localStorage.getItem('roleSettingsVersion');
  let roleSettings = JSON.parse(localStorage.getItem('roleSettings'));

  if (!roleSettings || storedVersion !== PERM_VERSION) {
    // First run or version mismatch — seed defaults, but preserve any manual overrides
    // if they exist and are newer
    roleSettings = DEFAULTS;
    localStorage.setItem('roleSettings', JSON.stringify(roleSettings));
    localStorage.setItem('roleSettingsVersion', PERM_VERSION);
  }

  return roleSettings[session.role] ? roleSettings[session.role].includes(permissionNode) : false;
}
