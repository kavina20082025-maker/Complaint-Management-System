/**
 * CampusCare V3 — Smart Student Grievance & Complaint Management System
 * Pure Vanilla JavaScript Application Engine
 */

(function () {
  'use strict';

  // Prevent multiple initializations if script is loaded from both root and src
  if (window.__CAMPUSCARE_INITIALIZED__) return;
  window.__CAMPUSCARE_INITIALIZED__ = true;

  // --- Constants & Classification Rules ---
  const CATEGORIES = [
    'Academic',
    'Hostel',
    'Transport',
    'Fees',
    'Food',
    'IT Support',
    'Infrastructure',
    'Library',
    'Other',
  ];

  const DEPARTMENTS = [
    'Academic',
    'Hostel Maintenance',
    'Transport',
    'Accounts',
    'Food Services',
    'IT Support',
    'Maintenance',
    'Library',
    'General Administration',
  ];

  const SLA_HOURS = {
    Low: 120,
    Medium: 48,
    High: 12,
    Critical: 4,
  };

  const CATEGORY_RULES = {
    Hostel: ['hostel', 'room', 'water', 'warden', 'bed', 'bathroom', 'mess', 'accommodation', 'dormitory', 'geyser', 'tap', 'leakage', 'toilet'],
    Transport: ['bus', 'transport', 'driver', 'route', 'vehicle', 'stop', 'commute', 'shuttle', 'pass', 'timing'],
    Fees: ['fee', 'fees', 'payment', 'scholarship', 'refund', 'accounts', 'challan', 'receipt', 'tuition', 'fine', 'dues'],
    Academic: ['exam', 'mark', 'marks', 'faculty', 'course', 'class', 'attendance', 'assignment', 'academic', 'syllabus', 'professor', 'hod', 'timetable', 'hall ticket'],
    'IT Support': ['wifi', 'wi-fi', 'internet', 'computer', 'password', 'login', 'portal', 'network', 'software', 'email', 'lms', 'server', 'erp', 'lan', 'printer'],
    Food: ['food', 'canteen', 'mess', 'breakfast', 'lunch', 'dinner', 'meal', 'hygiene', 'catering', 'snack', 'water cooler'],
    Infrastructure: ['building', 'classroom', 'fan', 'light', 'electricity', 'water', 'chair', 'bench', 'projector', 'lift', 'elevator', 'ac', 'air conditioning', 'switch'],
    Library: ['library', 'book', 'borrow', 'fine', 'reading room', 'journal', 'librarian', 'catalog', 'due date', 'e-resource'],
  };

  const DEPT_RULES = {
    'Hostel Maintenance': ['hostel', 'room', 'warden', 'water', 'bathroom', 'dormitory', 'geyser', 'tap', 'leakage'],
    Transport: ['bus', 'transport', 'driver', 'route', 'shuttle', 'vehicle'],
    Accounts: ['fee', 'payment', 'scholarship', 'refund', 'challan', 'tuition'],
    'IT Support': ['wifi', 'wi-fi', 'internet', 'computer', 'password', 'portal', 'network', 'login', 'server', 'lms', 'lan'],
    'Food Services': ['food', 'canteen', 'mess', 'meal', 'breakfast', 'lunch', 'dinner', 'catering'],
    Library: ['library', 'book', 'reading', 'journal', 'catalog'],
    Maintenance: ['building', 'classroom', 'fan', 'light', 'electricity', 'chair', 'bench', 'ac', 'projector', 'lift'],
    Academic: ['exam', 'mark', 'faculty', 'course', 'class', 'attendance', 'assignment', 'hall ticket'],
  };

  const STORAGE_KEYS = {
    CURRENT_USER: 'campuscare_v3_current_user',
    USERS: 'campuscare_v3_users',
    COMPLAINTS: 'campuscare_v3_complaints',
    MESSAGES: 'campuscare_v3_messages',
    NOTIFICATIONS: 'campuscare_v3_notifications',
    ANNOUNCEMENTS: 'campuscare_v3_announcements',
    MAINTENANCE: 'campuscare_v3_maintenance',
    SERVICES: 'campuscare_v3_services',
    TEMPLATES: 'campuscare_v3_templates',
    AUDIT: 'campuscare_v3_audit',
    WATCHLIST: 'campuscare_v3_watchlist',
    THEME: 'campuscare_v3_theme',
  };

  // Helper date generators
  const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();
  const hoursFromNow = (h) => new Date(Date.now() + h * 3600 * 1000).toISOString();

  // --- Initial Seed Data ---
  const INITIAL_USERS = [
    {
      id: 'usr_student_kavin',
      name: 'Kavin A M',
      email: 'kavinam@karunya.edu.in',
      password: 'student123',
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'URK23CS1042',
      phone: '+91 98765 43210',
      active: true,
    },
    {
      id: 'usr_staff_rajesh',
      name: 'Dr. Rajesh Kumar',
      email: 'staff@campus.com',
      password: 'staff123',
      role: 'staff',
      department: 'Maintenance',
      phone: 'Ext. 204',
      active: true,
    },
    {
      id: 'usr_staff_ananya',
      name: 'Ananya Sharma',
      email: 'itstaff@campus.com',
      password: 'staff123',
      role: 'staff',
      department: 'IT Support',
      phone: 'Ext. 102',
      active: true,
    },
    {
      id: 'usr_head_selvam',
      name: 'Prof. M. Selvam',
      email: 'head@campus.com',
      password: 'head123',
      role: 'department_head',
      department: 'Maintenance',
      phone: 'Ext. 200',
      active: true,
    },
    {
      id: 'usr_admin_sarah',
      name: 'Dr. Sarah Jenkins',
      email: 'admin@campus.com',
      password: 'admin123',
      role: 'admin',
      department: 'General Administration',
      phone: 'Ext. 900',
      active: true,
    },
  ];

  const INITIAL_COMPLAINTS = [
    {
      complaint_id: 'CC-260930101',
      student_id: 'usr_student_kavin',
      student_name: 'Kavin A M',
      student_email: 'kavinam@karunya.edu.in',
      anonymous: false,
      location: 'Hostel Block C, 3rd Floor East Wing',
      title: 'Drinking water pipeline leakage and water cutoff in Block C',
      description:
        'The overhead pipeline on the 3rd floor corridor has developed a major leak near Room 314. Water supply to all odd-numbered rooms has stopped completely since morning. Water is spilling onto the corridor floor causing slip hazard.',
      category: 'Hostel',
      priority: 'High',
      department: 'Hostel Maintenance',
      status: 'Resolved',
      sla_hours: 12,
      sla_deadline: hoursFromNow(5),
      created_at: hoursAgo(7),
      updated_at: hoursAgo(1),
      attachments: [{ name: 'water_leak_corridor.jpg', size: '1.8 MB' }],
      critical: false,
      assigned_to: 'usr_staff_rajesh',
      assigned_name: 'Dr. Rajesh Kumar',
      timeline: [
        {
          status: 'Pending',
          note: 'Grievance submitted by Kavin A M. Smart analysis: Hostel Maintenance / High Priority / 12h SLA target.',
          at: hoursAgo(7),
          author: 'System',
        },
        {
          status: 'Assigned',
          note: 'Auto-assigned to Dr. Rajesh Kumar (Hostel Maintenance Duty Officer).',
          at: hoursAgo(6.5),
          author: 'System',
        },
        {
          status: 'In Progress',
          note: 'Plumbing team dispatched with CPVC replacement joint pipes and valve sealant.',
          at: hoursAgo(4),
          author: 'Dr. Rajesh Kumar',
        },
        {
          status: 'Resolved',
          note: 'Faulty elbow connector replaced, pressure tested at 4.2 bar, water flow restored to all rooms.',
          at: hoursAgo(1),
          author: 'Dr. Rajesh Kumar',
        },
      ],
      verified: false,
    },
    {
      complaint_id: 'CC-260930102',
      student_id: 'usr_student_kavin',
      student_name: 'Kavin A M',
      student_email: 'kavinam@karunya.edu.in',
      anonymous: false,
      location: 'Central Academic Block, Computer Lab 4',
      title: 'High-speed Wi-Fi and Eduroam network dropping packets in Lab 4',
      description:
        'During practical coding lab sessions, students are repeatedly disconnected from the university intranet server. Ping latency spikes over 850ms with 40% packet loss on the AP-CAB-04 access point.',
      category: 'IT Support',
      priority: 'Medium',
      department: 'IT Support',
      status: 'In Progress',
      sla_hours: 48,
      sla_deadline: hoursFromNow(38),
      created_at: hoursAgo(10),
      updated_at: hoursAgo(2),
      attachments: [{ name: 'ping_packet_loss_log.txt', size: '24 KB' }],
      critical: false,
      assigned_to: 'usr_staff_ananya',
      assigned_name: 'Ananya Sharma',
      timeline: [
        {
          status: 'Pending',
          note: 'Complaint filed and classified under IT Support.',
          at: hoursAgo(10),
          author: 'System',
        },
        {
          status: 'Assigned',
          note: 'Workload-routed to Ananya Sharma (Network Operations Lead).',
          at: hoursAgo(9),
          author: 'System',
        },
        {
          status: 'In Progress',
          note: 'Cisco PoE switch port analyzed. Access point firmware renegotiating duplex speed. Technician rebooting AP-CAB-04.',
          at: hoursAgo(2),
          author: 'Ananya Sharma',
        },
      ],
    },
    {
      complaint_id: 'CC-260930103',
      student_id: 'usr_student_kavin',
      student_name: 'Kavin A M',
      student_email: 'kavinam@karunya.edu.in',
      anonymous: false,
      location: 'Electrical Sciences Block, Classroom ES-201',
      title: 'Air conditioner compressor burning smell and sparking switchboard',
      description:
        'During lecture in ES-201, the ceiling AC unit began emitting a sharp burning smell and the main circuit breaker tripped with visible spark. Immediate inspection needed before afternoon classes.',
      category: 'Infrastructure',
      priority: 'Critical',
      department: 'Maintenance',
      status: 'Pending',
      sla_hours: 4,
      sla_deadline: hoursFromNow(2.5),
      created_at: hoursAgo(1.5),
      updated_at: hoursAgo(1.5),
      attachments: [],
      critical: true,
      assigned_to: 'usr_staff_rajesh',
      assigned_name: 'Dr. Rajesh Kumar',
      timeline: [
        {
          status: 'Pending',
          note: 'CRITICAL ALERT: Electrical hazard detected. Auto-escalated to Maintenance head & Safety desk.',
          at: hoursAgo(1.5),
          author: 'Smart Engine',
        },
      ],
    },
    {
      complaint_id: 'CC-260928104',
      student_id: 'usr_student_kavin',
      student_name: 'Kavin A M',
      student_email: 'kavinam@karunya.edu.in',
      anonymous: false,
      location: 'Admin Wing, Finance Counter 2',
      title: 'Semester tuition receipt not updating on student ERP portal',
      description:
        'Bank NEFT payment made on Sept 22 (UTR: UBIN240922881) for Semester 5 tuition fees is still showing pending dues on the myCampus portal. Hall ticket generation is blocked.',
      category: 'Fees',
      priority: 'High',
      department: 'Accounts',
      status: 'Closed',
      sla_hours: 12,
      sla_deadline: hoursAgo(24),
      created_at: hoursAgo(48),
      updated_at: hoursAgo(12),
      attachments: [{ name: 'bank_neft_challan.pdf', size: '420 KB' }],
      critical: false,
      assigned_to: 'usr_admin_sarah',
      assigned_name: 'Dr. Sarah Jenkins',
      timeline: [
        { status: 'Pending', note: 'Submitted with bank payment challan.', at: hoursAgo(48) },
        { status: 'In Progress', note: 'Accounts desk reconciling UTR.', at: hoursAgo(36) },
        { status: 'Resolved', note: 'Ledger updated, fee clearance certificate generated.', at: hoursAgo(18) },
        { status: 'Closed', note: 'Student verified that fee dues cleared and hall ticket unlocked.', at: hoursAgo(12) },
      ],
      verified: true,
      verified_at: hoursAgo(12),
      verification_note: 'Verified in ERP portal. Hall ticket downloaded successfully. Thanks for fast action!',
      rating: 5,
      feedback: 'Accounts staff responded promptly and reconciled the bank transaction within a few hours.',
      feedback_at: hoursAgo(12),
    },
  ];

  const INITIAL_SERVICES = [
    {
      id: 'srv_1',
      name: 'IT Services & Network Helpdesk',
      department: 'IT Support',
      description: 'Wi-Fi credentials, Eduroam setup, LMS access, student email, and lab computer technical assistance.',
      email: 'ithelp@campus.com',
      phone: 'Ext. 101',
      location: 'Technology Block, Ground Floor Room 104',
      hours: 'Mon - Sat, 08:30 AM - 08:00 PM',
    },
    {
      id: 'srv_2',
      name: 'Hostel Administration & Facilities Desk',
      department: 'Hostel Maintenance',
      description: 'Room allotment, furniture, plumbing, electrical repairs, warden escalation, and mess grievance intake.',
      email: 'hostel@campus.com',
      phone: 'Ext. 202',
      location: 'Residential Central Complex, Block A Desk',
      hours: '24x7 Operations Support',
    },
    {
      id: 'srv_3',
      name: 'Academic Affairs & Controller of Exams',
      department: 'Academic',
      description: 'Attendance reconciliation, hall tickets, grade card discrepancies, course credits, and faculty consultation.',
      email: 'academic@campus.com',
      phone: 'Ext. 301',
      location: 'Administrative Tower, Level 2 Wing B',
      hours: 'Mon - Fri, 09:00 AM - 05:00 PM',
    },
    {
      id: 'srv_4',
      name: 'Finance & Student Accounts Desk',
      department: 'Accounts',
      description: 'Tuition receipt validation, scholarship disbursals, hostel caution deposit refunds, and bank reconciliation.',
      email: 'accounts@campus.com',
      phone: 'Ext. 501',
      location: 'Finance Pavilion, Counters 1 - 4',
      hours: 'Mon - Fri, 09:30 AM - 04:30 PM',
    },
    {
      id: 'srv_5',
      name: 'Campus Fleet & Transport Services',
      department: 'Transport',
      description: 'Day-scholar bus routes, timings, GPS tracking helpdesk, semester bus passes, and route grievance redressal.',
      email: 'transport@campus.com',
      phone: 'Ext. 401',
      location: 'Central Transport Depot, Bus Bay 1',
      hours: 'Mon - Sat, 07:00 AM - 07:30 PM',
    },
    {
      id: 'srv_6',
      name: 'Central University Library Desk',
      department: 'Library',
      description: 'Book lending, RFID gate checks, digital IEEE/Springer journal access, quiet study rooms, and thesis repository.',
      email: 'library@campus.com',
      phone: 'Ext. 601',
      location: 'Dr. APJ Abdul Kalam Central Library',
      hours: 'All days, 08:00 AM - 11:00 PM',
    },
  ];

  const INITIAL_MAINTENANCE = [
    {
      id: 'maint_1',
      title: 'Hostel Block B & C Overhead Water Tank Deep Sanitization',
      area: 'Hostel Blocks B and C',
      date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
      note: 'Municipal chlorination and ultraviolet tank scouring. Supply will be suspended between 08:00 AM and 01:00 PM. Alternate reserve taps available at Ground Floor tank.',
      created_by: 'staff@campus.com',
      status: 'Scheduled',
    },
    {
      id: 'maint_2',
      title: 'Campus Central Fiber Backbone Switch Migration',
      area: 'Academic Blocks 1 to 4 & Central Library',
      date: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
      note: 'Upgrading core network 10G SFP+ modules. Brief 15-minute intermittent network drops expected between 11:00 PM and 11:30 PM.',
      created_by: 'itstaff@campus.com',
      status: 'Scheduled',
    },
  ];

  const INITIAL_ANNOUNCEMENTS = [
    {
      id: 'ann_1',
      title: 'CampusCare V3 Live: Real-Time Grievance & SLA Escalation System',
      message:
        'Students can now submit complaints with instant smart category & SLA prediction, track live resolution timelines, verify fixes before closure, and scan complaint QR codes directly at campus offices.',
      audience: 'all',
      created_at: hoursAgo(30),
      created_by: 'System Administrator',
      urgent: true,
    },
    {
      id: 'ann_2',
      title: 'Strict Zero-Tolerance Anti-Ragging & 24x7 Anonymous Incident Reporting',
      message:
        'Any intimidation or harassment can be reported using the Anonymous Reporting switch on CampusCare. All critical safety complaints immediately ping senior university security.',
      audience: 'students',
      created_at: hoursAgo(72),
      created_by: 'Dean of Student Affairs',
      urgent: false,
    },
  ];

  const INITIAL_TEMPLATES = [
    {
      id: 'tmpl_1',
      title: 'Acknowledged & Field Tech Dispatched',
      body: 'Your complaint has been acknowledged by the duty desk. A specialized technician has been dispatched to your location with estimated arrival within 45 minutes.',
    },
    {
      id: 'tmpl_2',
      title: 'Resolved - Awaiting Student Confirmation',
      body: 'The reported issue has been addressed and tested by the service team. Please review the service restoration on your end and verify the resolution in the portal.',
    },
  ];

  const INITIAL_AUDIT = [
    {
      id: 'aud_1',
      user_email: 'kavinam@karunya.edu.in',
      action: 'COMPLAINT_CREATED',
      complaint_id: 'CC-260930101',
      detail: 'Category=Hostel, Priority=High, SLA=12h',
      created_at: hoursAgo(7),
    },
  ];

  // --- Storage Helper Functions ---
  function getStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  // State with resilient initialization
  let currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  if (currentUser && (!currentUser.id || !currentUser.name)) {
    currentUser = INITIAL_USERS[0];
  }

  let users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  if (!Array.isArray(users) || users.length === 0) users = INITIAL_USERS;

  // Backfill passwords for all users if missing from earlier storage
  users.forEach((u) => {
    if (!u.password) {
      if (u.role === 'admin') u.password = 'admin123';
      else if (u.role === 'department_head') u.password = 'head123';
      else if (u.role === 'staff') u.password = 'staff123';
      else u.password = 'student123';
    }
  });

  let complaints = getStorage(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  if (!Array.isArray(complaints) || complaints.length === 0) complaints = INITIAL_COMPLAINTS;

  let messages = getStorage(STORAGE_KEYS.MESSAGES, []);
  let notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  let announcements = getStorage(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  let maintenance = getStorage(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE);
  let services = getStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  let templates = getStorage(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
  let auditLogs = getStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT);
  let watchlist = getStorage(STORAGE_KEYS.WATCHLIST, { usr_student_kavin: ['CC-260930101'] });
  let activeView = 'dashboard';
  let activeComplaintId = null;

  function saveAll() {
    setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    setStorage(STORAGE_KEYS.USERS, users);
    setStorage(STORAGE_KEYS.COMPLAINTS, complaints);
    setStorage(STORAGE_KEYS.MESSAGES, messages);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    setStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    setStorage(STORAGE_KEYS.MAINTENANCE, maintenance);
    setStorage(STORAGE_KEYS.SERVICES, services);
    setStorage(STORAGE_KEYS.TEMPLATES, templates);
    setStorage(STORAGE_KEYS.AUDIT, auditLogs);
    setStorage(STORAGE_KEYS.WATCHLIST, watchlist);
  }

  function addAudit(action, complaintId, detail) {
    auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_email: (currentUser && currentUser.email) || 'system',
      action: action,
      complaint_id: complaintId || '—',
      detail: detail || '',
      created_at: new Date().toISOString(),
    });
    setStorage(STORAGE_KEYS.AUDIT, auditLogs.slice(0, 200));
  }

  function addNotification(userId, title, message, cid) {
    notifications.unshift({
      id: 'notif_' + Date.now(),
      user_id: userId,
      title: title,
      message: message,
      complaint_id: cid,
      read: false,
      created_at: new Date().toISOString(),
    });
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    updateNotificationBadge();
  }

  // --- Smart Engine Functions ---
  function smartCategory(text) {
    const norm = (text || '').toLowerCase();
    const scores = {};
    for (const [cat, words] of Object.entries(CATEGORY_RULES)) {
      scores[cat] = words.reduce((acc, w) => (norm.includes(w) ? acc + 1 : acc), 0);
    }
    let best = 'Other';
    let max = 0;
    for (const [c, s] of Object.entries(scores)) {
      if (s > max) {
        max = s;
        best = c;
      }
    }
    return max > 0 ? best : 'Other';
  }

  function smartDepartment(text, category) {
    const norm = (text || '').toLowerCase();
    const scores = {};
    for (const [dept, words] of Object.entries(DEPT_RULES)) {
      scores[dept] = words.reduce((acc, w) => (norm.includes(w) ? acc + 1 : acc), 0);
    }
    let best = '';
    let max = 0;
    for (const [d, s] of Object.entries(scores)) {
      if (s > max) {
        max = s;
        best = d;
      }
    }
    if (max > 0) return best;

    const map = {
      Hostel: 'Hostel Maintenance',
      Transport: 'Transport',
      Fees: 'Accounts',
      'IT Support': 'IT Support',
      Food: 'Food Services',
      Library: 'Library',
      Academic: 'Academic',
      Infrastructure: 'Maintenance',
    };
    return map[category] || 'General Administration';
  }

  function smartPriority(text, isCritical) {
    const t = (text || '').toLowerCase();
    if (
      isCritical ||
      ['emergency', 'danger', 'fire', 'accident', 'injury', 'security threat', 'power failure', 'sparking', 'short circuit', 'ragging'].some(
        (w) => t.includes(w)
      )
    ) {
      return 'Critical';
    }
    if (
      ['urgent', 'immediately', 'unsafe', 'no water', 'no electricity', 'cannot attend', 'system down', 'hall ticket blocked'].some(
        (w) => t.includes(w)
      )
    ) {
      return 'High';
    }
    if (['not working', 'problem', 'issue', 'delay', 'broken', 'slow', 'faulty'].some((w) => t.includes(w))) {
      return 'Medium';
    }
    return 'Low';
  }

  function getBigrams(str) {
    const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const set = new Set();
    for (let i = 0; i < s.length - 1; i++) {
      set.add(s.substring(i, i + 2));
    }
    return set;
  }

  function textSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const b1 = getBigrams(str1);
    const b2 = getBigrams(str2);
    if (!b1.size || !b2.size) return 0;
    let intersect = 0;
    b1.forEach((b) => {
      if (b2.has(b)) intersect++;
    });
    return (2 * intersect) / (b1.size + b2.size);
  }

  function findDuplicate(title, desc) {
    const text = (title + ' ' + desc).trim();
    if (text.length < 8) return null;
    for (const c of complaints) {
      if (c.status === 'Closed') continue;
      const old = (c.title + ' ' + c.description).trim();
      if (textSimilarity(text, old) >= 0.62) {
        return c;
      }
    }
    return null;
  }

  function suggestStaff(dept) {
    const candidates = users.filter(
      (u) => u.active && (u.role === 'staff' || u.role === 'department_head') && u.department.toLowerCase() === dept.toLowerCase()
    );
    if (!candidates.length) return users.find((u) => u.role === 'staff') || null;

    const ranked = candidates.map((staff) => {
      const load = complaints.filter(
        (c) => c.assigned_to === staff.id && c.status !== 'Resolved' && c.status !== 'Closed'
      ).length;
      return { staff, load };
    });
    ranked.sort((a, b) => a.load - b.load);
    return ranked[0].staff;
  }

  function getSlaStatus(deadlineIso, status) {
    if (status === 'Resolved' || status === 'Closed') {
      return { isOverdue: false, isApproaching: false, formatted: 'Resolved within SLA' };
    }
    const diff = new Date(deadlineIso).getTime() - Date.now();
    const isOverdue = diff < 0;
    const abs = Math.abs(diff);
    const h = Math.floor(abs / (3600 * 1000));
    const m = Math.floor((abs % (3600 * 1000)) / (60 * 1000));
    const isApproaching = !isOverdue && diff <= 6 * 3600 * 1000;

    return {
      isOverdue,
      isApproaching,
      formatted: isOverdue ? `Overdue by ${h}h ${m}m` : `${h}h ${m}m remaining`,
    };
  }

  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s';
      setTimeout(() => t.remove(), 300);
    }, 3200);
  }

  // --- UI Routing & Navigation ---
  function navigateTo(viewName, complaintId) {
    const PROTECTED_VIEWS = ['dashboard', 'submit', 'work-queue', 'sla-warning', 'admin-command', 'users', 'watchlist', 'profile'];
    if (!currentUser && PROTECTED_VIEWS.includes(viewName)) {
      activeView = 'login';
      document.querySelectorAll('.app-view').forEach((v) => v.classList.remove('active'));
      const loginTarget = document.getElementById('view-login');
      if (loginTarget) loginTarget.classList.add('active');
      setupLoginForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    activeView = viewName;
    if (complaintId) activeComplaintId = complaintId;

    // Toggle views
    document.querySelectorAll('.app-view').forEach((v) => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewName);
    if (target) target.classList.add('active');

    // Update active nav links
    document.querySelectorAll('.side-link, .nav-link').forEach((el) => {
      const v = el.getAttribute('data-view');
      if (v === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    try {
      // Render corresponding view safely
      if (viewName === 'login') setupLoginForm();
      if (viewName === 'register') setupRegisterForm();
      if (viewName === 'dashboard') renderDashboard();
      if (viewName === 'submit') setupSubmitForm();
      if (viewName === 'complaint-detail') renderComplaintDetail(activeComplaintId);
      if (viewName === 'status-board') renderStatusBoard();
      if (viewName === 'work-queue') renderWorkQueue();
      if (viewName === 'sla-warning') renderSlaWarning();
      if (viewName === 'admin-command') renderAdminCommand();
      if (viewName === 'analytics') renderAnalytics();
      if (viewName === 'services') renderServices();
      if (viewName === 'maintenance') renderMaintenance();
      if (viewName === 'announcements') renderAnnouncements();
      if (viewName === 'search') renderSearch();
      if (viewName === 'watchlist') renderWatchlist();
      if (viewName === 'assistant') renderAssistant();
      if (viewName === 'users') renderUsers();
      if (viewName === 'audit') renderAudit();
      if (viewName === 'profile') renderProfile();
    } catch (err) {
      console.warn('Navigation render error:', err);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateNotificationBadge() {
    if (!currentUser) {
      const dot = document.getElementById('notif-badge-dot');
      if (dot) dot.style.display = 'none';
      return;
    }
    const unread = notifications.filter((n) => n.user_id === currentUser.id && !n.read).length;
    const dot = document.getElementById('notif-badge-dot');
    if (dot) dot.style.display = unread > 0 ? 'block' : 'none';
  }

  function populateRoleMenu() {
    const roleMenu = document.getElementById('role-menu');
    if (!roleMenu) return;

    if (!currentUser) {
      roleMenu.innerHTML = `
        <div style="padding: 12px; text-align: center;">
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem;">Guest Visitor</div>
          <button class="btn btn-primary btn-sm" style="width: 100%;" id="menu-signin-btn">Sign In</button>
        </div>
      `;
      const btn = document.getElementById('menu-signin-btn');
      if (btn) btn.onclick = () => { roleMenu.style.display = 'none'; navigateTo('login'); };
      return;
    }

    let html = `
      <div style="padding: 10px 14px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-subtle);">
        <div style="font-weight: 800; font-size: 0.84rem; color: var(--text);">${currentUser.name}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">${currentUser.email}</div>
        <div style="margin-top: 4px;"><span class="status-tag status-inprogress" style="font-size: 0.65rem;">${(currentUser.role || '').replace('_', ' ').toUpperCase()}</span></div>
      </div>
      <div style="font-size:0.68rem; font-weight:800; color:var(--text-subtle); padding:8px 14px 4px; text-transform:uppercase; letter-spacing:0.05em;">Switch Persona</div>
    `;

    users.slice(0, 5).forEach((u) => {
      const isCur = u.id === currentUser.id;
      html += `
        <div class="role-menu-item" data-switch-id="${u.id}" style="padding: 7px 14px; font-size: 0.78rem; cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: ${isCur ? 'var(--primary-subtle)' : 'transparent'};">
          <div>
            <b>${u.name}</b> <span style="font-size:0.68rem; color:var(--text-muted);">(${u.role.replace('_', ' ')})</span>
          </div>
          ${isCur ? '<span style="color:var(--primary); font-size:0.8rem;">✓</span>' : ''}
        </div>
      `;
    });

    html += `
      <div style="border-top: 1px solid var(--border-subtle); margin-top: 4px; padding-top: 4px;">
        <div class="role-menu-item" id="role-menu-profile-btn" style="padding: 8px 14px; font-size: 0.78rem; cursor: pointer; color: var(--text); display: flex; align-items: center; gap: 0.5rem;">
          <span>👤</span> <span>Profile & Credentials</span>
        </div>
        <div class="role-menu-item" id="role-menu-logout-btn" style="padding: 8px 14px; font-size: 0.78rem; cursor: pointer; color: var(--danger); font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
          <span>🚪</span> <span>Sign Out</span>
        </div>
      </div>
    `;

    roleMenu.innerHTML = html;

    roleMenu.querySelectorAll('[data-switch-id]').forEach((el) => {
      el.onclick = () => {
        const uid = el.getAttribute('data-switch-id');
        const targetUser = users.find((u) => u.id === uid);
        if (targetUser) {
          currentUser = targetUser;
          setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
          updateHeaderUser();
          roleMenu.style.display = 'none';
          showToast(`Switched active persona to ${targetUser.name}`);
          navigateTo('dashboard');
        }
      };
    });

    const profBtn = document.getElementById('role-menu-profile-btn');
    if (profBtn) {
      profBtn.onclick = () => {
        roleMenu.style.display = 'none';
        navigateTo('profile');
      };
    }

    const logoutBtn = document.getElementById('role-menu-logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        roleMenu.style.display = 'none';
        logoutUser();
      };
    }
  }

  function updateHeaderUser() {
    const guestNav = document.getElementById('header-auth-guest');
    const userNav = document.getElementById('header-auth-user');
    const sideAuthText = document.getElementById('side-link-auth-text');
    const sideProfile = document.getElementById('side-link-profile');

    if (!currentUser) {
      if (guestNav) guestNav.style.display = 'flex';
      if (userNav) userNav.style.display = 'none';
      if (sideAuthText) sideAuthText.textContent = 'Sign In / Register';
      if (sideProfile) sideProfile.style.display = 'none';
      document.querySelectorAll('.role-student-only, .role-staff-only, .role-admin-only').forEach((el) => {
        el.style.display = 'none';
      });
      populateRoleMenu();
      return;
    }

    if (guestNav) guestNav.style.display = 'none';
    if (userNav) userNav.style.display = 'block';
    if (sideAuthText) sideAuthText.textContent = 'Sign Out';
    if (sideProfile) sideProfile.style.display = 'block';

    const avatar = document.getElementById('header-user-avatar');
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    if (avatar && currentUser.name) avatar.textContent = currentUser.name.charAt(0);
    if (nameEl && currentUser.name) nameEl.textContent = currentUser.name.split(' ')[0];
    if (roleEl && currentUser.role) roleEl.textContent = currentUser.role.replace('_', ' ').toUpperCase();

    // Show/hide role-specific sidebar items
    const isStudent = currentUser.role === 'student';
    const isStaff = currentUser.role === 'staff' || currentUser.role === 'department_head';
    const isAdmin = currentUser.role === 'admin';

    document.querySelectorAll('.role-student-only').forEach((el) => {
      el.style.display = isStudent ? 'flex' : 'none';
    });
    document.querySelectorAll('.role-staff-only').forEach((el) => {
      el.style.display = isStaff || isAdmin ? 'flex' : 'none';
    });
    document.querySelectorAll('.role-admin-only').forEach((el) => {
      el.style.display = isAdmin ? 'block' : 'none';
    });

    populateRoleMenu();
  }

  function logoutUser() {
    if (currentUser) {
      addAudit('USER_LOGOUT', '—', `Signed out (${currentUser.email})`);
    }
    currentUser = null;
    try { localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); } catch (e) {}
    try { sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER); } catch (e) {}

    updateHeaderUser();
    updateNotificationBadge();
    showToast('You have been signed out safely.');
    navigateTo('login');
  }

  function setupLoginForm() {
    const form = document.getElementById('login-form');
    const alertBox = document.getElementById('login-alert-box');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const togglePassBtn = document.getElementById('toggle-login-pass');
    const forgotBtn = document.getElementById('login-forgot-btn');
    const rememberBox = document.getElementById('login-remember');

    if (alertBox) alertBox.style.display = 'none';

    // Show/hide password
    if (togglePassBtn && passInput) {
      togglePassBtn.onclick = () => {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
        togglePassBtn.textContent = passInput.type === 'password' ? '👁️' : '🙈';
      };
    }

    // Forgot password demo action
    if (forgotBtn) {
      forgotBtn.onclick = (e) => {
        e.preventDefault();
        const em = emailInput ? emailInput.value.trim() : '';
        if (!em) {
          showToast('Enter your university email address above first.');
        } else {
          showToast(`Password reset link dispatched to ${em}. Demo password is "student123" or "staff123".`);
        }
      };
    }

    // 1-Click Demo Fill buttons
    document.querySelectorAll('[data-fill]').forEach((btn) => {
      btn.onclick = () => {
        const role = btn.getAttribute('data-fill');
        if (role === 'student') {
          if (emailInput) emailInput.value = 'kavinam@karunya.edu.in';
          if (passInput) passInput.value = 'student123';
        } else if (role === 'staff') {
          if (emailInput) emailInput.value = 'staff@campus.com';
          if (passInput) passInput.value = 'staff123';
        } else if (role === 'head') {
          if (emailInput) emailInput.value = 'head@campus.com';
          if (passInput) passInput.value = 'head123';
        } else if (role === 'admin') {
          if (emailInput) emailInput.value = 'admin@campus.com';
          if (passInput) passInput.value = 'admin123';
        }
        if (alertBox) alertBox.style.display = 'none';
        showToast(`Filled demo credentials for ${role.toUpperCase()}`);
      };
    });

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const email = (emailInput ? emailInput.value : '').trim().toLowerCase();
        const password = (passInput ? passInput.value : '').trim();

        if (!email || !password) {
          if (alertBox) {
            alertBox.textContent = 'Please enter both your email address and password.';
            alertBox.style.display = 'flex';
          }
          return;
        }

        const user = users.find((u) => u.email.toLowerCase() === email);
        if (!user) {
          if (alertBox) {
            alertBox.innerHTML = `No account found for <b>${email}</b>. Please register below.`;
            alertBox.style.display = 'flex';
          }
          return;
        }

        if (user.active === false) {
          if (alertBox) {
            alertBox.textContent = 'This account has been deactivated. Please contact campus admin.';
            alertBox.style.display = 'flex';
          }
          return;
        }

        // Verify password
        const expectedPass = user.password || (user.role === 'admin' ? 'admin123' : user.role === 'staff' || user.role === 'department_head' ? 'staff123' : 'student123');
        if (password !== expectedPass) {
          if (alertBox) {
            alertBox.innerHTML = `Incorrect password. (Hint: Demo password is <code>${expectedPass}</code>)`;
            alertBox.style.display = 'flex';
          }
          return;
        }

        // Success!
        currentUser = user;
        const remember = rememberBox ? rememberBox.checked : true;
        if (remember) {
          setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
        }

        addAudit('USER_LOGIN', '—', `Logged in via credentials (${user.role})`);
        updateHeaderUser();
        updateNotificationBadge();
        showToast(`Welcome back, ${user.name}!`);
        navigateTo('dashboard');
      };
    }
  }

  function setupRegisterForm() {
    const form = document.getElementById('register-form');
    const alertBox = document.getElementById('register-alert-box');
    const successBox = document.getElementById('register-success-box');
    const togglePassBtn = document.getElementById('toggle-reg-pass');
    const passInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm');
    const roleCardStudent = document.getElementById('role-card-student');
    const roleCardStaff = document.getElementById('role-card-staff');
    const idLabel = document.getElementById('reg-id-label');
    const idInput = document.getElementById('reg-id');
    const hostelGroup = document.getElementById('reg-hostel-group');

    if (alertBox) alertBox.style.display = 'none';
    if (successBox) successBox.style.display = 'none';

    // Show/hide password
    if (togglePassBtn && passInput) {
      togglePassBtn.onclick = () => {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
        togglePassBtn.textContent = passInput.type === 'password' ? '👁️' : '🙈';
      };
    }

    // Role radio cards toggle
    const updateRoleUI = () => {
      const selected = document.querySelector('input[name="reg_role_choice"]:checked');
      const role = selected ? selected.value : 'student';
      if (role === 'student') {
        if (roleCardStudent) roleCardStudent.className = 'role-picker-card selected';
        if (roleCardStaff) roleCardStaff.className = 'role-picker-card';
        if (idLabel) idLabel.textContent = 'Student Reg. Number *';
        if (idInput) idInput.placeholder = 'e.g. URK23CS1042';
        if (hostelGroup) hostelGroup.style.display = 'block';
      } else {
        if (roleCardStudent) roleCardStudent.className = 'role-picker-card';
        if (roleCardStaff) roleCardStaff.className = 'role-picker-card selected';
        if (idLabel) idLabel.textContent = 'Staff / Faculty ID *';
        if (idInput) idInput.placeholder = 'e.g. FAC-4089';
        if (hostelGroup) hostelGroup.style.display = 'none';
      }
    };

    document.querySelectorAll('input[name="reg_role_choice"]').forEach((r) => {
      r.onchange = updateRoleUI;
    });

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        if (alertBox) alertBox.style.display = 'none';

        const name = (document.getElementById('reg-name')?.value || '').trim();
        const studentId = (document.getElementById('reg-id')?.value || '').trim();
        const email = (document.getElementById('reg-email')?.value || '').trim().toLowerCase();
        const phone = (document.getElementById('reg-phone')?.value || '').trim();
        const dept = (document.getElementById('reg-dept')?.value || '').trim();
        const hostel = (document.getElementById('reg-hostel')?.value || '').trim();
        const pass = (document.getElementById('reg-password')?.value || '').trim();
        const confirm = (document.getElementById('reg-confirm')?.value || '').trim();
        const role = (document.querySelector('input[name="reg_role_choice"]:checked')?.value || 'student');

        if (!name || !email || !pass || !dept) {
          if (alertBox) {
            alertBox.textContent = 'Please fill out all required fields marked with *.';
            alertBox.style.display = 'flex';
          }
          return;
        }

        if (pass.length < 6) {
          if (alertBox) {
            alertBox.textContent = 'Password must be at least 6 characters long.';
            alertBox.style.display = 'flex';
          }
          return;
        }

        if (pass !== confirm) {
          if (alertBox) {
            alertBox.textContent = 'Passwords do not match. Please re-enter your password.';
            alertBox.style.display = 'flex';
          }
          return;
        }

        // Check duplicate email
        const exists = users.find((u) => u.email.toLowerCase() === email);
        if (exists) {
          if (alertBox) {
            alertBox.innerHTML = `An account already exists with <b>${email}</b>. Please sign in instead.`;
            alertBox.style.display = 'flex';
          }
          return;
        }

        const newUser = {
          id: 'usr_' + role + '_' + Date.now().toString(36),
          name: name,
          email: email,
          password: pass,
          role: role,
          department: dept,
          studentId: studentId || ('ID-' + Math.floor(1000 + Math.random() * 9000)),
          phone: phone || '+91 90000 00000',
          hostel: hostel,
          active: true,
        };

        users.push(newUser);
        setStorage(STORAGE_KEYS.USERS, users);

        // Sign in new user
        currentUser = newUser;
        setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);

        addAudit('USER_REGISTERED', '—', `Registered new account (${newUser.role}, ${newUser.department})`);
        addNotification(newUser.id, 'Welcome to CampusCare! 🎓', 'Your university grievance portal account is active. File and track complaints in real time.', null);

        updateHeaderUser();
        updateNotificationBadge();

        if (successBox) {
          successBox.textContent = `Account created successfully! Redirecting to dashboard...`;
          successBox.style.display = 'flex';
        }

        setTimeout(() => {
          showToast(`Account created! Welcome, ${newUser.name}.`);
          navigateTo('dashboard');
        }, 500);
      };
    }
  }

  // --- Render Functions ---

  function renderDashboard() {
    if (!currentUser) {
      navigateTo('login');
      return;
    }
    const isStudent = currentUser.role === 'student';
    const filtered = isStudent
      ? complaints.filter((c) => c.student_id === currentUser.id)
      : currentUser.role === 'admin'
      ? complaints
      : complaints.filter(
          (c) => c.department.toLowerCase() === currentUser.department.toLowerCase() || c.assigned_to === currentUser.id
        );

    const total = filtered.length;
    const pending = filtered.filter((c) => c.status === 'Pending' || c.status === 'Assigned').length;
    const inProgress = filtered.filter((c) => c.status === 'In Progress').length;
    const resolved = filtered.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
    const critical = filtered.filter((c) => c.priority === 'Critical' && c.status !== 'Closed').length;

    const elTotal = document.getElementById('kpi-total');
    if (elTotal) elTotal.textContent = total;
    const elPending = document.getElementById('kpi-pending');
    if (elPending) elPending.textContent = pending;
    const elProg = document.getElementById('kpi-inprogress');
    if (elProg) elProg.textContent = inProgress;
    const elRes = document.getElementById('kpi-resolved');
    if (elRes) elRes.textContent = resolved;
    const elCrit = document.getElementById('kpi-critical');
    if (elCrit) elCrit.textContent = critical;

    // Verification banner check
    const verifyBanner = document.getElementById('verification-banner');
    const needVerify = filtered.filter((c) => c.status === 'Resolved' && !c.verified);
    if (verifyBanner) {
      if (isStudent && needVerify.length > 0) {
        verifyBanner.style.display = 'flex';
        const vCount = document.getElementById('verify-count');
        if (vCount) vCount.textContent = needVerify.length;
        const vBtn = document.getElementById('verify-action-btn');
        if (vBtn) {
          vBtn.onclick = () => {
            navigateTo('complaint-detail', needVerify[0].complaint_id);
          };
        }
      } else {
        verifyBanner.style.display = 'none';
      }
    }

    // Hero title
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle && currentUser.name) {
      heroTitle.textContent = `Welcome back, ${currentUser.name.split(' ')[0]} 👋`;
    }

    // Recent table
    const tbody = document.getElementById('dashboard-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-subtle);">No complaints logged yet.</td></tr>`;
      return;
    }

    filtered.slice(0, 6).forEach((c) => {
      const sla = getSlaStatus(c.sla_deadline, c.status);
      const tr = document.createElement('tr');
      tr.onclick = () => navigateTo('complaint-detail', c.complaint_id);
      tr.innerHTML = `
        <td>
          <div style="font-weight: 700;">${c.title}</div>
          <div style="font-size: 0.7rem; color: var(--text-subtle); margin-top: 2px;">
            ${c.complaint_id} · ${c.location}
          </div>
        </td>
        <td>
          <div>${c.category}</div>
          <div style="font-size: 0.7rem; color: var(--text-subtle);">${c.department}</div>
        </td>
        <td>
          <span class="priority-${(c.priority || 'low').toLowerCase()}">${c.priority}</span>
          <div class="font-mono" style="font-size: 0.7rem; color: var(--text-muted);">${sla.formatted}</div>
        </td>
        <td>
          <span class="status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}">${c.status}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-outline btn-sm">View</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function setupSubmitForm() {
    const titleInput = document.getElementById('intake-title');
    const descInput = document.getElementById('intake-desc');
    const critCheckbox = document.getElementById('intake-critical');
    const anonCheckbox = document.getElementById('intake-anon');
    const locInput = document.getElementById('intake-loc');

    if (!titleInput || !descInput) return;

    function updatePreAnalysis() {
      const title = titleInput.value;
      const desc = descInput.value;
      const text = title + ' ' + desc;
      const cat = smartCategory(text);
      const prio = smartPriority(text, critCheckbox && critCheckbox.checked);
      const dept = smartDepartment(text, cat);
      const sla = SLA_HOURS[prio] || 48;
      const dup = findDuplicate(title, desc);

      const elCat = document.getElementById('ai-category');
      if (elCat) elCat.textContent = cat;
      const elPrio = document.getElementById('ai-priority');
      if (elPrio) elPrio.textContent = prio;
      const elDept = document.getElementById('ai-dept');
      if (elDept) elDept.textContent = dept;
      const elSla = document.getElementById('ai-sla');
      if (elSla) elSla.textContent = sla + ' hours guaranteed';

      const dupAlert = document.getElementById('ai-dup-alert');
      if (dupAlert) {
        if (dup) {
          dupAlert.style.display = 'block';
          const dupTitle = document.getElementById('ai-dup-title');
          if (dupTitle) dupTitle.textContent = `${dup.title} (${dup.complaint_id})`;
          const dupBtn = document.getElementById('ai-dup-btn');
          if (dupBtn) {
            dupBtn.onclick = () => {
              navigateTo('complaint-detail', dup.complaint_id);
            };
          }
        } else {
          dupAlert.style.display = 'none';
        }
      }
    }

    titleInput.oninput = updatePreAnalysis;
    descInput.oninput = updatePreAnalysis;
    if (critCheckbox) critCheckbox.onchange = updatePreAnalysis;

    const form = document.getElementById('submit-complaint-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const desc = descInput.value.trim();
        const loc = (locInput && locInput.value.trim()) || 'Campus Facilities';
        if (!title || !desc) return;

        const text = title + ' ' + desc;
        const cat = smartCategory(text);
        const prio = smartPriority(text, critCheckbox && critCheckbox.checked);
        const dept = smartDepartment(text, cat);
        const sla = SLA_HOURS[prio] || 48;
        const assigned = suggestStaff(dept);

        const cid = 'CC-' + Date.now().toString().slice(-8);
        const now = new Date().toISOString();
        const deadline = new Date(Date.now() + sla * 3600 * 1000).toISOString();

        const newComplaint = {
          complaint_id: cid,
          student_id: currentUser.id,
          student_name: anonCheckbox && anonCheckbox.checked ? 'Anonymous Student' : currentUser.name,
          student_email: currentUser.email,
          anonymous: anonCheckbox && anonCheckbox.checked,
          location: loc,
          title: title,
          description: desc,
          category: cat,
          priority: prio,
          department: dept,
          status: assigned ? 'Assigned' : 'Pending',
          sla_hours: sla,
          sla_deadline: deadline,
          created_at: now,
          updated_at: now,
          attachments: [],
          critical: (critCheckbox && critCheckbox.checked) || prio === 'Critical',
          assigned_to: assigned ? assigned.id : undefined,
          assigned_name: assigned ? assigned.name : undefined,
          timeline: [
            {
              status: 'Pending',
              note: `Grievance submitted by ${anonCheckbox && anonCheckbox.checked ? 'Anonymous Student' : currentUser.name}. Classified under ${dept} with ${sla}h SLA window.`,
              at: now,
              author: 'Smart Engine',
            },
          ],
        };

        if (assigned) {
          newComplaint.timeline.push({
            status: 'Assigned',
            note: `Workload-routed to ${assigned.name} (${dept}).`,
            at: now,
            author: 'Automated Dispatcher',
          });
          addNotification(assigned.id, 'New Grievance Assigned', `Ticket ${cid} assigned to you.`, cid);
        }

        complaints.unshift(newComplaint);
        addAudit('COMPLAINT_CREATED', cid, `Category=${cat}, Priority=${prio}, Dept=${dept}`);
        saveAll();

        showToast(`Grievance ${cid} submitted successfully!`);
        titleInput.value = '';
        descInput.value = '';
        if (locInput) locInput.value = '';
        if (critCheckbox) critCheckbox.checked = false;
        if (anonCheckbox) anonCheckbox.checked = false;

        navigateTo('complaint-detail', cid);
      };
    }
  }

  function renderComplaintDetail(cid) {
    const c = complaints.find((x) => x.complaint_id === cid);
    if (!c) {
      showToast('Complaint not found.');
      navigateTo('dashboard');
      return;
    }

    const sla = getSlaStatus(c.sla_deadline, c.status);
    const isOwner = currentUser.role === 'student' && c.student_id === currentUser.id;
    const isStaffOrAdmin = currentUser.role === 'staff' || currentUser.role === 'department_head' || currentUser.role === 'admin';

    const elId = document.getElementById('detail-id');
    if (elId) elId.textContent = c.complaint_id;
    const elTitle = document.getElementById('detail-title');
    if (elTitle) elTitle.textContent = c.title;
    const elMeta = document.getElementById('detail-meta');
    if (elMeta) elMeta.textContent = `${c.category} · ${c.department} · ${c.location} · ${new Date(c.created_at).toLocaleDateString()}`;
    const elStatus = document.getElementById('detail-status');
    if (elStatus) {
      elStatus.textContent = c.status;
      elStatus.className = `status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}`;
    }
    const elPrio = document.getElementById('detail-priority');
    if (elPrio) elPrio.textContent = `${c.priority} Priority`;
    const elSla = document.getElementById('detail-sla');
    if (elSla) elSla.textContent = `${sla.formatted} (${c.sla_hours}h SLA)`;
    const elDesc = document.getElementById('detail-desc');
    if (elDesc) elDesc.textContent = c.description;

    // Watchlist state
    const userWatched = watchlist[currentUser.id] || [];
    const isWatched = userWatched.includes(c.complaint_id);
    const watchBtn = document.getElementById('detail-watch-btn');
    if (watchBtn) {
      watchBtn.textContent = isWatched ? '★ Watched' : '☆ Watch Ticket';
      watchBtn.onclick = () => {
        if (isWatched) {
          watchlist[currentUser.id] = userWatched.filter((x) => x !== c.complaint_id);
          showToast('Removed from your watchlist.');
        } else {
          watchlist[currentUser.id] = [...userWatched, c.complaint_id];
          showToast('Added to your watchlist.');
        }
        saveAll();
        renderComplaintDetail(c.complaint_id);
      };
    }

    // QR Code modal trigger
    const qrBtn = document.getElementById('detail-qr-btn');
    if (qrBtn) {
      qrBtn.onclick = () => openQrModal(c);
    }

    // Resolution Verification Box (Feature 29)
    const verifyBox = document.getElementById('detail-verify-box');
    if (verifyBox) {
      if (c.status === 'Resolved' && (isOwner || currentUser.role === 'student' || isStaffOrAdmin)) {
        verifyBox.style.display = 'block';
        const btnAcc = document.getElementById('btn-verify-accept');
        if (btnAcc) {
          btnAcc.onclick = () => {
            const formAcc = document.getElementById('verify-accept-form');
            if (formAcc) formAcc.style.display = 'block';
            const formRej = document.getElementById('verify-reject-form');
            if (formRej) formRej.style.display = 'none';
          };
        }
        const btnRej = document.getElementById('btn-verify-reject');
        if (btnRej) {
          btnRej.onclick = () => {
            const formRej = document.getElementById('verify-reject-form');
            if (formRej) formRej.style.display = 'block';
            const formAcc = document.getElementById('verify-accept-form');
            if (formAcc) formAcc.style.display = 'none';
          };
        }
        const submitAcc = document.getElementById('submit-verify-accept');
        if (submitAcc) {
          submitAcc.onclick = () => {
            const ratingVal = document.getElementById('verify-rating-val');
            const rating = parseInt((ratingVal && ratingVal.value) || '5', 10);
            const feedbackInput = document.getElementById('verify-feedback-text');
            const feedback = (feedbackInput && feedbackInput.value.trim()) || '';
            const now = new Date().toISOString();
            c.status = 'Closed';
            c.verified = true;
            c.verified_at = now;
            c.rating = rating;
            c.feedback = feedback;
            c.timeline.push({
              status: 'Closed',
              note: `Student accepted resolution. Rating: ${rating}/5. Feedback: "${feedback || 'None'}"`,
              at: now,
              author: currentUser.name,
            });
            addAudit('RESOLUTION_VERIFIED', c.complaint_id, `Closed with rating ${rating}/5`);
            saveAll();
            showToast('Resolution verified. Grievance closed!');
            renderComplaintDetail(c.complaint_id);
          };
        }
        const submitRej = document.getElementById('submit-verify-reject');
        if (submitRej) {
          submitRej.onclick = () => {
            const reasonInput = document.getElementById('verify-reopen-reason');
            const note = (reasonInput && reasonInput.value.trim()) || '';
            if (!note) {
              showToast('Please provide a reason why the issue persists.');
              return;
            }
            const now = new Date().toISOString();
            c.status = 'Reopened';
            c.verified = false;
            c.timeline.push({
              status: 'Reopened',
              note: `Student rejected resolution: "${note}". Reopened with elevated priority.`,
              at: now,
              author: currentUser.name,
            });
            addAudit('RESOLUTION_REJECTED', c.complaint_id, note);
            if (c.assigned_to) {
              addNotification(c.assigned_to, 'Grievance Reopened', `Student reported ${c.complaint_id} persists: ${note}`, c.complaint_id);
            }
            saveAll();
            showToast('Grievance reopened and escalated back to duty desk.');
            renderComplaintDetail(c.complaint_id);
          };
        }
      } else {
        verifyBox.style.display = 'none';
      }
    }

    // Feedback display if closed
    const feedbackBox = document.getElementById('detail-feedback-box');
    if (feedbackBox) {
      if (c.status === 'Closed' && c.rating) {
        feedbackBox.style.display = 'block';
        const ratingDisplay = document.getElementById('detail-rating-display');
        if (ratingDisplay) ratingDisplay.textContent = '★'.repeat(c.rating) + ` (${c.rating}/5)`;
        const feedbackComment = document.getElementById('detail-feedback-comment');
        if (feedbackComment) feedbackComment.textContent = c.feedback ? `"${c.feedback}"` : 'No written feedback provided.';
      } else {
        feedbackBox.style.display = 'none';
      }
    }

    // Timeline rendering
    const timelineEl = document.getElementById('detail-timeline');
    if (timelineEl) {
      timelineEl.innerHTML = '';
      (c.timeline || []).forEach((item) => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
          <div class="timeline-dot ${item.status === 'Resolved' || item.status === 'Closed' ? 'success' : item.status === 'Escalated' ? 'danger' : ''}"></div>
          <div class="timeline-title">
            <span>${item.status}</span>
            <span class="timeline-time">${new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="timeline-desc">${item.note}</div>
        `;
        timelineEl.appendChild(div);
      });
    }

    // Discussion Messages
    const msgList = document.getElementById('detail-messages');
    if (msgList) {
      msgList.innerHTML = '';
      const relevant = messages.filter((m) => m.complaint_id === c.complaint_id);
      if (relevant.length === 0) {
        msgList.innerHTML = `<div style="text-align:center; font-size:0.75rem; color:var(--text-subtle); padding: 1.5rem;">No comments yet. Start a discussion with the administrative desk below.</div>`;
      } else {
        relevant.forEach((m) => {
          const isMe = m.user_id === currentUser.id;
          const bubble = document.createElement('div');
          bubble.className = `chat-bubble ${isMe ? 'mine' : 'theirs'}`;
          bubble.innerHTML = `
            <div style="font-weight: 700; font-size: 0.72rem; margin-bottom: 2px;">${m.user_name} (${m.user_role})</div>
            <div>${m.body}</div>
          `;
          msgList.appendChild(bubble);
        });
        msgList.scrollTop = msgList.scrollHeight;
      }
    }

    // Discussion submit
    const sendMsgBtn = document.getElementById('detail-send-msg-btn');
    if (sendMsgBtn) {
      sendMsgBtn.onclick = () => {
        const input = document.getElementById('detail-msg-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        const newMsg = {
          id: 'msg_' + Date.now(),
          complaint_id: c.complaint_id,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_role: currentUser.role,
          body: text,
          created_at: new Date().toISOString(),
        };
        messages.push(newMsg);
        setStorage(STORAGE_KEYS.MESSAGES, messages);
        input.value = '';
        renderComplaintDetail(c.complaint_id);
      };
    }

    // Staff action box
    const staffBox = document.getElementById('detail-staff-box');
    if (staffBox) {
      if (isStaffOrAdmin) {
        staffBox.style.display = 'block';
        const statusSelect = document.getElementById('staff-status-select');
        if (statusSelect) statusSelect.value = c.status;

        // Populate canned templates
        const tmplSelect = document.getElementById('staff-tmpl-select');
        if (tmplSelect) {
          tmplSelect.innerHTML = '<option value="">-- Insert Canned Response Template --</option>';
          templates.forEach((t) => {
            tmplSelect.innerHTML += `<option value="${t.body}">${t.title}</option>`;
          });
          tmplSelect.onchange = (e) => {
            const noteInput = document.getElementById('staff-note-input');
            if (e.target.value && noteInput) {
              noteInput.value = e.target.value;
            }
          };
        }

        const updateBtn = document.getElementById('staff-update-btn');
        if (updateBtn) {
          updateBtn.onclick = () => {
            const newStatus = statusSelect ? statusSelect.value : c.status;
            const noteInput = document.getElementById('staff-note-input');
            const note = (noteInput && noteInput.value.trim()) || `Status updated to ${newStatus}.`;
            const now = new Date().toISOString();
            c.status = newStatus;
            c.updated_at = now;
            c.timeline.push({
              status: newStatus,
              note: note,
              at: now,
              author: currentUser.name,
            });
            addAudit('STATUS_CHANGED', c.complaint_id, `Changed to ${newStatus}`);
            addNotification(c.student_id, `Ticket ${c.complaint_id} Updated`, `Status is now ${newStatus}: ${note}`, c.complaint_id);
            saveAll();
            showToast('Complaint updated successfully!');
            renderComplaintDetail(c.complaint_id);
          };
        }
      } else {
        staffBox.style.display = 'none';
      }
    }
  }

  function renderStatusBoard() {
    const tbody = document.getElementById('status-board-table');
    if (!tbody) return;
    tbody.innerHTML = '';
    complaints.forEach((c) => {
      const sla = getSlaStatus(c.sla_deadline, c.status);
      const tr = document.createElement('tr');
      tr.onclick = () => navigateTo('complaint-detail', c.complaint_id);
      tr.innerHTML = `
        <td class="font-mono font-bold">${c.complaint_id}</td>
        <td>
          <div style="font-weight:600;">${c.title}</div>
          <div style="font-size:0.7rem; color:var(--text-subtle);">${c.location}</div>
        </td>
        <td>${c.department}</td>
        <td>
          <span class="priority-${(c.priority || 'low').toLowerCase()}">${c.priority}</span>
          <div class="font-mono" style="font-size:0.7rem; color:var(--text-muted);">${sla.formatted}</div>
        </td>
        <td><span class="status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}">${c.status}</span></td>
        <td class="font-mono" style="font-size:0.7rem; text-align:right;">${new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderWorkQueue() {
    const tbody = document.getElementById('work-queue-table');
    if (!tbody) return;
    tbody.innerHTML = '';
    const deptComplaints = complaints.filter(
      (c) => c.department.toLowerCase() === currentUser.department.toLowerCase() || currentUser.role === 'admin'
    );
    deptComplaints.forEach((c) => {
      const sla = getSlaStatus(c.sla_deadline, c.status);
      const tr = document.createElement('tr');
      tr.onclick = () => navigateTo('complaint-detail', c.complaint_id);
      tr.innerHTML = `
        <td class="font-mono font-bold">${c.complaint_id}</td>
        <td>${c.title}</td>
        <td>${c.assigned_name || 'Unassigned'}</td>
        <td><span class="priority-${(c.priority || 'low').toLowerCase()}">${c.priority}</span></td>
        <td class="font-mono">${sla.formatted}</td>
        <td><span class="status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}">${c.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderSlaWarning() {
    const list = complaints.filter((c) => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      const sla = getSlaStatus(c.sla_deadline, c.status);
      return sla.isApproaching || sla.isOverdue;
    });

    const tbody = document.getElementById('sla-warning-table');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--success); font-weight: 600;">✓ All grievances are safely within their guaranteed SLA windows.</td></tr>`;
      return;
    }

    list.forEach((c) => {
      const sla = getSlaStatus(c.sla_deadline, c.status);
      const tr = document.createElement('tr');
      tr.onclick = () => navigateTo('complaint-detail', c.complaint_id);
      tr.innerHTML = `
        <td class="font-mono font-bold">${c.complaint_id}</td>
        <td>${c.title}</td>
        <td>${c.department}</td>
        <td><span class="priority-${(c.priority || 'low').toLowerCase()}">${c.priority}</span></td>
        <td class="font-mono font-bold" style="color: ${sla.isOverdue ? 'var(--danger)' : 'var(--warning)'};">${sla.formatted}</td>
        <td><span class="status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}">${c.status}</span></td>
      `;
      tbody.appendChild(tr);
    });

    const sendRemindersBtn = document.getElementById('sla-send-reminders-btn');
    if (sendRemindersBtn) {
      sendRemindersBtn.onclick = () => {
        list.forEach((c) => {
          if (c.assigned_to) {
            addNotification(c.assigned_to, 'SLA Warning', `Ticket ${c.complaint_id} is approaching its deadline.`, c.complaint_id);
          }
        });
        addAudit('SLA_REMINDERS_SENT', undefined, `Dispatched alerts for ${list.length} tickets`);
        showToast(`Dispatched SLA reminders for ${list.length} at-risk tickets.`);
      };
    }

    const escalateBtn = document.getElementById('sla-escalate-overdue-btn');
    if (escalateBtn) {
      escalateBtn.onclick = () => {
        let count = 0;
        complaints.forEach((c) => {
          if (c.status !== 'Resolved' && c.status !== 'Closed' && new Date(c.sla_deadline).getTime() < Date.now()) {
            c.status = 'Escalated';
            c.updated_at = new Date().toISOString();
            c.timeline.push({
              status: 'Escalated',
              note: 'Breached SLA target. Escalated directly to Dean of Student Affairs.',
              at: new Date().toISOString(),
              author: currentUser.name,
            });
            count++;
          }
        });
        saveAll();
        showToast(`Escalated ${count} overdue complaints to Dean's office.`);
        renderSlaWarning();
      };
    }
  }

  function renderAdminCommand() {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
    const overdue = complaints.filter(
      (c) => c.status !== 'Resolved' && c.status !== 'Closed' && new Date(c.sla_deadline).getTime() < Date.now()
    ).length;

    const elTotal = document.getElementById('admin-total');
    if (elTotal) elTotal.textContent = total;
    const elRate = document.getElementById('admin-rate');
    if (elRate) elRate.textContent = total ? Math.round((resolved / total) * 100) + '%' : '100%';
    const elOverdue = document.getElementById('admin-overdue');
    if (elOverdue) elOverdue.textContent = overdue;

    // Load bars
    const catContainer = document.getElementById('admin-category-bars');
    if (catContainer) {
      catContainer.innerHTML = '';
      CATEGORIES.forEach((cat) => {
        const count = complaints.filter((c) => c.category === cat).length;
        const pct = total ? (count / total) * 100 : 0;
        catContainer.innerHTML += `
          <div style="margin-bottom: 0.65rem;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom: 3px;">
              <span>${cat}</span>
              <span class="font-mono font-bold">${count}</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          </div>
        `;
      });
    }

    // Bulk selection table
    const tbody = document.getElementById('admin-bulk-table');
    if (!tbody) return;
    tbody.innerHTML = '';
    complaints.forEach((c) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="width: 36px;"><input type="checkbox" class="bulk-cb" value="${c.complaint_id}"></td>
        <td class="font-mono font-bold">${c.complaint_id}</td>
        <td>${c.title}</td>
        <td>${c.department}</td>
        <td><span class="priority-${(c.priority || 'low').toLowerCase()}">${c.priority}</span></td>
        <td><span class="status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}">${c.status}</span></td>
      `;
      tbody.appendChild(tr);
    });

    const applyBulkBtn = document.getElementById('admin-apply-bulk-btn');
    if (applyBulkBtn) {
      applyBulkBtn.onclick = () => {
        const selected = Array.from(document.querySelectorAll('.bulk-cb:checked')).map((cb) => cb.value);
        const actionEl = document.getElementById('admin-bulk-action');
        const action = actionEl ? actionEl.value : 'Resolved';
        if (!selected.length) {
          showToast('Please select at least one complaint checkbox.');
          return;
        }
        complaints.forEach((c) => {
          if (selected.includes(c.complaint_id)) {
            c.status = action;
            c.updated_at = new Date().toISOString();
            c.timeline.push({
              status: action,
              note: `Bulk admin operation: set to ${action}.`,
              at: new Date().toISOString(),
              author: currentUser.name,
            });
          }
        });
        addAudit('BULK_STATUS_UPDATE', undefined, `Set ${selected.length} tickets to ${action}`);
        saveAll();
        showToast(`Updated ${selected.length} complaints to ${action}.`);
        renderAdminCommand();
      };
    }

    // CSV Download
    const exportCsvBtn = document.getElementById('admin-export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.onclick = () => {
        const rows = [
          ['Complaint ID', 'Title', 'Category', 'Priority', 'Department', 'Status', 'SLA Hours', 'Created At'],
        ];
        complaints.forEach((c) => {
          rows.push([c.complaint_id, `"${c.title.replace(/"/g, '""')}"`, c.category, c.priority, c.department, c.status, c.sla_hours, c.created_at]);
        });
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `campuscare_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      };
    }
  }

  function renderAnalytics() {
    const rated = complaints.filter((c) => c.rating);
    const avg = rated.length ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1) : '5.0';
    const ratingEl = document.getElementById('analytics-avg-rating');
    if (ratingEl) ratingEl.textContent = avg + ' / 5.0';
  }

  function renderServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;
    grid.innerHTML = '';
    services.forEach((s) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';
      card.innerHTML = `
        <div>
          <div style="font-size:0.75rem; font-weight:700; color:var(--primary); margin-bottom: 4px;">${s.department} · ${s.phone}</div>
          <h3 style="font-size:1.05rem; font-weight:800; margin-bottom: 6px;">${s.name}</h3>
          <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4; margin-bottom: 12px;">${s.description}</p>
          <div style="font-size:0.74rem; color:var(--text-subtle); line-height:1.6; border-top: 1px solid var(--border-subtle); padding-top: 8px;">
            <div>📍 ${s.location}</div>
            <div>✉️ ${s.email}</div>
            <div>🕒 ${s.hours}</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" style="margin-top: 1rem;">Report Grievance for this Desk</button>
      `;
      card.querySelector('button').onclick = () => {
        navigateTo('submit');
      };
      grid.appendChild(card);
    });
  }

  function renderMaintenance() {
    const list = document.getElementById('maintenance-list');
    if (!list) return;
    list.innerHTML = '';
    maintenance.forEach((m) => {
      const item = document.createElement('div');
      item.className = 'card';
      item.style.marginBottom = '0.75rem';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
          <span class="status-tag status-inprogress">${m.status}</span>
          <span class="font-mono" style="font-size:0.72rem; color:var(--text-subtle);">Scheduled: ${m.date}</span>
        </div>
        <h3 style="font-size:1rem; font-weight:800; margin: 4px 0;">${m.title}</h3>
        <div style="font-size:0.75rem; color:var(--primary); font-weight:600; margin-bottom: 6px;">Area: ${m.area}</div>
        <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">${m.note}</p>
      `;
      list.appendChild(item);
    });

    const publishBtn = document.getElementById('publish-maint-btn');
    if (publishBtn) {
      publishBtn.onclick = () => {
        const title = prompt('Maintenance Title:');
        const area = prompt('Campus Area:');
        const note = prompt('Impact note & timing:');
        if (title && area) {
          maintenance.unshift({
            id: 'maint_' + Date.now(),
            title: title,
            area: area,
            date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
            note: note || 'Scheduled work.',
            created_by: currentUser.email,
            status: 'Scheduled',
          });
          saveAll();
          showToast('Maintenance notice published!');
          renderMaintenance();
        }
      };
    }
  }

  function renderAnnouncements() {
    const list = document.getElementById('announcements-list');
    if (!list) return;
    list.innerHTML = '';
    announcements.forEach((a) => {
      const item = document.createElement('div');
      item.className = 'card';
      item.style.marginBottom = '0.75rem';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
          <span style="font-size:0.72rem; font-weight:700; color:var(--primary);">Audience: ${(a.audience || 'ALL').toUpperCase()}</span>
          <span class="font-mono" style="font-size:0.72rem; color:var(--text-subtle);">${new Date(a.created_at).toLocaleDateString()}</span>
        </div>
        <h3 style="font-size:1.05rem; font-weight:800; margin-bottom: 4px;">${a.title}</h3>
        <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.5;">${a.message}</p>
      `;
      list.appendChild(item);
    });

    const publishBtn = document.getElementById('publish-ann-btn');
    if (publishBtn) {
      publishBtn.onclick = () => {
        const title = prompt('Notice Title:');
        const msg = prompt('Notice Content:');
        if (title && msg) {
          announcements.unshift({
            id: 'ann_' + Date.now(),
            title,
            message: msg,
            audience: 'all',
            created_at: new Date().toISOString(),
            created_by: currentUser.name,
          });
          saveAll();
          showToast('Campus notice published!');
          renderAnnouncements();
        }
      };
    }
  }

  function renderSearch() {
    const searchInput = document.getElementById('search-input');
    const catSelect = document.getElementById('search-cat');
    const prioSelect = document.getElementById('search-prio');
    const statusSelect = document.getElementById('search-status');
    const tbody = document.getElementById('search-table-body');
    if (!searchInput || !tbody) return;

    function applySearch() {
      const q = (searchInput.value || '').toLowerCase();
      const cat = catSelect ? catSelect.value : '';
      const prio = prioSelect ? prioSelect.value : '';
      const stat = statusSelect ? statusSelect.value : '';

      const filtered = complaints.filter((c) => {
        if (q && !c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.complaint_id.toLowerCase().includes(q)) return false;
        if (cat && c.category !== cat) return false;
        if (prio && c.priority !== prio) return false;
        if (stat && c.status !== stat) return false;
        return true;
      });

      tbody.innerHTML = '';
      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-subtle);">No matching complaints found.</td></tr>`;
        return;
      }
      filtered.forEach((c) => {
        const tr = document.createElement('tr');
        tr.onclick = () => navigateTo('complaint-detail', c.complaint_id);
        tr.innerHTML = `
          <td class="font-mono font-bold">${c.complaint_id}</td>
          <td>${c.title}</td>
          <td>${c.category} · ${c.department}</td>
          <td><span class="priority-${(c.priority || 'low').toLowerCase()}">${c.priority}</span></td>
          <td><span class="status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}">${c.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    searchInput.oninput = applySearch;
    if (catSelect) catSelect.onchange = applySearch;
    if (prioSelect) prioSelect.onchange = applySearch;
    if (statusSelect) statusSelect.onchange = applySearch;
    applySearch();
  }

  function renderWatchlist() {
    const watched = watchlist[currentUser.id] || [];
    const list = complaints.filter((c) => watched.includes(c.complaint_id));
    const tbody = document.getElementById('watchlist-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2.5rem; color:var(--text-subtle);">You haven’t pinned any complaints yet. Click "Watch Ticket" on any grievance to monitor it here.</td></tr>`;
      return;
    }
    list.forEach((c) => {
      const tr = document.createElement('tr');
      tr.onclick = () => navigateTo('complaint-detail', c.complaint_id);
      tr.innerHTML = `
        <td class="font-mono font-bold">${c.complaint_id}</td>
        <td>${c.title}</td>
        <td>${c.department}</td>
        <td><span class="status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}">${c.status}</span></td>
        <td style="text-align:right;"><button class="btn btn-outline btn-sm">Open</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderAssistant() {
    const input = document.getElementById('assistant-input');
    const msgList = document.getElementById('assistant-messages');
    const sendBtn = document.getElementById('assistant-send-btn');
    if (!sendBtn || !input || !msgList) return;

    sendBtn.onclick = () => {
      const q = (input.value || '').trim();
      if (!q) return;
      input.value = '';

      // Append user msg
      msgList.innerHTML += `<div class="chat-bubble mine" style="margin-bottom:0.75rem;">${q}</div>`;

      // Match answer
      let reply = 'CampusCare provides transparent grievance resolution under strict university SLAs: Critical (4h), High (12h), Medium (48h), and Low (120h). If your complaint passes the deadline, it is auto-escalated to the Dean of Student Affairs.';
      const lq = q.toLowerCase();
      if (lq.includes('sla') || lq.includes('deadline') || lq.includes('hours')) {
        reply = 'University SLA targets are: Critical hazards = 4 hours; High urgency = 12 hours; Medium = 48 hours; Low = 120 hours. All tickets carry live real-time countdown timers.';
      } else if (lq.includes('reopen') || lq.includes('not fixed') || lq.includes('verify')) {
        reply = 'CampusCare V3 enforces a Resolution Verification Loop. When staff marks a complaint as Resolved, you are asked to test the fix. You can either approve and rate the service, or reopen it with an explanation.';
      } else if (lq.includes('duplicate')) {
        reply = 'CampusCare uses real-time bigram similarity checking. If an issue in your block or class has already been logged, you will see a warning link to follow the existing ticket.';
      } else if (lq.includes('anonymous') || lq.includes('ragging') || lq.includes('privacy')) {
        reply = 'You can submit anonymous complaints using the checkbox on the New Grievance form. Your name will be hidden from normal views, while safety and harassment complaints trigger immediate high-priority alerts.';
      }

      setTimeout(() => {
        msgList.innerHTML += `<div class="chat-bubble theirs" style="margin-bottom:0.75rem;">${reply}</div>`;
        msgList.scrollTop = msgList.scrollHeight;
      }, 250);
    };
  }

  function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    users.forEach((u) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${u.name}</b><div style="font-size:0.72rem; color:var(--text-subtle);">${u.email}</div></td>
        <td style="text-transform: capitalize;">${(u.role || 'staff').replace('_', ' ')}</td>
        <td>${u.department}</td>
        <td><span class="status-tag ${u.active ? 'status-resolved' : 'status-escalated'}">${u.active ? 'Active' : 'Suspended'}</span></td>
        <td style="text-align:right;">
          ${u.email !== 'admin@campus.com' ? `<button class="btn btn-outline btn-sm toggle-user-btn" data-id="${u.id}">${u.active ? 'Deactivate' : 'Activate'}</button>` : ''}
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.toggle-user-btn').forEach((b) => {
      b.onclick = (e) => {
        const uid = e.target.getAttribute('data-id');
        const target = users.find((x) => x.id === uid);
        if (target) {
          target.active = !target.active;
          saveAll();
          showToast(`Updated status for ${target.name}.`);
          renderUsers();
        }
      };
    });
  }

  function renderAudit() {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    auditLogs.slice(0, 50).forEach((l) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-mono" style="font-size:0.72rem;">${new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
        <td>${l.user_email}</td>
        <td><b>${l.action}</b></td>
        <td class="font-mono font-bold" style="color:var(--primary);">${l.complaint_id}</td>
        <td style="font-size:0.74rem;">${l.detail}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderProfile() {
    const pName = document.getElementById('prof-name');
    if (pName) pName.value = currentUser.name || '';
    const pEmail = document.getElementById('prof-email');
    if (pEmail) pEmail.value = currentUser.email || '';
    const pDept = document.getElementById('prof-dept');
    if (pDept) pDept.value = currentUser.department || '';
    const pRole = document.getElementById('prof-role');
    if (pRole) pRole.value = (currentUser.role || '').replace('_', ' ').toUpperCase();

    const saveBtn = document.getElementById('profile-save-btn');
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.preventDefault();
        currentUser.name = (pName && pName.value.trim()) || currentUser.name;
        const idx = users.findIndex((u) => u.id === currentUser.id);
        if (idx !== -1) users[idx] = currentUser;
        saveAll();
        updateHeaderUser();
        showToast('Profile updated successfully!');
      };
    }

    const exportBtn = document.getElementById('profile-export-gdpr-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const studentComplaints = complaints.filter((c) => c.student_id === currentUser.id);
        const payload = {
          export_title: 'CampusCare V3 Student Personal Data Record',
          timestamp: new Date().toISOString(),
          user_profile: currentUser,
          complaints: studentComplaints,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `campuscare_data_${(currentUser.name || 'student').replace(/\s+/g, '_')}.json`;
        a.click();
      };
    }
  }

  // --- SVG QR Code Generator ---
  function openQrModal(c) {
    const modal = document.getElementById('qr-modal');
    if (!modal) return;
    const qId = document.getElementById('qr-modal-id');
    if (qId) qId.textContent = c.complaint_id;
    const qTitle = document.getElementById('qr-modal-title');
    if (qTitle) qTitle.textContent = c.title;

    // Generate crisp 25x25 QR SVG
    const size = 25;
    const hash = c.complaint_id.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 42);

    function isModule(r, col) {
      if (r < 7 && col < 7) {
        if (r === 0 || r === 6 || col === 0 || col === 6) return true;
        if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
        return false;
      }
      if (r < 7 && col >= size - 7) {
        const cc = col - (size - 7);
        if (r === 0 || r === 6 || cc === 0 || cc === 6) return true;
        if (r >= 2 && r <= 4 && cc >= 2 && cc <= 4) return true;
        return false;
      }
      if (r >= size - 7 && col < 7) {
        const rr = r - (size - 7);
        if (rr === 0 || rr === 6 || col === 0 || col === 6) return true;
        if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
        return false;
      }
      if (r === 6 || col === 6) return (r + col) % 2 === 0;
      return (r * 37 + col * 19 + hash + r * col) % 17 % 2 === 0;
    }

    let rects = '';
    for (let r = 0; r < size; r++) {
      for (let col = 0; col < size; col++) {
        if (isModule(r, col)) {
          rects += `<rect x="${col}" y="${r}" width="1" height="1" fill="#0f172a" />`;
        }
      }
    }

    const qrContainer = document.getElementById('qr-svg-container');
    if (qrContainer) {
      qrContainer.innerHTML = `
        <svg viewBox="0 0 ${size} ${size}" style="width:180px; height:180px; display:block;" shape-rendering="crispEdges">
          ${rects}
        </svg>
      `;
    }

    modal.classList.add('open');
  }

  // --- Initial Bindings ---
  function init() {
    try {
      // Theme setup
      const savedTheme = (function () {
        try { return localStorage.getItem(STORAGE_KEYS.THEME) || 'light'; } catch (e) { return 'light'; }
      })();
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');

      const themeBtn = document.getElementById('theme-toggle-btn');
      if (themeBtn) {
        themeBtn.onclick = () => {
          const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', current);
          if (current === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          try { localStorage.setItem(STORAGE_KEYS.THEME, current); } catch (e) {}
        };
      }

      // Role switcher dropdown toggle
      const roleBtn = document.getElementById('role-dropdown-btn');
      const roleMenu = document.getElementById('role-menu');
      if (roleBtn && roleMenu) {
        roleBtn.onclick = (e) => {
          e.stopPropagation();
          roleMenu.style.display = roleMenu.style.display === 'block' ? 'none' : 'block';
        };

        // Global click listener to close popups
        document.addEventListener('click', (e) => {
          if (!roleBtn.contains(e.target) && !roleMenu.contains(e.target)) {
            roleMenu.style.display = 'none';
          }
        });
      }

      // Sidebar auth button
      const sideAuthBtn = document.getElementById('side-link-auth');
      if (sideAuthBtn) {
        sideAuthBtn.onclick = () => {
          if (currentUser) {
            logoutUser();
          } else {
            navigateTo('login');
          }
        };
      }

      // Navigation triggers
      document.querySelectorAll('[data-view]').forEach((el) => {
        el.onclick = (e) => {
          e.preventDefault();
          const v = el.getAttribute('data-view');
          if (v) navigateTo(v);
        };
      });

      // QR Modal close
      document.querySelectorAll('.modal-close').forEach((b) => {
        b.onclick = () => {
          document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('open'));
        };
      });

      // Print tag button
      const printTagBtn = document.getElementById('qr-print-btn');
      if (printTagBtn) {
        printTagBtn.onclick = () => window.print();
      }

      updateHeaderUser();
      updateNotificationBadge();
      if (currentUser) {
        navigateTo('dashboard');
      } else {
        navigateTo('login');
      }
    } catch (err) {
      console.error('CampusCare initialization error:', err);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
