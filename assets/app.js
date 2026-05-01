// 0. PAGE LOADER — auto-inject & auto-dismiss
(function() {
  const loader = document.createElement('div');
  loader.id = 'pageLoader';
  loader.className = 'page-loader';
  loader.innerHTML = `
    <div class="loader-logo">CertPro</div>
    <div class="loader-bar-wrap"><div class="loader-bar"></div></div>
    <div class="loader-text">Loading workspace...</div>
  `;
  document.body ? document.body.appendChild(loader) : document.addEventListener('DOMContentLoaded', () => document.body.appendChild(loader));
  
  // Inject Lucide script globally if not present
  if (!document.querySelector('script[src="https://unpkg.com/lucide@latest"]')) {
    const lucideScript = document.createElement('script');
    lucideScript.src = "https://unpkg.com/lucide@latest";
    document.head.appendChild(lucideScript);
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
      if (window.lucide) window.lucide.createIcons();
    }, 350);
  });
})();

function showLoader(msg) {
  let l = document.getElementById('pageLoader');
  if (!l) {
    l = document.createElement('div');
    l.id = 'pageLoader';
    l.className = 'page-loader';
    document.body.appendChild(l);
  }
  l.innerHTML = `
    <div class="loader-logo">CertPro</div>
    <div class="loader-bar-wrap"><div class="loader-bar"></div></div>
    <div class="loader-text">${msg || 'Please wait...'}</div>
  `;
  l.classList.remove('hidden');
}

function hideLoader() {
  const l = document.getElementById('pageLoader');
  if (l) { l.classList.add('hidden'); setTimeout(() => l.remove(), 500); }
}

// 1. TOAST NOTIFICATION
function toast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerText = message;
  container.appendChild(t);
  
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// 2. CONFIRM DELETE
function confirmDelete(message, onConfirm) {
  if (window.confirm(message)) {
    onConfirm();
  }
}

// 3. RENDER TABLE
function renderTable(containerId, headers, rows) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = '<table><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';

  if (rows.length === 0) {
    html += `<tr><td colspan="${headers.length}" style="text-align: center;">No records found</td></tr>`;
  } else {
    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    });
  }

  html += '</tbody></table>';
  container.innerHTML = html;
}

// 4. MODALS
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.style.display = 'flex';
}
function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.style.display = 'none';
}

// 5. FORMATTERS & HELPERS
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN');
}

// --- GLOBAL DB CACHE FOR MASS DATA ---
const dbCache = {};
function getTableCache(table) {
  if (!dbCache[table]) {
    dbCache[table] = JSON.parse(localStorage.getItem(table)) || [];
  }
  return dbCache[table];
}

function getUserName(userId) {
  const table = getTableCache('users');
  const user = table.find(x => x.id === userId);
  return user ? user.name : 'Unknown';
}

function getCourseTypeName(id) {
  const table = getTableCache('courseTypes');
  const ct = table.find(x => x.id === id);
  return ct ? ct.name : 'Unknown';
}

function getCertTypeName(id) {
  const table = getTableCache('certTypes');
  const ct = table.find(x => x.id === id);
  return ct ? ct.name : 'Unknown';
}

function getUniversityName(id) {
  const table = getTableCache('universities');
  const u = table.find(x => x.id === id);
  return u ? u.name : 'Unknown';
}

function getStatusBadge(status) {
  return `<span class="badge badge-${status.toLowerCase()}">${status}</span>`;
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    toast(`Copied: ${text}`, 'success');
  }).catch(() => {
    toast(`Failed to copy`, 'error');
  });
}

// 6. SIDEBAR NAVIGATION RENDERER
function renderNav(role) {
  // Icon map for nav items using Lucide icon names
  const iconMap = {
    'Dashboard':              'layout-dashboard',
    'Universities':           'building-2',
    'Courses':                'book-open',
    'Certificate Templates':  'file-text',
    'All Certificates':       'award',
    'All Requests':           'inbox',
    'User Directory':         'users',
    'Permissions':            'shield',
    'Certificates':           'award',
    'Student Requests':       'inbox',
    'Students':               'graduation-cap',
    'Staff':                  'briefcase',
    'Issue Certificate':      'pen-tool',
    'Forward Requests':       'arrow-right-circle',
    'Certificates Ledger':    'book',
    'My Profile':             'user',
    'My Certificates':        'medal',
    'My Requests':            'file-edit',
    'Home':                   'home',
    'Setup':                  'settings',
    'Records':                'folder-open',
    'Users & Permissions':    'key',
    'Manage':                 'sliders',
    'People':                 'users',
    'Tasks':                  'check-square',
    'Reports & Data':         'bar-chart',
    'Communication & Notes':  'message-square',
    'View Global Statistics': 'globe',
    'Export Reports':         'download',
    'Audit Logs':             'activity',
    'My Activity':            'activity',
    'Send Notifications':     'bell',
    'Notification Inbox':     'bell',
    'Add Internal Remarks':   'message-circle',
    'Report Guidelines':      'book'
  };

  // Helper to resolve URLs based on current page depth
  function resolveUrl(path) {
      if(!path) return '#';
      const depth = (window.location.pathname.split('/').length - 1) - (window.location.pathname.endsWith('/') ? 1 : 0);
      const folders = ['sa', 'admin', 'staff', 'student'];
      const currentFolder = folders.find(f => window.location.pathname.includes('/' + f + '/'));
      return currentFolder ? '../' + path : path;
  }

  const menus = {
    superadmin: [
      { category: 'Home', items: [
        { name: 'Dashboard', url: 'sa/dashboard.html' }
      ]},
      { category: 'Setup', items: [
        { name: 'Universities', url: 'sa/universities.html' },
        { name: 'Cert Types', url: 'sa/cert-types.html' },
        { name: 'Course Master', url: 'sa/courses.html' }
      ]},
      { category: 'Records', items: [
        { name: 'All Certificates', url: 'admin/certificates.html' },
        { name: 'Action Requests', url: 'admin/requests.html' }
      ]},
      { category: 'Users & Permissions', items: [
        { name: 'User Management', url: 'sa/users.html' },
        { name: 'Permissions Settings', url: 'sa/roles.html' }
      ]}
    ],
    admin: [
      { category: 'Home', items: [
        { name: 'Dashboard', url: 'admin/dashboard.html' }
      ]},
      { category: 'Management', items: [
        { name: 'Staff Management', url: 'admin/staff.html' },
        { name: 'Students', url: 'admin/students.html' },
        { name: 'Manage Courses', url: 'admin/courses.html' }
      ]},
      { category: 'Records', items: [
        { name: 'Certificates List', url: 'admin/certificates.html' },
        { name: 'Action Requests', url: 'admin/requests.html' }
      ]}
    ],
    staff: [
      { category: 'Home', items: [
        { name: 'Dashboard', url: 'staff/dashboard.html' }
      ]},
      { category: 'Tasks', items: [
        { name: 'Issue Certificate', url: 'staff/issue.html' },
        { name: 'Forward Requests', url: 'staff/requests.html' },
        { name: 'Certificates Ledger', url: 'admin/certificates.html' }
      ]},
      { category: 'People', items: [
        { name: 'Students', url: 'staff/students.html' }
      ]}
    ],
    student: [
      { category: 'Home', items: [
        { name: 'Dashboard', url: 'student/dashboard.html' },
        { name: 'My Profile', url: 'student/profile.html' }
      ]},
      { category: 'Certificates', items: [
        { name: 'My Certificates', url: 'student/certificates.html' },
        { name: 'My Requests', url: 'student/request.html' }
      ]},
      { category: 'Resources', items: [
        { name: 'Report Guidelines', url: 'report-guidelines.html' }
      ]}
    ]
  };

  const navCategories = menus[role] || [];
  
  // Dynamic category logic removed as per user request.
  
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  let sidebarHtml = `
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">CertPro</div>
      </div>
      <nav class="sidebar-nav">
  `;

  navCategories.forEach(cat => {
    sidebarHtml += `<div class="nav-category">${cat.category}</div>`;
    cat.items.forEach(item => {
      const icon = iconMap[item.name] || 'circle';
      const resolvedUrl = resolveUrl(item.url);
      sidebarHtml += `
        <a href="${resolvedUrl}" class="nav-item">
          <i data-lucide="${icon}" style="width:18px;height:18px;"></i>
          <span>${item.name}</span>
        </a>
      `;
    });
  });

  const currentPath = window.location.pathname;

  let topNavHtml = '';
  let tabsHtml = '';

  // 1. Identify active category based on current URL
  let activeCategory = navCategories[0];
  navCategories.forEach(cat => {
    if (cat.items.some(link => currentPath.includes(link.url))) {
      activeCategory = cat;
    }
  });

  // 2. Build Top Navbar (Categories)
  navCategories.forEach(cat => {
    const isActive = (cat === activeCategory);
    const firstUrl = cat.items.length > 0 ? cat.items[0].url : '#';
    const icon = iconMap[cat.category] || 'chevron-right';
    topNavHtml += `<a href="${resolveUrl(firstUrl)}" class="top-nav-cat ${isActive ? 'active' : ''}"><i data-lucide="${icon}" class="nav-icon" style="width:16px;height:16px;"></i> ${cat.category}</a>`;
  });
  topNavHtml += `<a href="#" onclick="logout(); return false;" class="top-nav-cat" style="color:var(--btn-danger); margin-left:auto; border-left:1px solid var(--border-color); border-right:none;"><i data-lucide="power" class="nav-icon" style="width:16px;height:16px;"></i> Logout</a>`;

  // 3. Build Sub Tabs for the active category
  if (activeCategory) {
    activeCategory.items.forEach(link => {
      const isActive = currentPath.includes(link.url);
      const icon = iconMap[link.name] || 'circle';
      let badge = '';
      if (link.name.includes('Request') && role !== 'student') {
          const table = JSON.parse(localStorage.getItem('requests')) || [];
          const count = table.filter(r => r.status === 'pending').length;
          if (count > 0) badge = `<span style="background:var(--btn-danger); border-radius:50%; width:8px; height:8px; display:inline-block; margin-left:6px; vertical-align:middle;"></span>`;
      }
      tabsHtml += `<a href="${resolveUrl(link.url)}" class="sub-tab ${isActive ? 'active' : ''}"><i data-lucide="${icon}" class="nav-icon" style="width:14px;height:14px;"></i> ${link.name}${badge}</a>`;
    });
  }

  const roleTitles = {
    superadmin: 'Super Admin',
    admin: 'University Admin',
    staff: 'Office Staff',
    student: 'Student Portal'
  };

  // Build mobile nav drawer HTML
  let mobileDrawerHtml = '';
  navCategories.forEach(cat => {
    const icon = iconMap[cat.category] || 'chevron-right';
    mobileDrawerHtml += `<div class="mobile-nav-section">
      <div class="mobile-nav-category">${cat.category}</div>`;
    cat.items.forEach(item => {
      const itemIcon = iconMap[item.name] || 'circle';
      const resolvedUrl = resolveUrl(item.url);
      const isActive = currentPath.includes(item.url);
      mobileDrawerHtml += `<a href="${resolvedUrl}" class="mobile-nav-item${isActive ? ' active' : ''}">
        <i data-lucide="${itemIcon}" style="width:18px;height:18px;flex-shrink:0;"></i>
        <span>${item.name}</span>
      </a>`;
    });
    mobileDrawerHtml += `</div>`;
  });
  mobileDrawerHtml += `<button class="mobile-nav-logout" onclick="logout(); return false;">
    <i data-lucide="power" style="width:18px;height:18px;flex-shrink:0;"></i>
    <span>Logout</span>
  </button>`;

  container.innerHTML = `
    <header class="top-header">
      <div class="top-header-brand">
          <span style="font-weight:900; letter-spacing: -0.05em;">CertPro</span>
          <span style="font-size:0.75rem; color:var(--text-tertiary); margin-left:15px; font-family:var(--font-mono); letter-spacing: 0.1em; text-transform:uppercase;">${roleTitles[role] || ''}</span>
      </div>
      <nav class="top-nav">
          ${topNavHtml}
      </nav>
      <button class="hamburger" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </header>
    ${tabsHtml ? `<div class="sub-tabs-bar">${tabsHtml}</div>` : ''}
    <div class="mobile-nav-drawer" id="mobileNavDrawer">
      ${mobileDrawerHtml}
    </div>
  `;

  // Wire up hamburger toggle
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer  = document.getElementById('mobileNavDrawer');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      menuBtn.classList.toggle('open', isOpen);
      menuBtn.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close drawer on link click
    drawer.querySelectorAll('.mobile-nav-item').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });
  }
}

