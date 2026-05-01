function getAll(collection) {
  return JSON.parse(localStorage.getItem(collection)) || [];
}

function getById(collection, id) {
  return getAll(collection).find(item => item.id === id) || null;
}

function create(collection, obj) {
  const all = getAll(collection);
  all.push(obj);
  localStorage.setItem(collection, JSON.stringify(all));
  return obj;
}

function update(collection, id, changes) {
  const all = getAll(collection).map(item =>
    item.id === id ? { ...item, ...changes } : item
  );
  localStorage.setItem(collection, JSON.stringify(all));
}

function remove(collection, id) {
  const all = getAll(collection).filter(item => item.id !== id);
  localStorage.setItem(collection, JSON.stringify(all));
}

function generateId(prefix) {
  return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Generate a 15-character Certificate ID
// Format: 3(UNI) + 2(CERT) + 3(STUDENT) + 7(NUMBERS/LETTERS) = 15 chars total
function generateCertId(universityId, studentName, certTypeName) {
  const uniCode = (universityId || 'GEN').replace(/[^A-Z0-9]/gi,'').substring(0,3).toUpperCase().padEnd(3,'X');
  const certCode = (certTypeName || 'DC').replace(/[^a-zA-Z]/g,'').substring(0,2).toUpperCase().padEnd(2,'X');
  const initials = (studentName || 'XXX').replace(/[^a-zA-Z ]/g,'').split(' ')
      .map(w => w[0] || '').join('').toUpperCase().substring(0,3).padEnd(3,'X');
  
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for(let i=0; i<7; i++) rand += charset[Math.floor(Math.random() * charset.length)];
  
  return (uniCode + certCode + initials + rand).substring(0, 15);
}

// Short request ID: e.g. REQ-9A2F8 (9 chars total)
function generateReqId() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for(let i=0; i<5; i++) rand += charset[Math.floor(Math.random() * charset.length)];
  return `REQ-${rand}`;
}

// Generate Student Roll Number: [UNI]-[COURSE-CODE]-[YEAR]-[SEQ]
function generateRollNo(uniId, courseId, year) {
    const uniCode = (uniId || 'GEN').replace(/[^A-Z0-9]/gi,'').substring(0,3).toUpperCase().padEnd(3,'X');
    const cObj = getById('courseTypes', courseId);
    const cCode = cObj ? cObj.name.replace(/[^A-Z]/gi,'').substring(0,3).toUpperCase() : 'CRS';
    const yr = year || new Date().getFullYear();
    const seq = Math.floor(Math.random() * 900) + 100; // 3-digit
    return `${uniCode}-${cCode}-${yr}-${seq}`;
}

// Generate Employee ID: [UNI]-EMP-[SEQ]
function generateEmpId(uniId) {
    const uniCode = (uniId || 'GEN').replace(/[^A-Z0-9]/gi,'').substring(0,3).toUpperCase().padEnd(3,'X');
    const seq = Math.floor(Math.random() * 9000) + 1000; // 4-digit
    return `${uniCode}-EMP-${seq}`;
}

// Central activity logger — call this after every important action
function logAction(action, targetId, details) {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session) return;
        const entry = {
            id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random()*1000),
            timestamp: new Date().toISOString(),
            userId: session.userId,
            universityId: session.universityId || 'GLOBAL',
            action: action,
            targetId: targetId || '-',
            details: details || ''
        };
        const logs = JSON.parse(localStorage.getItem('logs')) || [];
        logs.unshift(entry); // newest first
        // Keep max 500 log entries to avoid localStorage bloat
        if (logs.length > 500) logs.splice(500);
        localStorage.setItem('logs', JSON.stringify(logs));
    } catch(e) { /* silently fail — logging must never break UX */ }
}

function seedData() {
  // ─── BUMP THIS to force all devices to re-seed with fresh data ───
  const SEED_VERSION = 'v3-certpro-2026';
  // ─────────────────────────────────────────────────────────────────
  if (localStorage.getItem('seedVersion') === SEED_VERSION) return;

  // Clear everything and start fresh
  localStorage.clear();

  localStorage.setItem('users', JSON.stringify([
    { id: 'USR-001', name: 'Alok Nath (Superadmin)', email: 'super@cert.com', password: 'super123', role: 'superadmin', universityId: null, status: 'active', createdAt: '2024-01-01' },
    { id: 'USR-002', name: 'Dr. Ramesh Kumar', email: 'admin@uni1.com', password: 'admin123', role: 'admin', universityId: 'UNI-001', status: 'active', createdAt: '2024-01-01' },
    { id: 'USR-003', name: 'Priya Sharma (Staff)', email: 'staff@uni1.com', password: 'staff123', role: 'staff', universityId: 'UNI-001', status: 'active', createdAt: '2024-01-01' },
    { id: 'USR-004', name: 'Rahul Patel', email: 'student@uni1.com', password: 'student123', role: 'student', universityId: 'UNI-001', status: 'active', createdAt: '2024-01-01' }
  ]));

  localStorage.setItem('universities', JSON.stringify([
    { id: 'UNI-001', name: 'Indian Institute of Technology (IIT) Bombay', address: 'Powai, Mumbai', adminIds: ['USR-002'], status: 'active', createdAt: '2024-01-01' },
    { id: 'UNI-002', name: 'Delhi University (DU)', address: 'New Delhi', adminIds: [], status: 'active', createdAt: '2024-01-01' },
    { id: 'UNI-003', name: 'Birla Institute of Technology and Science (BITS)', address: 'Pilani, Rajasthan', adminIds: [], status: 'active', createdAt: '2024-01-01' },
    { id: 'UNI-004', name: 'Jawaharlal Nehru University (JNU)', address: 'New Delhi', adminIds: [], status: 'active', createdAt: '2024-01-01' }
  ]));

  localStorage.setItem('courseTypes', JSON.stringify([
    { id: 'CT-001', name: 'Bachelor of Science (BSc)', level: 'bachelor', duration: '3 years', status: 'active' },
    { id: 'CT-002', name: 'Bachelor of Arts (BA)', level: 'bachelor', duration: '3 years', status: 'active' },
    { id: 'CT-003', name: 'Bachelor of Commerce (BCom)', level: 'bachelor', duration: '3 years', status: 'active' },
    { id: 'CT-004', name: 'Bachelor of Engineering (BE)', level: 'bachelor', duration: '4 years', status: 'active' },
    { id: 'CT-005', name: 'Bachelor of Technology (BTech)', level: 'bachelor', duration: '4 years', status: 'active' },
    { id: 'CT-006', name: 'Bachelor of Medicine (MBBS)', level: 'bachelor', duration: '5.5 years', status: 'active' },
    { id: 'CT-007', name: 'Bachelor of Pharmacy (BPharm)', level: 'bachelor', duration: '4 years', status: 'active' },
    { id: 'CT-008', name: 'Bachelor of Computer Applications (BCA)', level: 'bachelor', duration: '3 years', status: 'active' },
    { id: 'CT-009', name: 'Bachelor of Business Admin (BBA)', level: 'bachelor', duration: '3 years', status: 'active' },
    { id: 'CT-010', name: 'Bachelor of Education (BEd)', level: 'bachelor', duration: '2 years', status: 'active' },
    { id: 'CT-011', name: 'Bachelor of Law (LLB)', level: 'bachelor', duration: '3 years', status: 'active' },
    { id: 'CT-012', name: 'Bachelor of Architecture (BArch)', level: 'bachelor', duration: '5 years', status: 'active' },
    { id: 'CT-013', name: 'Bachelor of Design (BDes)', level: 'bachelor', duration: '4 years', status: 'active' },
    { id: 'CT-014', name: 'Bachelor of Hotel Management (BHM)', level: 'bachelor', duration: '3 years', status: 'active' },
    { id: 'CT-015', name: 'Bachelor of Fine Arts (BFA)', level: 'bachelor', duration: '4 years', status: 'active' },
    { id: 'CT-016', name: 'Master of Science (MSc)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-017', name: 'Master of Arts (MA)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-018', name: 'Master of Commerce (MCom)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-019', name: 'Master of Engineering (ME)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-020', name: 'Master of Technology (MTech)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-021', name: 'Master of Business Admin (MBA)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-022', name: 'Master of Computer Applications (MCA)', level: 'master', duration: '3 years', status: 'active' },
    { id: 'CT-023', name: 'Master of Education (MEd)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-024', name: 'Master of Law (LLM)', level: 'master', duration: '1 year', status: 'active' },
    { id: 'CT-025', name: 'Master of Public Health (MPH)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-026', name: 'Master of Social Work (MSW)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-027', name: 'Master of Fine Arts (MFA)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-028', name: 'Master of Architecture (MArch)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-029', name: 'Master of Pharmacy (MPharm)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-030', name: 'Master of Design (MDes)', level: 'master', duration: '2 years', status: 'active' },
    { id: 'CT-031', name: 'Diploma in Computer Science', level: 'diploma', duration: '1 year', status: 'active' },
    { id: 'CT-032', name: 'Diploma in Education', level: 'diploma', duration: '1 year', status: 'active' },
    { id: 'CT-033', name: 'Diploma in Hotel Management', level: 'diploma', duration: '1 year', status: 'active' },
    { id: 'CT-034', name: 'Diploma in Pharmacy', level: 'diploma', duration: '1 year', status: 'active' },
    { id: 'CT-035', name: 'Diploma in Engineering', level: 'diploma', duration: '3 years', status: 'active' },
    { id: 'CT-036', name: 'Diploma in Nursing', level: 'diploma', duration: '3 years', status: 'active' },
    { id: 'CT-037', name: 'Diploma in Business Management', level: 'diploma', duration: '1 year', status: 'active' },
    { id: 'CT-038', name: 'Diploma in Graphic Design', level: 'diploma', duration: '1 year', status: 'active' },
    { id: 'CT-039', name: 'Diploma in Journalism', level: 'diploma', duration: '1 year', status: 'active' },
    { id: 'CT-040', name: 'Diploma in Interior Design', level: 'diploma', duration: '1 year', status: 'active' }
  ]));

  localStorage.setItem('certTypes', JSON.stringify([
    { id: 'CTYPE-001', name: 'Degree Certificate', description: 'Awarded on degree completion', borderColor: '#1a3c6e', status: 'active' },
    { id: 'CTYPE-002', name: 'Provisional Certificate', description: 'Issued before original degree cert', borderColor: '#2d6a4f', status: 'active' },
    { id: 'CTYPE-003', name: 'Migration Certificate', description: 'For transfer to another university', borderColor: '#6b2737', status: 'active' },
    { id: 'CTYPE-004', name: 'Character Certificate', description: 'Certifies student conduct', borderColor: '#5c4827', status: 'active' },
    { id: 'CTYPE-005', name: 'Bonafide Certificate', description: 'Confirms enrollment status', borderColor: '#1b4f72', status: 'active' },
    { id: 'CTYPE-006', name: 'Merit Certificate', description: 'Awarded for academic excellence', borderColor: '#7b3f00', status: 'active' },
    { id: 'CTYPE-007', name: 'Participation Certificate', description: 'Awarded for event/activity', borderColor: '#4a235a', status: 'active' },
    { id: 'CTYPE-008', name: 'Course Completion Certificate', description: 'Marks end of a course', borderColor: '#1a5276', status: 'active' },
    { id: 'CTYPE-009', name: 'Internship Certificate', description: 'Confirms internship completion', borderColor: '#0e6655', status: 'active' },
    { id: 'CTYPE-010', name: 'Achievement Certificate', description: 'For special accomplishment', borderColor: '#7d6608', status: 'active' },
    { id: 'CTYPE-011', name: 'Scholarship Certificate', description: 'Confirms scholarship award', borderColor: '#1f618d', status: 'active' },
    { id: 'CTYPE-012', name: 'Transfer Certificate', description: 'For student transfer', borderColor: '#922b21', status: 'active' },
    { id: 'CTYPE-013', name: 'Sports Certificate', description: 'For sports achievement', borderColor: '#1e8449', status: 'active' },
    { id: 'CTYPE-014', name: 'Cultural Certificate', description: 'For cultural activity', borderColor: '#6c3483', status: 'active' },
    { id: 'CTYPE-015', name: 'Research Certificate', description: 'For research contribution', borderColor: '#154360', status: 'active' }
  ]));

  let users = JSON.parse(localStorage.getItem('users')) || [];
  let unis = JSON.parse(localStorage.getItem('universities')) || [];
  const courses = JSON.parse(localStorage.getItem('courseTypes')) || [];
  const certTypes = JSON.parse(localStorage.getItem('certTypes')) || [];

  let students = [
    { id: 'STU-001', userId: 'USR-004', universityId: 'UNI-001', enrolledCourseTypeIds: ['CT-005'], phone: '+91 9876543210', bio: 'Computer Science major at IITB', status: 'active' }
  ];

  let staff = [
    { id: 'STA-001', userId: 'USR-003', universityId: 'UNI-001', status: 'active' }
  ];

  let certificates = [
    { id: 'CERT-001', studentId: 'STU-001', courseTypeId: 'CT-005', certTypeId: 'CTYPE-001', universityId: 'UNI-001', issuedBy: 'USR-003', issuedAt: '2024-06-01', status: 'issued', remarks: '' }
  ];

  let requests = [
    { id: 'REQ-001', studentId: 'STU-001', courseTypeId: 'CT-005', universityId: 'UNI-001', reason: 'Placement drive at Infosys', status: 'pending', staffRemarks: '', adminRemarks: '', createdAt: '2024-06-01' }
  ];

  // MASS DATA GENERATOR
  const indianFirstNames = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Ayaan','Krishna','Ishaan','Shaurya','Atharva','Amit','Rahul','Priya','Neha','Pooja','Anjali','Sneha','Kavya','Riya','Divya','Rani','Kiran','Vijay','Suresh','Ramesh','Naveen'];
  const indianLastNames = ['Sharma','Patel','Singh','Kumar','Desai','Reddy','Rao','Iyer','Menon','Joshi','Verma','Gupta','Choudhary','Kapoor','Yadav','Bhatt','Mehta','Das','Sen','Nair','Chacko','Pillai'];
  const companies = ['TCS','Infosys','Wipro','Cognizant','Accenture','HCL','Tech Mahindra','Tata Automation','Reliance Industries','Zoho','Freshworks','Flipkart'];

  let counter = 10;
  function getUnq(prefix) { return prefix + '-' + Date.now() + '-' + (++counter) + '-' + Math.floor(Math.random() * 9999); }

  // Generate 8 Indian Universities
  const uniNames = ['Trichy','Surathkal','Warangal','Calicut','Rourkela','Kurukshetra','Durgapur','Silchar'];
  for(let i=0; i<8; i++) {
    const uniId = getUnq('UNI');
    const uName = uniNames[i];
    unis.push({ id: uniId, name: 'National Institute (' + uName + ')', address: uName + ', India', adminIds: [], status: 'active', createdAt: '2024-01-01' });
  }

  // Generate 30 Students
  for(let i=0; i<30; i++) {
    const uId = getUnq('USR');
    const sId = getUnq('STU');
    const fName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
    const lName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    const uni = unis[Math.floor(Math.random() * unis.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];

    users.push({ id: uId, name: fName + ' ' + lName, email: 'bulkstudent'+i+'@example.com', password: 'pass', role: 'student', universityId: uni.id, status: 'active', createdAt: '2024-02-01' });
    students.push({ id: sId, userId: uId, universityId: uni.id, enrolledCourseTypeIds: [course.id], phone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000), bio: '', status: 'active' });

    const randVal = Math.random();
    if(randVal > 0.4) {
        // 60% have certificates
        certificates.push({
            id: getUnq('CERT'), studentId: sId, courseTypeId: course.id, certTypeId: certTypes[Math.floor(Math.random()*certTypes.length)].id, 
            universityId: uni.id, issuedBy: 'USR-002', issuedAt: '2024-07-01', status: 'issued', remarks: 'Mass Simulated Data'
        });
    } else if(randVal > 0.1) {
        // 30% have requests
        const statuses = ['pending', 'forwarded', 'approved', 'rejected'];
        const company = companies[Math.floor(Math.random() * companies.length)];
        requests.push({
            id: getUnq('REQ'), studentId: sId, courseTypeId: course.id, universityId: uni.id, 
            reason: 'Corporate query from ' + company, status: statuses[Math.floor(Math.random()*statuses.length)], staffRemarks: '', adminRemarks: '', createdAt: '2024-08-01'
        });
    }
  }

  // Generate 10 Staff
  for(let i=0; i<10; i++) {
    const uId = getUnq('USR');
    const staId = getUnq('STA');
    const fName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
    const lName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    const uni = unis[Math.floor(Math.random() * unis.length)];
    
    users.push({ id: uId, name: fName + ' ' + lName + ' (Staff)', email: 'mass_staff'+i+'@example.com', password: 'pass', role: 'staff', universityId: uni.id, status: 'active', createdAt: '2024-01-15' });
    staff.push({ id: staId, userId: uId, universityId: uni.id, status: 'active' });
  }

  // Generate 5 Admins
  for(let i=0; i<5; i++) {
    const uId = getUnq('USR');
    const fName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
    const lName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    const uni = unis[Math.floor(Math.random() * unis.length)];
    
    users.push({ id: uId, name: 'Dr. ' + fName + ' ' + lName, email: 'mass_admin'+i+'@example.com', password: 'pass', role: 'admin', universityId: uni.id, status: 'active', createdAt: '2024-01-15' });
  }

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('universities', JSON.stringify(unis));
  localStorage.setItem('students', JSON.stringify(students));
  localStorage.setItem('staff', JSON.stringify(staff));
  localStorage.setItem('certificates', JSON.stringify(certificates));
  localStorage.setItem('requests', JSON.stringify(requests));

  // Mark seed as complete so this only runs once per device per version
  localStorage.setItem('seedVersion', SEED_VERSION);
}

seedData();
