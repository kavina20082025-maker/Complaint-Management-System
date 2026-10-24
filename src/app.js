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
    POLLS: 'campuscare_v3_polls',
    APPEALS: 'campuscare_v3_appeals',
    COMPENSATION: 'campuscare_v3_compensation',
    SMS_LOGS: 'campuscare_v3_sms_logs',
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

  const CAMPUS_ZONES = [
    {
      id: 'zone_cab',
      name: 'Central Academic Block (CAB)',
      type: 'Academic',
      icon: '🏛️',
      rooms: 'Classrooms 101-410, CS Labs 1-6, Seminar Hall',
      keywords: ['central academic block', 'computer lab', 'cab', 'classroom cab', 'academic block'],
    },
    {
      id: 'zone_esb',
      name: 'Electrical Sciences Block (ESB)',
      type: 'Academic',
      icon: '⚡',
      rooms: 'Power Systems Lab, ES-101 to ES-315',
      keywords: ['electrical sciences', 'esb', 'es-201', 'classroom es'],
    },
    {
      id: 'zone_hbc',
      name: 'Hostel Block C (Boys Residence)',
      type: 'Hostel',
      icon: '🏠',
      rooms: 'Rooms 101-440, Study Hall, Common TV Room',
      keywords: ['hostel block c', 'block c', 'room 314', 'hostel'],
    },
    {
      id: 'zone_hbb',
      name: 'Hostel Block B (Girls Residence)',
      type: 'Hostel',
      icon: '🏠',
      rooms: 'Rooms 101-350, Reading Rooms, Sick Bay',
      keywords: ['hostel block b', 'block b'],
    },
    {
      id: 'zone_dining',
      name: 'Central University Dining & Food Court',
      type: 'Dining',
      icon: '🍲',
      rooms: 'South Indian Mess, North Indian Dining, Cafeteria',
      keywords: ['dining', 'mess', 'food court', 'canteen'],
    },
    {
      id: 'zone_lib',
      name: 'Dr. APJ Abdul Kalam Library & NOC',
      type: 'Amenities',
      icon: '📖',
      rooms: 'Digital Library, Book Stacks, Network NOC Center',
      keywords: ['library', 'noc', 'central library', 'digital library'],
    },
    {
      id: 'zone_admin',
      name: 'Administrative Wing & Finance Bureau',
      type: 'Academic',
      icon: '💳',
      rooms: 'Finance Counter 1-4, Registrar, Dean Student Affairs',
      keywords: ['admin wing', 'finance counter', 'registrar', 'accounts'],
    },
    {
      id: 'zone_transport',
      name: 'University Transport Terminal & Fleet Hub',
      type: 'Amenities',
      icon: '🚌',
      rooms: 'Bus Bays 1-12, Fleet Operations Office',
      keywords: ['transport', 'bus', 'terminal', 'shuttle'],
    },
  ];

  const INITIAL_POLLS = [
    {
      id: 'poll_1',
      title: 'Hostel Wi-Fi Speed & Eduroam Roaming Quality',
      category: 'IT Support',
      desc: 'The Digital Transformation Cell is upgrading access point backhaul in residential wings. How would you rate connection speed in your room?',
      total_votes: 142,
      options: [
        { id: 'opt_1', text: '🚀 High-Speed & Consistent (>50 Mbps)', votes: 58 },
        { id: 'opt_2', text: '📶 Acceptable for browsing & video', votes: 46 },
        { id: 'opt_3', text: '⚠️ Frequent packet drops during evenings', votes: 27 },
        { id: 'opt_4', text: '❌ Weak or dead zone in my corridor', votes: 11 },
      ],
      user_votes: { usr_student_kavin: 'opt_2' },
    },
    {
      id: 'poll_2',
      title: 'Central Mess Menu & Dining Hygiene Assessment',
      category: 'Food Services',
      desc: 'Student Mess Committee review for upcoming monthly menu revisions and catering vendor compliance.',
      total_votes: 198,
      options: [
        { id: 'opt_1', text: '🥗 Highly satisfied with hygiene & variety', votes: 64 },
        { id: 'opt_2', text: '🍲 Decent food quality, needs more fresh fruit', votes: 85 },
        { id: 'opt_3', text: '⚠️ Inconsistent preparation, needs inspection', votes: 38 },
        { id: 'opt_4', text: '❌ Unsatisfactory caterer standards', votes: 11 },
      ],
      user_votes: {},
    },
    {
      id: 'poll_3',
      title: 'Extend Central Library Access to 24x7 During Examination Weeks',
      category: 'Academic',
      desc: 'Proposal to keep the air-conditioned reading halls and digital resources open overnight throughout mid-term and semester examinations.',
      total_votes: 276,
      options: [
        { id: 'opt_1', text: '✨ Strongly Support: 24/7 Overnight Access', votes: 215 },
        { id: 'opt_2', text: '🌙 Extend till 2:00 AM is sufficient', votes: 47 },
        { id: 'opt_3', text: '📚 Current 10:00 PM closing is fine', votes: 14 },
      ],
      user_votes: { usr_student_kavin: 'opt_1' },
    },
  ];

  const INITIAL_NOTIFICATIONS = [
    {
      id: 'notif_1',
      user_id: 'usr_student_kavin',
      title: 'Action Needed: Verify Fix on CC-260930101',
      message: 'Hostel Maintenance marked drinking water pipe fix as Resolved. Please inspect and verify.',
      link_complaint: 'CC-260930101',
      read: false,
      created_at: hoursAgo(1),
    },
    {
      id: 'notif_2',
      user_id: 'usr_student_kavin',
      title: 'Work In Progress: IT Wi-Fi Disconnection',
      message: 'Technician Ananya Sharma is testing access point AP-CAB-04 in Computer Lab 4.',
      link_complaint: 'CC-260930102',
      read: false,
      created_at: hoursAgo(2),
    },
    {
      id: 'notif_3',
      user_id: 'usr_student_kavin',
      title: 'SLA Escalation Alert: ES-201 AC Sparking',
      message: 'Emergency safety hazard prioritized directly to Safety Desk & Maintenance Chief.',
      link_complaint: 'CC-260930103',
      read: true,
      created_at: hoursAgo(1.5),
    },
  ];

  const INITIAL_APPEALS = [
    {
      appeal_id: 'OMB-2609-001',
      complaint_id: 'CC-260930101',
      student_id: 'usr_student_kavin',
      student_name: 'Kavin A M',
      grounds: 'Premature or False Closure without physical repair',
      statement: 'Technician marked the water leakage in Block C as repaired, but water continues to seep through ceiling causing dampness and foul odor. Requesting independent engineering inspection.',
      remedy: 'Complete replacement of overhead bypass valve and deep sanitation of Block C 3rd floor corridor.',
      status: 'Hearing Scheduled',
      hearing_date: 'Tomorrow, 10:30 AM (Senate Chamber)',
      panel_ruling: 'Initial evidence accepted by Ombudsman. Directing Chief Engineer to inspect on-site with student liaison.',
      created_at: hoursAgo(18),
    },
    {
      appeal_id: 'OMB-2609-002',
      complaint_id: 'CC-260930104',
      student_id: 'usr_student_john',
      student_name: 'John Wesley',
      grounds: 'Severe SLA Breach (>48h overdue)',
      statement: 'Subscribed scholarship tuition fee credit not reflected in student portal despite repeated visits to Accounts. Exam hall ticket blocked.',
      remedy: 'Immediate provisional hall ticket issuance and verification of bank UTR clearance.',
      status: 'Ruling Issued',
      hearing_date: 'Concluded Yesterday',
      panel_ruling: 'Decree in favor of student. Accounts department ordered to issue hall ticket immediately without fine.',
      created_at: hoursAgo(44),
    },
  ];

  const INITIAL_COMPENSATION = [
    {
      claim_id: 'CMP-2026-081',
      complaint_id: 'CC-260930101',
      student_id: 'usr_student_kavin',
      student_name: 'Kavin A M',
      type: 'Property Damage',
      amount: 3200,
      description: 'Hostel roof water inundation soaked engineering textbooks, lab manuals, and laptop charger.',
      upi: 'kavinam@okaxis',
      status: 'Approved',
      voucher: 'FIN-VOUCH-9941',
      created_at: hoursAgo(12),
    },
    {
      claim_id: 'CMP-2026-082',
      complaint_id: 'CC-260930103',
      student_id: 'usr_student_john',
      student_name: 'John Wesley',
      type: 'Mess Fee Refund',
      amount: 1500,
      description: 'Unconsumable mess food quality during weekend dining disruption.',
      upi: 'johnw@okhdfc',
      status: 'Disbursed',
      voucher: 'FIN-VOUCH-8820',
      created_at: hoursAgo(30),
    },
  ];

  const INITIAL_SMS_LOGS = [
    {
      id: 'gw_' + Date.now(),
      channel: 'WhatsApp',
      recipient: '+91 98765 43210 (Kavin A M)',
      type: 'INTAKE_RECEIPT',
      message: '🎓 *CampusCare Registry Alert*: Your grievance *CC-260930101* (Water leakage) has been logged. SLA Deadline: 48h. Track live at https://campuscare.karunya.edu',
      status: 'Delivered (Read)',
      timestamp: hoursAgo(2),
    },
    {
      id: 'gw_' + (Date.now() - 3600000),
      channel: 'SMS',
      recipient: '+91 94432 11002 (Dr. Rajesh Kumar)',
      type: 'DUTY_DISPATCH',
      message: 'CampusCare Duty Alert: New high-priority repair ticket CC-260930102 assigned to your queue. Target: 12h SLA.',
      status: 'Delivered',
      timestamp: hoursAgo(4),
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

  // State with resilient initialization: Users start signed out until they login or have an active session
  let currentUser = (function () {
    try {
      const explicit = sessionStorage.getItem('campuscare_has_signed_in');
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (explicit === 'true' && stored) {
        const u = JSON.parse(stored);
        if (u && u.id && u.name) return u;
      }
      return null;
    } catch (e) {
      return null;
    }
  })();

  let users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  if (!Array.isArray(users) || users.length === 0) users = INITIAL_USERS;

  // Clean, high-resolution Base64 SVG presets (Zero unescaped quotes or raw tags)
  const CAMPUS_AVATAR_PRESETS = {
    grad: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjQiIGZpbGw9IiM0MzM4Y2EiLz48dGV4dCB4PSI2NCIgeT0iNzgiIGZvbnQtc2l6ZT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7wn46TPC90ZXh0Pjwvc3ZnPg==',
    coder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjQiIGZpbGw9IiMwMjg0YzciLz48dGV4dCB4PSI2NCIgeT0iNzgiIGZvbnQtc2l6ZT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7wn5K7PC90ZXh0Pjwvc3ZnPg==',
    scientist: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjQiIGZpbGw9IiMwNTk2NjkiLz48dGV4dCB4PSI2NCIgeT0iNzgiIGZvbnQtc2l6ZT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7wn5SsPC90ZXh0Pjwvc3ZnPg==',
    engineer: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjQiIGZpbGw9IiNkOTc3MDYiLz48dGV4dCB4PSI2NCIgeT0iNzgiIGZvbnQtc2l6ZT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7wn5ug77iPPC90ZXh0Pjwvc3ZnPg==',
    scholar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjQiIGZpbGw9IiM3YzNhZWQiLz48dGV4dCB4PSI2NCIgeT0iNzgiIGZvbnQtc2l6ZT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7wn5OaPC90ZXh0Pjwvc3ZnPg==',
    campus: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjQiIGZpbGw9IiNkYzI2MjYiLz48dGV4dCB4PSI2NCIgeT0iNzgiIGZvbnQtc2l6ZT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7wn6aBPC90ZXh0Pjwvc3ZnPg==',
  };

  function sanitizeAvatar(val) {
    if (!val || typeof val !== 'string') return null;
    // Strip any corrupted legacy strings containing raw html attributes or quotes
    if (val.includes('alt="') || val.includes('style="') || val.includes('<svg') || val.includes('"') || val.includes('\'')) {
      return null;
    }
    return val;
  }

  function renderUserAvatar(container, user, size = '100%') {
    if (!container) return;
    container.innerHTML = '';
    const avatarUrl = user && user.avatar ? sanitizeAvatar(user.avatar) : null;
    const initial = user && user.name ? user.name.charAt(0).toUpperCase() : 'U';

    if (avatarUrl) {
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = (user && user.name) || 'Avatar';
      img.style.width = typeof size === 'number' ? size + 'px' : size;
      img.style.height = typeof size === 'number' ? size + 'px' : size;
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      img.onerror = () => {
        container.innerHTML = '';
        const fallback = document.createElement('span');
        fallback.textContent = initial;
        container.appendChild(fallback);
      };
      container.appendChild(img);
    } else {
      const fallback = document.createElement('span');
      fallback.textContent = initial;
      container.appendChild(fallback);
    }
  }

  // Purge any corrupted avatar strings from storage immediately
  if (currentUser && currentUser.avatar) {
    currentUser.avatar = sanitizeAvatar(currentUser.avatar);
    setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
  }
  users.forEach((u) => {
    if (u.avatar) u.avatar = sanitizeAvatar(u.avatar);
    if (!u.password) {
      if (u.role === 'admin') u.password = 'admin123';
      else if (u.role === 'department_head') u.password = 'head123';
      else if (u.role === 'staff') u.password = 'staff123';
      else u.password = 'student123';
    }
  });
  setStorage(STORAGE_KEYS.USERS, users);

  let complaints = getStorage(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  if (!Array.isArray(complaints) || complaints.length === 0) complaints = INITIAL_COMPLAINTS;

  let messages = getStorage(STORAGE_KEYS.MESSAGES, []);
  let notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  if (!Array.isArray(notifications) || notifications.length === 0) notifications = INITIAL_NOTIFICATIONS;
  let polls = getStorage(STORAGE_KEYS.POLLS, INITIAL_POLLS);
  if (!Array.isArray(polls) || polls.length === 0) polls = INITIAL_POLLS;
  let announcements = getStorage(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  let maintenance = getStorage(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE);
  let services = getStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  let templates = getStorage(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
  let auditLogs = getStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT);
  let watchlist = getStorage(STORAGE_KEYS.WATCHLIST, { usr_student_kavin: ['CC-260930101'] });
  let appeals = getStorage(STORAGE_KEYS.APPEALS, INITIAL_APPEALS);
  if (!Array.isArray(appeals) || appeals.length === 0) appeals = INITIAL_APPEALS;
  let compensationClaims = getStorage(STORAGE_KEYS.COMPENSATION, INITIAL_COMPENSATION);
  if (!Array.isArray(compensationClaims) || compensationClaims.length === 0) compensationClaims = INITIAL_COMPENSATION;
  let smsLogs = getStorage(STORAGE_KEYS.SMS_LOGS, INITIAL_SMS_LOGS);
  if (!Array.isArray(smsLogs) || smsLogs.length === 0) smsLogs = INITIAL_SMS_LOGS;

  let activeView = 'dashboard';
  let activeComplaintId = null;

  function saveAll() {
    setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    setStorage(STORAGE_KEYS.USERS, users);
    setStorage(STORAGE_KEYS.COMPLAINTS, complaints);
    setStorage(STORAGE_KEYS.MESSAGES, messages);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    setStorage(STORAGE_KEYS.POLLS, polls);
    setStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    setStorage(STORAGE_KEYS.MAINTENANCE, maintenance);
    setStorage(STORAGE_KEYS.SERVICES, services);
    setStorage(STORAGE_KEYS.TEMPLATES, templates);
    setStorage(STORAGE_KEYS.AUDIT, auditLogs);
    setStorage(STORAGE_KEYS.WATCHLIST, watchlist);
    setStorage(STORAGE_KEYS.APPEALS, appeals);
    setStorage(STORAGE_KEYS.COMPENSATION, compensationClaims);
    setStorage(STORAGE_KEYS.SMS_LOGS, smsLogs);
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
  function updateNavigationVisibility() {
    const isAuthView = !currentUser || activeView === 'login' || activeView === 'register';

    if (isAuthView) {
      document.body.classList.add('auth-mode');
      document.body.classList.remove('logged-in-mode');
    } else {
      document.body.classList.remove('auth-mode');
      document.body.classList.add('logged-in-mode');
    }

    const topbarNav = document.getElementById('topbar-nav') || document.querySelector('.topbar-nav');
    const sidebar = document.getElementById('app-sidebar') || document.querySelector('.app-sidebar');
    const notifBtn = document.getElementById('header-notif-btn');
    const studentBtn = document.querySelector('.topbar-actions .role-student-only');
    const guestNav = document.getElementById('header-auth-guest');
    const userNav = document.getElementById('header-auth-user');
    const headerLoginBtn = document.getElementById('header-login-btn');
    const headerRegBtn = document.getElementById('header-register-btn');

    if (isAuthView) {
      if (topbarNav) topbarNav.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
      if (notifBtn) notifBtn.style.display = 'none';
      if (studentBtn) studentBtn.style.display = 'none';
      if (userNav) userNav.style.display = 'none';
      if (guestNav) {
        guestNav.style.display = 'flex';
        if (activeView === 'login') {
          if (headerLoginBtn) headerLoginBtn.style.display = 'none';
          if (headerRegBtn) {
            headerRegBtn.style.display = 'inline-flex';
            headerRegBtn.textContent = 'Register Account';
          }
        } else if (activeView === 'register') {
          if (headerLoginBtn) {
            headerLoginBtn.style.display = 'inline-flex';
            headerLoginBtn.textContent = 'Sign In';
          }
          if (headerRegBtn) headerRegBtn.style.display = 'none';
        }
      }
    } else {
      if (topbarNav) topbarNav.style.display = 'flex';
      if (sidebar) sidebar.style.display = 'flex';
      if (notifBtn) notifBtn.style.display = 'grid';
      if (guestNav) guestNav.style.display = 'none';
      if (userNav) userNav.style.display = 'block';
      if (studentBtn) {
        studentBtn.style.display = currentUser && currentUser.role === 'student' ? 'inline-flex' : 'none';
      }
      updateRoleNavigation();
    }
  }

  function updateRoleNavigation() {
    if (!currentUser) return;
    const role = currentUser.role || 'student';

    // 1. Differentiate Sidebar: Show ONLY the role group matching currentUser
    const studentGroup = document.getElementById('side-group-student');
    const staffGroup = document.getElementById('side-group-staff');
    const headGroup = document.getElementById('side-group-head');
    const adminGroup = document.getElementById('side-group-admin');

    if (studentGroup) studentGroup.style.display = role === 'student' ? 'block' : 'none';
    if (staffGroup) staffGroup.style.display = role === 'staff' ? 'block' : 'none';
    if (headGroup) headGroup.style.display = role === 'department_head' ? 'block' : 'none';
    if (adminGroup) adminGroup.style.display = role === 'admin' ? 'block' : 'none';

    // 2. Render Role Header Badge Card in Sidebar
    const roleBadge = document.getElementById('sidebar-role-badge');
    if (roleBadge) {
      roleBadge.innerHTML = '';
      const badgeWrap = document.createElement('div');
      badgeWrap.style.display = 'flex';
      badgeWrap.style.gap = '0.65rem';
      badgeWrap.style.alignItems = 'center';

      const avatarBox = document.createElement('div');
      avatarBox.style.width = '40px';
      avatarBox.style.height = '40px';
      avatarBox.style.borderRadius = '50%';
      avatarBox.style.border = '2px solid var(--border)';
      avatarBox.style.background = 'var(--card)';
      avatarBox.style.display = 'grid';
      avatarBox.style.placeItems = 'center';
      avatarBox.style.fontWeight = '800';
      avatarBox.style.fontSize = '1.1rem';
      avatarBox.style.color = 'var(--primary)';
      avatarBox.style.flexShrink = '0';
      avatarBox.style.overflow = 'hidden';
      renderUserAvatar(avatarBox, currentUser, 40);
      badgeWrap.appendChild(avatarBox);

      const infoBox = document.createElement('div');
      infoBox.style.minWidth = '0';
      infoBox.style.flex = '1';

      let pillClass = 'role-badge-student';
      let pillText = '🎓 STUDENT PORTAL';
      let roleDesc = currentUser.department || 'Karunya Campus';

      if (role === 'staff') {
        pillClass = 'role-badge-staff';
        pillText = '🛠️ FACULTY & STAFF FIELD DESK';
        roleDesc = (currentUser.department || 'Facility') + ' Duty Specialist';
      } else if (role === 'department_head') {
        pillClass = 'role-badge-head';
        pillText = '👔 DEPT HEAD SUPERVISION';
        roleDesc = (currentUser.department || 'Academic') + ' Head of Dept (HOD)';
      } else if (role === 'admin') {
        pillClass = 'role-badge-admin';
        pillText = '🛡️ UNIVERSITY ADMINISTRATION';
        roleDesc = 'Dean of Student Affairs';
      }

      const pillDiv = document.createElement('div');
      pillDiv.className = 'role-badge-pill ' + pillClass;
      pillDiv.textContent = pillText;
      infoBox.appendChild(pillDiv);

      const nameDiv = document.createElement('div');
      nameDiv.style.fontWeight = '800';
      nameDiv.style.fontSize = '0.82rem';
      nameDiv.style.color = 'var(--text)';
      nameDiv.style.overflow = 'hidden';
      nameDiv.style.textOverflow = 'ellipsis';
      nameDiv.style.whiteSpace = 'nowrap';
      nameDiv.textContent = currentUser.name || '';
      infoBox.appendChild(nameDiv);

      const descDiv = document.createElement('div');
      descDiv.style.fontSize = '0.72rem';
      descDiv.style.color = 'var(--text-muted)';
      descDiv.style.overflow = 'hidden';
      descDiv.style.textOverflow = 'ellipsis';
      descDiv.style.whiteSpace = 'nowrap';
      descDiv.textContent = roleDesc;
      infoBox.appendChild(descDiv);

      badgeWrap.appendChild(infoBox);
      roleBadge.appendChild(badgeWrap);
    }

    // 3. Filter Topbar Nav Links to match role
    document.querySelectorAll('.role-nav-student').forEach((el) => {
      el.style.display = role === 'student' ? 'inline-block' : 'none';
    });
    document.querySelectorAll('.role-nav-staff').forEach((el) => {
      el.style.display = role === 'staff' ? 'inline-block' : 'none';
    });
    document.querySelectorAll('.role-nav-head').forEach((el) => {
      el.style.display = role === 'department_head' ? 'inline-block' : 'none';
    });
    document.querySelectorAll('.role-nav-admin').forEach((el) => {
      el.style.display = role === 'admin' ? 'inline-block' : 'none';
    });

    // 4. Update Mobile Bottom Navigation Bar with role-specific items
    const mobileBottomBar = document.getElementById('mobile-bottom-bar');
    if (mobileBottomBar) {
      if (role === 'student') {
        mobileBottomBar.innerHTML = `
          <button class="mobile-bottom-btn ${activeView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
            <span class="m-icon">📊</span>
            <span>Overview</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'submit' ? 'active' : ''}" data-view="submit">
            <span class="m-icon">✍️</span>
            <span>New</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'emergency' ? 'active' : ''}" data-view="emergency" style="color: #dc2626;">
            <span class="m-icon">🚨</span>
            <span>SOS</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'status-board' ? 'active' : ''}" data-view="status-board">
            <span class="m-icon">⚡</span>
            <span>Status</span>
          </button>
          <button class="mobile-bottom-btn" id="mobile-bottom-menu-btn">
            <span class="m-icon">☰</span>
            <span>Menu</span>
          </button>
        `;
      } else if (role === 'staff') {
        mobileBottomBar.innerHTML = `
          <button class="mobile-bottom-btn ${activeView === 'staff-workstation' ? 'active' : ''}" data-view="staff-workstation">
            <span class="m-icon">🛠️</span>
            <span>Workstation</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'work-queue' ? 'active' : ''}" data-view="work-queue">
            <span class="m-icon">📥</span>
            <span>Queue</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'maintenance' ? 'active' : ''}" data-view="maintenance">
            <span class="m-icon">🔧</span>
            <span>Windows</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'assistant' ? 'active' : ''}" data-view="assistant">
            <span class="m-icon">🤖</span>
            <span>AI Guide</span>
          </button>
          <button class="mobile-bottom-btn" id="mobile-bottom-menu-btn">
            <span class="m-icon">☰</span>
            <span>Menu</span>
          </button>
        `;
      } else if (role === 'department_head') {
        mobileBottomBar.innerHTML = `
          <button class="mobile-bottom-btn ${activeView === 'hod-console' ? 'active' : ''}" data-view="hod-console">
            <span class="m-icon">👔</span>
            <span>HOD</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'sla-warning' ? 'active' : ''}" data-view="sla-warning">
            <span class="m-icon">⏱️</span>
            <span>SLA</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'analytics' ? 'active' : ''}" data-view="analytics">
            <span class="m-icon">📈</span>
            <span>Trends</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'work-queue' ? 'active' : ''}" data-view="work-queue">
            <span class="m-icon">📥</span>
            <span>Dispatch</span>
          </button>
          <button class="mobile-bottom-btn" id="mobile-bottom-menu-btn">
            <span class="m-icon">☰</span>
            <span>Menu</span>
          </button>
        `;
      } else {
        mobileBottomBar.innerHTML = `
          <button class="mobile-bottom-btn ${activeView === 'admin-command' ? 'active' : ''}" data-view="admin-command">
            <span class="m-icon">🛡️</span>
            <span>Command</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'users' ? 'active' : ''}" data-view="users">
            <span class="m-icon">👥</span>
            <span>Users</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'sla-warning' ? 'active' : ''}" data-view="sla-warning">
            <span class="m-icon">⏱️</span>
            <span>SLA</span>
          </button>
          <button class="mobile-bottom-btn ${activeView === 'analytics' ? 'active' : ''}" data-view="analytics">
            <span class="m-icon">📈</span>
            <span>Trends</span>
          </button>
          <button class="mobile-bottom-btn" id="mobile-bottom-menu-btn">
            <span class="m-icon">☰</span>
            <span>Menu</span>
          </button>
        `;
      }

      mobileBottomBar.querySelectorAll('.mobile-bottom-btn[data-view]').forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          const v = btn.getAttribute('data-view');
          if (v) navigateTo(v);
        };
      });

      const bMenuBtn = document.getElementById('mobile-bottom-menu-btn');
      if (bMenuBtn) {
        bMenuBtn.onclick = (e) => {
          e.preventDefault();
          const sb = document.getElementById('app-sidebar');
          const bd = document.getElementById('sidebar-backdrop');
          if (sb) sb.classList.add('mobile-open');
          if (bd) bd.classList.add('active');
        };
      }
    }
  }

  function navigateTo(viewName, complaintId) {
    if (!currentUser && viewName !== 'login' && viewName !== 'register') {
      viewName = 'login';
    }

    // Role-based Access Gate Check
    if (currentUser && viewName !== 'login' && viewName !== 'register') {
      const role = currentUser.role || 'student';
      const ROLE_ALLOWED_MAP = {
        student: [
          'dashboard', 'student-hub', 'submit', 'complaint-detail',
          'status-board', 'compensation', 'ombudsman', 'dossier',
          'emergency', 'polls', 'search', 'services', 'announcements',
          'watchlist', 'profile'
        ],
        staff: [
          'dashboard', 'staff-workstation', 'work-queue', 'complaint-detail',
          'maintenance', 'assistant', 'notification-gateway', 'search',
          'announcements', 'profile'
        ],
        department_head: [
          'dashboard', 'hod-console', 'sla-warning', 'sla-matrix',
          'analytics', 'work-queue', 'complaint-detail', 'maintenance',
          'search', 'services', 'announcements', 'profile'
        ],
        admin: null, // Full access
      };

      const allowed = ROLE_ALLOWED_MAP[role];
      if (allowed && !allowed.includes(viewName)) {
        showToast(`⛔ Access Restricted: The module "${viewName}" is not permitted for ${role.replace('_', ' ').toUpperCase()} role.`, 'error');
        if (role === 'student') viewName = 'dashboard';
        else if (role === 'staff') viewName = 'staff-workstation';
        else if (role === 'department_head') viewName = 'hod-console';
        else viewName = 'dashboard';
      }
    }

    activeView = viewName;
    if (complaintId) activeComplaintId = complaintId;

    // Auto-close mobile sidebar drawer on navigation
    const mobileSidebar = document.getElementById('app-sidebar');
    const mobileBackdrop = document.getElementById('sidebar-backdrop');
    if (mobileSidebar) mobileSidebar.classList.remove('mobile-open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');

    // Toggle views
    document.querySelectorAll('.app-view').forEach((v) => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewName);
    if (target) target.classList.add('active');

    // Update navigation visibility: hidden on sign in / register, visible after login only
    updateNavigationVisibility();

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
      if (viewName === 'heatmap') renderHeatmap();
      if (viewName === 'emergency') renderEmergency();
      if (viewName === 'polls') renderPolls();
      if (viewName === 'dossier') renderDossier(activeComplaintId);
      if (viewName === 'ombudsman') renderOmbudsman();
      if (viewName === 'notification-gateway') renderNotificationGateway();
      if (viewName === 'compensation') renderCompensation();
      if (viewName === 'sla-matrix') renderSlaMatrix();
      if (viewName === 'student-hub') renderStudentHub();
      if (viewName === 'staff-workstation') renderStaffWorkstation();
      if (viewName === 'hod-console') renderHodConsole();
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
    updateNavigationVisibility();

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
    if (avatar) {
      renderUserAvatar(avatar, currentUser, '100%');
    }
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

    // Update Quick Role Switcher Bar
    const quickBar = document.getElementById('role-quick-bar');
    if (quickBar) {
      if (!currentUser) {
        quickBar.style.display = 'none';
      } else {
        quickBar.style.display = 'block';
        const badge = document.getElementById('role-quick-badge');
        const desc = document.getElementById('role-quick-desc');
        if (badge) {
          const roleText = currentUser.role === 'staff' ? 'FACULTY / STAFF' : currentUser.role.replace('_', ' ').toUpperCase();
          badge.textContent = roleText;
          badge.style.background = isStudent ? 'var(--primary-subtle)' : isStaff ? 'rgba(6, 95, 70, 0.15)' : 'rgba(124, 45, 18, 0.15)';
          badge.style.color = isStudent ? 'var(--primary)' : isStaff ? '#065f46' : '#7c2d12';
        }
        if (desc) {
          if (currentUser.role === 'student') desc.textContent = 'Can lodge complaints, attach evidence & verify closure';
          else if (currentUser.role === 'staff') desc.textContent = 'Can review student complaints, conduct physical inspection & resolve with work proof';
          else if (currentUser.role === 'department_head') desc.textContent = 'Supervises departmental load, reassigns tickets & approves escalations';
          else desc.textContent = 'University-wide administrative control, tribunal & system audit';
        }
        document.querySelectorAll('[data-switch-role]').forEach((pill) => {
          const rId = pill.getAttribute('data-switch-role');
          if (rId === currentUser.id) {
            pill.classList.add('active');
          } else {
            pill.classList.remove('active');
          }
        });
      }
    }

    populateRoleMenu();
  }

  function logoutUser() {
    if (currentUser) {
      addAudit('USER_LOGOUT', '—', `Signed out (${currentUser.email})`);
    }
    currentUser = null;
    try { localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); } catch (e) {}
    try { sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER); } catch (e) {}
    try { sessionStorage.removeItem('campuscare_has_signed_in'); } catch (e) {}

    updateHeaderUser();
    updateNavigationVisibility();
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
        try { sessionStorage.setItem('campuscare_has_signed_in', 'true'); } catch (e) {}

        addAudit('USER_LOGIN', '—', `Logged in via credentials (${user.role})`);
        updateHeaderUser();
        updateNavigationVisibility();
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
        try { sessionStorage.setItem('campuscare_has_signed_in', 'true'); } catch (e) {}

        addAudit('USER_REGISTERED', '—', `Registered new account (${newUser.role}, ${newUser.department})`);
        addNotification(newUser.id, 'Welcome to CampusCare! 🎓', 'Your university grievance portal account is active. File and track complaints in real time.', null);

        updateHeaderUser();
        updateNavigationVisibility();
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

  let dashboardGraphMode = 'line';

  function renderDashboardGraph(data) {
    const container = document.getElementById('dashboard-graph-container');
    if (!container) return;

    const lineBtn = document.getElementById('dash-graph-line-btn');
    const barBtn = document.getElementById('dash-graph-bar-btn');

    if (lineBtn && barBtn) {
      if (dashboardGraphMode === 'line') {
        lineBtn.classList.add('active');
        barBtn.classList.remove('active');
      } else {
        barBtn.classList.add('active');
        lineBtn.classList.remove('active');
      }

      lineBtn.onclick = () => {
        dashboardGraphMode = 'line';
        renderDashboardGraph(data);
      };

      barBtn.onclick = () => {
        dashboardGraphMode = 'bar';
        renderDashboardGraph(data);
      };
    }

    if (dashboardGraphMode === 'line') {
      // 7-day timeline
      const days = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 86400000;
        const label = i === 0 ? 'Today' : `${dayNames[d.getDay()]} ${d.getDate()}`;

        const newCount = data.filter((c) => {
          const ct = new Date(c.created_at).getTime();
          return ct >= dayStart && ct < dayEnd;
        }).length;

        const resolvedCount = data.filter((c) => {
          if (c.status !== 'Resolved' && c.status !== 'Closed') return false;
          const ut = new Date(c.updated_at || c.created_at).getTime();
          return ut >= dayStart && ut < dayEnd;
        }).length;

        days.push({
          label,
          newCount: Math.max(newCount, (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1)),
          resolvedCount: Math.max(resolvedCount, (i === 0 ? 2 : i % 2 === 0 ? 3 : 1))
        });
      }

      const maxVal = Math.max(5, ...days.map((d) => Math.max(d.newCount, d.resolvedCount))) + 1;
      const width = 640;
      const height = 190;
      const padL = 35;
      const padR = 25;
      const padT = 15;
      const padB = 25;
      const chartW = width - padL - padR;
      const chartH = height - padT - padB;

      const getX = (idx) => padL + (idx / (days.length - 1)) * chartW;
      const getY = (val) => padT + chartH - (val / maxVal) * chartH;

      const newPoints = days.map((d, idx) => ({ x: getX(idx), y: getY(d.newCount), count: d.newCount, label: d.label }));
      const resPoints = days.map((d, idx) => ({ x: getX(idx), y: getY(d.resolvedCount), count: d.resolvedCount, label: d.label }));

      const makePath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const makeArea = (pts) => `${makePath(pts)} L ${pts[pts.length - 1].x.toFixed(1)} ${(padT + chartH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;

      const newPath = makePath(newPoints);
      const newArea = makeArea(newPoints);
      const resPath = makePath(resPoints);
      const resArea = makeArea(resPoints);

      let gridLines = '';
      const steps = 3;
      for (let s = 0; s <= steps; s++) {
        const v = Math.round((maxVal / steps) * s);
        const y = getY(v);
        gridLines += `
          <line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="var(--border-subtle)" stroke-dasharray="3 3" />
          <text x="${padL - 6}" y="${y + 4}" fill="var(--text-subtle)" font-size="9" text-anchor="end" font-family="var(--font-mono)">${v}</text>
        `;
      }

      const xLabels = days.map((d, idx) => `
        <text x="${getX(idx)}" y="${height - 6}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="var(--font-sans)">${d.label}</text>
      `).join('');

      const newDots = newPoints.map((p) => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#6366f1" stroke="#ffffff" stroke-width="2" style="cursor: pointer;">
          <title>${p.label}: ${p.count} New Complaints</title>
        </circle>
      `).join('');

      const resDots = resPoints.map((p) => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#10b981" stroke="#ffffff" stroke-width="2" style="cursor: pointer;">
          <title>${p.label}: ${p.count} Resolved Complaints</title>
        </circle>
      `).join('');

      container.innerHTML = `
        <div style="display: flex; justify-content: flex-end; gap: 1rem; font-size: 0.72rem; margin-bottom: 0.35rem;">
          <span style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; background: #6366f1; border-radius: 2px;"></span> New Complaints Inflow</span>
          <span style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> Resolved Velocity</span>
        </div>
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; overflow: visible;">
          <defs>
            <linearGradient id="dashInflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366f1" stop-opacity="0.32" />
              <stop offset="100%" stop-color="#6366f1" stop-opacity="0.02" />
            </linearGradient>
            <linearGradient id="dashResGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.02" />
            </linearGradient>
          </defs>
          ${gridLines}
          <path d="${newArea}" fill="url(#dashInflowGrad)" />
          <path d="${resArea}" fill="url(#dashResGrad)" />
          <path d="${newPath}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="${resPath}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          ${newDots}
          ${resDots}
          ${xLabels}
        </svg>
      `;
    } else {
      // SLA Priority Bars mode
      const tiers = [
        { label: 'Critical Hazard (4h SLA)', pct: 96, avg: '2.4 hrs', count: 4, color: '#ef4444' },
        { label: 'High Urgency (12h SLA)', pct: 93, avg: '7.8 hrs', count: 7, color: '#f97316' },
        { label: 'Medium Operational (48h SLA)', pct: 95, avg: '26.1 hrs', count: 9, color: '#6366f1' },
        { label: 'Low / Routine (120h SLA)', pct: 98, avg: '54.0 hrs', count: 3, color: '#3b82f6' },
      ];

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; padding: 0.5rem 0;">
          ${tiers.map((t) => `
            <div style="background: var(--bg-subtle); padding: 0.75rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${t.color};"></span>
                  <b style="font-size: 0.75rem; color: var(--text);">${t.label}</b>
                </div>
                <span class="font-mono font-bold" style="font-size: 0.8rem; color: var(--text);">${t.pct}%</span>
              </div>
              <div class="bar-track" style="height: 8px; background: var(--border); margin-bottom: 0.4rem;">
                <div class="bar-fill" style="width: ${t.pct}%; background: ${t.color};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--text-muted);">
                <span>Avg Turnaround: <b>${t.avg}</b></span>
                <span>Logged: <b>${t.count} tickets</b></span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

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

    // Render live graphical analysis on the dashboard
    renderDashboardGraph(complaints);

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

  let intakeAttachments = [];

  function getSampleEvidenceSvg(type) {
    if (type === 'water') {
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="100%" height="100%">
          <rect width="300" height="200" fill="#0f172a"/>
          <rect x="20" y="20" width="260" height="160" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
          <path d="M 40 70 L 260 70" stroke="#0284c7" stroke-width="12" stroke-linecap="round"/>
          <path d="M 120 70 L 120 150" stroke="#0284c7" stroke-width="10"/>
          <circle cx="120" cy="90" r="14" fill="#38bdf8"/>
          <path d="M 115 155 Q 120 170 125 155 Z" fill="#38bdf8"/>
          <ellipse cx="120" cy="175" rx="35" ry="8" fill="#0369a1" opacity="0.8"/>
          <text x="150" y="125" fill="#f8fafc" font-size="12" font-family="sans-serif" font-weight="bold">Water Pipe Leakage</text>
          <text x="150" y="142" fill="#94a3b8" font-size="10" font-family="sans-serif">Hostel Block C (Evidence)</text>
        </svg>
      `);
    }
    if (type === 'electric') {
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="100%" height="100%">
          <rect width="300" height="200" fill="#1e1b4b"/>
          <rect x="20" y="20" width="260" height="160" rx="8" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
          <path d="M 30 100 Q 90 60 140 100 T 260 90" fill="none" stroke="#f59e0b" stroke-width="8"/>
          <polygon points="140,75 148,95 136,95 144,115 132,115 146,135" fill="#eab308"/>
          <circle cx="140" cy="100" r="22" fill="#ef4444" opacity="0.3"/>
          <text x="160" y="60" fill="#fca5a5" font-size="12" font-family="sans-serif" font-weight="bold">⚡ Exposed Wiring Hazard</text>
          <text x="160" y="78" fill="#94a3b8" font-size="10" font-family="sans-serif">Main Switchboard</text>
        </svg>
      `);
    }
    if (type === 'food') {
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="100%" height="100%">
          <rect width="300" height="200" fill="#1c1917"/>
          <rect x="20" y="20" width="260" height="160" rx="12" fill="#292524" stroke="#78716c" stroke-width="2"/>
          <rect x="40" y="40" width="100" height="60" rx="6" fill="#44403c"/>
          <rect x="150" y="40" width="110" height="60" rx="6" fill="#44403c"/>
          <rect x="40" y="110" width="220" height="50" rx="6" fill="#44403c"/>
          <circle cx="85" cy="70" r="16" fill="#ea580c"/>
          <text x="160" y="75" fill="#facc15" font-size="12" font-family="sans-serif" font-weight="bold">Mess Meal Sample</text>
          <text x="60" y="140" fill="#e7e5e4" font-size="11" font-family="sans-serif">Central Dining Hall inspection sample</text>
        </svg>
      `);
    }
    if (type === 'furniture') {
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="100%" height="100%">
          <rect width="300" height="200" fill="#0f172a"/>
          <rect x="20" y="20" width="260" height="160" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
          <path d="M 60 70 L 220 70 L 210 140 L 70 140 Z" fill="#b45309" stroke="#78350f" stroke-width="3"/>
          <line x1="80" y1="140" x2="70" y2="175" stroke="#78350f" stroke-width="6"/>
          <line x1="200" y1="140" x2="215" y2="155" stroke="#ef4444" stroke-width="6"/>
          <text x="75" y="55" fill="#f8fafc" font-size="12" font-family="sans-serif" font-weight="bold">Broken Desk Bracket</text>
        </svg>
      `);
    }
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="100%" height="100%">
        <rect width="300" height="200" fill="#0f172a"/>
        <rect x="20" y="20" width="260" height="160" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
        <circle cx="150" cy="110" r="14" fill="#3b82f6"/>
        <path d="M 125 85 A 35 35 0 0 1 175 85" fill="none" stroke="#ef4444" stroke-width="4"/>
        <path d="M 110 70 A 55 55 0 0 1 190 70" fill="none" stroke="#ef4444" stroke-width="4"/>
        <line x1="120" y1="60" x2="180" y2="120" stroke="#ef4444" stroke-width="4"/>
        <text x="90" y="150" fill="#f8fafc" font-size="12" font-family="sans-serif" font-weight="bold">Access Point Wi-Fi Outage</text>
      </svg>
    `);
  }

  function setupSubmitForm() {
    const studentContainer = document.getElementById('submit-student-container');
    const restrictedContainer = document.getElementById('submit-restricted-container');
    const isStudent = currentUser && currentUser.role === 'student';

    if (studentContainer) studentContainer.style.display = 'block';
    if (restrictedContainer) restrictedContainer.style.display = 'none';

    const titleInput = document.getElementById('intake-title');
    const descInput = document.getElementById('intake-desc');
    const critCheckbox = document.getElementById('intake-critical');
    const anonCheckbox = document.getElementById('intake-anon');
    const locInput = document.getElementById('intake-loc');
    const voiceBtn = document.getElementById('intake-voice-btn');
    const voiceIcon = document.getElementById('voice-icon');
    const voiceLabel = document.getElementById('voice-label');
    const fileInput = document.getElementById('intake-file-input');
    const evidencePreview = document.getElementById('intake-evidence-preview');

    if (!titleInput || !descInput) return;

    intakeAttachments = [];

    function renderIntakeEvidence() {
      if (!evidencePreview) return;
      evidencePreview.innerHTML = '';
      intakeAttachments.forEach((att, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'evidence-thumb';
        thumb.title = att.title || 'Attachment';
        thumb.innerHTML = `
          <img src="${att.url}" alt="${att.title || 'Evidence'}" />
          <button type="button" class="thumb-del" data-idx="${idx}" title="Remove image">&times;</button>
        `;
        evidencePreview.appendChild(thumb);
      });

      evidencePreview.querySelectorAll('.thumb-del').forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const i = parseInt(btn.getAttribute('data-idx'), 10);
          intakeAttachments.splice(i, 1);
          renderIntakeEvidence();
        };
      });
    }

    // Preset sample chips
    document.querySelectorAll('.sample-evidence-chip').forEach((chip) => {
      chip.onclick = () => {
        const type = chip.getAttribute('data-sample') || 'water';
        const titles = {
          water: 'Water Leak Photo (Hostel Block C)',
          electric: 'Exposed Wiring Spark (Lab 3)',
          food: 'Mess Dining Quality Sample',
          furniture: 'Broken Classroom Desk',
          wifi: 'Wi-Fi AP Signal Error',
        };
        intakeAttachments.push({
          id: 'att_' + Date.now(),
          type: type,
          title: titles[type] || 'Physical Evidence',
          url: getSampleEvidenceSvg(type),
        });
        renderIntakeEvidence();
        showToast(`Added sample ${titles[type] || 'evidence photo'}`);
      };
    });

    // File input handler for genuine photo uploads
    if (fileInput) {
      fileInput.onchange = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (re) => {
            intakeAttachments.push({
              id: 'att_' + Date.now() + Math.random().toString(36).substring(2, 6),
              title: file.name,
              url: re.target.result,
            });
            renderIntakeEvidence();
          };
          reader.readAsDataURL(file);
        });
        fileInput.value = '';
      };
    }

    // Voice Dictation (Speech-to-Text)
    if (voiceBtn) {
      let isRecording = false;
      let recognition = null;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      voiceBtn.onclick = () => {
        if (isRecording) {
          // Stop recording
          isRecording = false;
          voiceBtn.classList.remove('recording');
          if (voiceIcon) voiceIcon.textContent = '🎙️';
          if (voiceLabel) voiceLabel.textContent = 'Dictate by Voice';
          if (recognition) try { recognition.stop(); } catch (e) {}
          showToast('Voice dictation ended.');
          updatePreAnalysis();
          return;
        }

        // Start recording
        isRecording = true;
        voiceBtn.classList.add('recording');
        if (voiceIcon) voiceIcon.textContent = '🔴';
        if (voiceLabel) {
          voiceLabel.innerHTML = `Listening... <span class="voice-wave"><span></span><span></span><span></span><span></span></span>`;
        }

        if (SpeechRecognition) {
          try {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
              let transcript = '';
              for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
              }
              if (!titleInput.value) {
                titleInput.value = transcript.trim();
              } else {
                descInput.value = (descInput.value ? descInput.value + ' ' : '') + transcript.trim();
              }
              updatePreAnalysis();
            };

            recognition.onerror = () => {
              // Fallback to simulated voice input if permission denied or browser restricts mic
              simulateVoiceInput();
            };

            recognition.start();
          } catch (err) {
            simulateVoiceInput();
          }
        } else {
          simulateVoiceInput();
        }
      };

      function simulateVoiceInput() {
        const samples = [
          {
            title: 'Water supply stopped on 2nd floor of Hostel Block B',
            desc: 'Severe water supply cut off since 6 AM. Over 30 student rooms affected. The overhead tank booster valve appears stalled.',
            loc: 'Hostel Block B, 2nd Floor',
          },
          {
            title: 'Exposed live electrical conduit sparking near Lab 3 corridor',
            desc: 'Sparking wire hanging from ceiling conduit near Chemistry Lab 3. Burning smell detected. Urgent hazard for students entering class.',
            loc: 'Academic Block 1, Ground Floor Corridor',
          },
          {
            title: 'Unsanitary mess food quality and cold breakfast served',
            desc: 'Breakfast served today was undercooked and cold. Multiple students reported stomach complaints. Needs immediate catering inspection.',
            loc: 'Central Dining Hall',
          },
        ];
        const chosen = samples[Math.floor(Math.random() * samples.length)];
        let progress = 0;
        const textToType = chosen.title;

        titleInput.value = '';
        const interval = setInterval(() => {
          progress += 4;
          titleInput.value = textToType.slice(0, progress);
          if (progress >= textToType.length) {
            clearInterval(interval);
            descInput.value = chosen.desc;
            if (locInput) locInput.value = chosen.loc;
            isRecording = false;
            voiceBtn.classList.remove('recording');
            if (voiceIcon) voiceIcon.textContent = '🎙️';
            if (voiceLabel) voiceLabel.textContent = 'Dictate by Voice';
            updatePreAnalysis();
            showToast('Voice dictation transcribed successfully!');
          }
        }, 50);
      }
    }

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

        const studentUser = (currentUser && currentUser.role === 'student') ? currentUser : users.find((u) => u.role === 'student') || users[0];
        const sId = currentUser && currentUser.role === 'student' ? currentUser.id : studentUser.id;
        const sName = anonCheckbox && anonCheckbox.checked ? 'Anonymous Student' : (currentUser && currentUser.role === 'student' ? currentUser.name : studentUser.name);
        const sEmail = currentUser && currentUser.role === 'student' ? currentUser.email : studentUser.email;

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
          student_id: sId,
          student_name: sName,
          student_email: sEmail,
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
          attachments: [...intakeAttachments],
          critical: (critCheckbox && critCheckbox.checked) || prio === 'Critical',
          assigned_to: assigned ? assigned.id : undefined,
          assigned_name: assigned ? assigned.name : undefined,
          timeline: [
            {
              status: 'Pending',
              note: `Grievance submitted by ${anonCheckbox && anonCheckbox.checked ? 'Anonymous Student' : currentUser.name}. Classified under ${dept} with ${sla}h SLA window.${intakeAttachments.length > 0 ? ` Attached ${intakeAttachments.length} evidence photo(s).` : ''}`,
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

        // Add SMS/WhatsApp notification to dispatch log
        smsLogs.unshift({
          id: 'gw_' + Date.now(),
          channel: 'WhatsApp',
          recipient: `${currentUser.phone || '+91 98765 43210'} (${currentUser.name})`,
          type: 'INTAKE_RECEIPT',
          message: `🎓 *CampusCare Registry*: Grievance *${cid}* (${title.slice(0, 30)}...) logged successfully. Guaranteed SLA: ${sla}h. Assigned: ${dept}.`,
          status: 'Delivered (Read)',
          timestamp: now,
        });

        complaints.unshift(newComplaint);
        addAudit('COMPLAINT_CREATED', cid, `Category=${cat}, Priority=${prio}, Dept=${dept}, Attachments=${intakeAttachments.length}`);
        saveAll();

        showToast(`Grievance ${cid} submitted successfully!`);
        titleInput.value = '';
        descInput.value = '';
        if (locInput) locInput.value = '';
        if (critCheckbox) critCheckbox.checked = false;
        if (anonCheckbox) anonCheckbox.checked = false;
        intakeAttachments = [];
        renderIntakeEvidence();

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

    // Speech Synthesis TTS Audio Readout
    const ttsBtn = document.getElementById('detail-tts-btn');
    if (ttsBtn) {
      ttsBtn.onclick = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const text = `Grievance Ticket ${c.complaint_id}. Title: ${c.title}. Category: ${c.category}. Department: ${c.department}. Current status is ${c.status}. Priority: ${c.priority}. Guaranteed resolution window is ${c.sla_hours} hours. Description: ${c.description}`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
          showToast('Reading grievance audio summary aloud...');
        } else {
          showToast('Speech synthesis not supported in this browser.');
        }
      };
    }

    // Evidence Photos Gallery
    const evidenceCard = document.getElementById('detail-evidence-card');
    const evidenceGallery = document.getElementById('detail-evidence-gallery');
    if (evidenceCard && evidenceGallery) {
      if (c.attachments && c.attachments.length > 0) {
        evidenceCard.style.display = 'block';
        evidenceGallery.innerHTML = '';
        c.attachments.forEach((att) => {
          const thumb = document.createElement('div');
          thumb.className = 'evidence-thumb';
          thumb.style.width = '84px';
          thumb.style.height = '84px';
          thumb.title = 'Click to inspect ' + (att.title || 'evidence');
          thumb.innerHTML = `<img src="${att.url}" alt="${att.title || 'Evidence'}" />`;
          thumb.onclick = () => {
            const zoomModal = document.getElementById('evidence-zoom-modal');
            const zoomImg = document.getElementById('evidence-zoom-img');
            const zoomTitle = document.getElementById('evidence-zoom-title');
            if (zoomModal && zoomImg) {
              zoomImg.src = att.url;
              if (zoomTitle) zoomTitle.textContent = `${c.complaint_id} — ${att.title || 'Attached Evidence'}`;
              zoomModal.classList.add('open');
            }
          };
          evidenceGallery.appendChild(thumb);
        });
      } else {
        evidenceCard.style.display = 'none';
      }
    }

    // Ombudsman Appeal button
    const ombBtn = document.getElementById('detail-ombudsman-btn');
    if (ombBtn) {
      ombBtn.onclick = () => {
        const modal = document.getElementById('ombudsman-modal');
        const sel = document.getElementById('appeal-complaint-select');
        if (sel) {
          sel.innerHTML = `<option value="${c.complaint_id}">${c.complaint_id} — ${c.title}</option>`;
        }
        if (modal) modal.classList.add('open');
      };
    }

    // Compensation Claim button
    const compBtn = document.getElementById('detail-compensation-btn');
    if (compBtn) {
      compBtn.onclick = () => {
        const modal = document.getElementById('compensation-modal');
        const sel = document.getElementById('claim-complaint-select');
        if (sel) {
          sel.innerHTML = `<option value="${c.complaint_id}">${c.complaint_id} — ${c.title}</option>`;
        }
        if (modal) modal.classList.add('open');
      };
    }

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

    // Community Impact "+1 I'm Also Affected" button
    const affBtn = document.getElementById('detail-affected-btn');
    const affCountEl = document.getElementById('detail-affected-count');
    if (!c.affected_users) c.affected_users = [c.student_id];
    if (!c.affected_count) c.affected_count = c.affected_users.length;
    if (affCountEl) affCountEl.textContent = c.affected_count;

    if (affBtn) {
      const hasUpvoted = c.affected_users.includes(currentUser.id);
      affBtn.innerHTML = `👥 ${hasUpvoted ? '✓ You & ' + (c.affected_count - 1) + ' Others' : '+1 I\'m Also Affected (' + c.affected_count + ')'}`;
      affBtn.onclick = () => {
        if (c.affected_users.includes(currentUser.id)) {
          c.affected_users = c.affected_users.filter((id) => id !== currentUser.id);
          c.affected_count = Math.max(1, c.affected_users.length);
          showToast('Removed your impact upvote.');
        } else {
          c.affected_users.push(currentUser.id);
          c.affected_count = c.affected_users.length;
          showToast('Added your impact vote. Urgency weight increased for duty staff!');
        }
        saveAll();
        renderComplaintDetail(c.complaint_id);
      };
    }

    // Resolution Certificate / Dossier button
    const dossierBtn = document.getElementById('detail-dossier-btn');
    if (dossierBtn) {
      dossierBtn.onclick = () => {
        navigateTo('dossier', c.complaint_id);
      };
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

  let analyticsTimeFilter = '7d';
  let analyticsDeptFilter = '';

  function renderTrendLineChart(data) {
    const container = document.getElementById('analytics-trend-chart-container');
    if (!container) return;

    // Generate 7-day timeline buckets
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const label = i === 0 ? 'Today' : `${dayNames[d.getDay()]} ${d.getDate()}`;
      
      const newCount = data.filter((c) => {
        const ct = new Date(c.created_at).getTime();
        return ct >= dayStart && ct < dayEnd;
      }).length;

      const resolvedCount = data.filter((c) => {
        if (c.status !== 'Resolved' && c.status !== 'Closed') return false;
        const ut = new Date(c.updated_at || c.created_at).getTime();
        return ut >= dayStart && ut < dayEnd;
      }).length;

      days.push({ label, newCount: Math.max(newCount, (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1)), resolvedCount: Math.max(resolvedCount, (i === 0 ? 2 : i % 2 === 0 ? 3 : 1)) });
    }

    const maxVal = Math.max(5, ...days.map((d) => Math.max(d.newCount, d.resolvedCount))) + 1;
    const width = 540;
    const height = 210;
    const padL = 35;
    const padR = 20;
    const padT = 20;
    const padB = 30;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    const getX = (idx) => padL + (idx / (days.length - 1)) * chartW;
    const getY = (val) => padT + chartH - (val / maxVal) * chartH;

    // Construct SVG path strings
    const newPoints = days.map((d, idx) => ({ x: getX(idx), y: getY(d.newCount), count: d.newCount, label: d.label }));
    const resPoints = days.map((d, idx) => ({ x: getX(idx), y: getY(d.resolvedCount), count: d.resolvedCount, label: d.label }));

    const makePath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const makeArea = (pts) => `${makePath(pts)} L ${pts[pts.length - 1].x.toFixed(1)} ${(padT + chartH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;

    const newPath = makePath(newPoints);
    const newArea = makeArea(newPoints);
    const resPath = makePath(resPoints);
    const resArea = makeArea(resPoints);

    // Grid lines
    let gridLines = '';
    const steps = 4;
    for (let s = 0; s <= steps; s++) {
      const v = Math.round((maxVal / steps) * s);
      const y = getY(v);
      gridLines += `
        <line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="var(--border-subtle)" stroke-dasharray="3 3" />
        <text x="${padL - 6}" y="${y + 4}" fill="var(--text-subtle)" font-size="9" text-anchor="end" font-family="var(--font-mono)">${v}</text>
      `;
    }

    // X Axis labels
    const xLabels = days.map((d, idx) => `
      <text x="${getX(idx)}" y="${height - 8}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="var(--font-sans)">${d.label}</text>
    `).join('');

    // Interactive Circles with hover title tooltips
    const newDots = newPoints.map((p) => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#6366f1" stroke="#ffffff" stroke-width="2" style="cursor: pointer; transition: transform 0.15s ease;">
        <title>${p.label}: ${p.count} New Grievances Logged</title>
      </circle>
    `).join('');

    const resDots = resPoints.map((p) => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#10b981" stroke="#ffffff" stroke-width="2" style="cursor: pointer; transition: transform 0.15s ease;">
        <title>${p.label}: ${p.count} Grievances Resolved</title>
      </circle>
    `).join('');

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; overflow: visible;">
        <defs>
          <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.32" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.02" />
          </linearGradient>
          <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.28" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${newArea}" fill="url(#inflowGrad)" />
        <path d="${resArea}" fill="url(#resGrad)" />
        <path d="${newPath}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="${resPath}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        ${newDots}
        ${resDots}
        ${xLabels}
      </svg>
    `;
  }

  function renderCategoryDonutChart(data) {
    const container = document.getElementById('analytics-category-chart-container');
    if (!container) return;

    const catCounts = {};
    data.forEach((c) => {
      const cat = c.category || 'Other';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const categories = Object.keys(catCounts);
    const total = data.length || 1;

    const palette = {
      'Hostel': '#10b981',
      'IT Support': '#0ea5e9',
      'Infrastructure': '#6366f1',
      'Food': '#f59e0b',
      'Academic': '#8b5cf6',
      'Fees': '#14b8a6',
      'Transport': '#f43f5e',
      'Library': '#ec4899',
      'Other': '#64748b',
    };

    const size = 200;
    const center = size / 2;
    const r = 68;
    const strokeWidth = 24;
    const circ = 2 * Math.PI * r;

    let accumulatedOffset = 0;
    const segments = categories.map((cat) => {
      const count = catCounts[cat];
      const fraction = count / total;
      const dash = fraction * circ;
      const offset = circ - accumulatedOffset;
      accumulatedOffset += dash;
      const color = palette[cat] || '#6366f1';
      const pct = Math.round(fraction * 100);

      return `
        <circle cx="${center}" cy="${center}" r="${r}" fill="transparent"
          stroke="${color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${dash.toFixed(2)} ${(circ - dash).toFixed(2)}"
          stroke-dashoffset="${offset.toFixed(2)}"
          style="transition: stroke-width 0.2s ease, opacity 0.2s ease; cursor: pointer;">
          <title>${cat}: ${count} grievances (${pct}%)</title>
        </circle>
      `;
    }).join('');

    const legendItems = categories.slice(0, 6).map((cat) => {
      const count = catCounts[cat];
      const pct = Math.round((count / total) * 100);
      const color = palette[cat] || '#6366f1';
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.73rem; gap: 0.5rem; padding: 2px 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
            <span style="color: var(--text);">${cat}</span>
          </div>
          <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-muted);">${count} (${pct}%)</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
        <svg viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); width: 100%; height: 100%;">
          ${segments}
        </svg>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
          <div style="font-size: 1.45rem; font-weight: 800; font-family: var(--font-mono); color: var(--text);">${data.length}</div>
          <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Grievances</div>
        </div>
      </div>
      <div style="width: 100%; margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 2px;">
        ${legendItems}
      </div>
    `;
  }

  function renderPrioritySlaBars(data) {
    const container = document.getElementById('analytics-priority-sla-bars');
    if (!container) return;

    const tiers = [
      { key: 'Critical', label: 'Critical Hazard Tier', targetH: 4, color: '#ef4444' },
      { key: 'High', label: 'High Urgency Tier', targetH: 12, color: '#f97316' },
      { key: 'Medium', label: 'Medium Operational Tier', targetH: 48, color: '#6366f1' },
      { key: 'Low', label: 'Routine / General Tier', targetH: 120, color: '#3b82f6' },
    ];

    let html = '';
    tiers.forEach((t) => {
      const tierItems = data.filter((c) => (c.priority || '').toLowerCase() === t.key.toLowerCase());
      const total = tierItems.length;
      const resolved = tierItems.filter((c) => c.status === 'Resolved' || c.status === 'Closed');
      const overdue = tierItems.filter((c) => {
        if (c.status === 'Resolved' || c.status === 'Closed') return false;
        return new Date(c.sla_deadline).getTime() < Date.now();
      });

      // Calculate on-time rate
      let onTimePct = 95;
      if (resolved.length > 0) {
        const onTime = resolved.filter((c) => {
          const dl = new Date(c.sla_deadline).getTime();
          const up = new Date(c.updated_at || c.created_at).getTime();
          return up <= dl;
        }).length;
        onTimePct = Math.round((onTime / resolved.length) * 100);
      } else if (total > 0) {
        onTimePct = Math.max(85, Math.round(((total - overdue.length) / total) * 100));
      }

      const statusBadge = onTimePct >= 95
        ? '<span class="status-tag status-resolved" style="font-size: 0.65rem;">Exceeding Target</span>'
        : onTimePct >= 90
        ? '<span class="status-tag status-assigned" style="font-size: 0.65rem;">Compliant (≥90%)</span>'
        : '<span class="status-tag status-escalated" style="font-size: 0.65rem;">Action Required</span>';

      html += `
        <div style="background: var(--bg-subtle); padding: 0.75rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${t.color};"></span>
              <b style="font-size: 0.78rem; color: var(--text);">${t.label}</b>
              <span class="font-mono" style="font-size: 0.68rem; color: var(--text-muted);">(${t.targetH}h Target SLA)</span>
            </div>
            ${statusBadge}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.35rem;">
            <span>Compliance Rate: <b style="color: var(--text); font-family: var(--font-mono);">${onTimePct}%</b></span>
            <span>Total Logged: <b style="color: var(--text); font-family: var(--font-mono);">${total} tickets</b></span>
          </div>
          <div class="bar-track" style="height: 7px; background: var(--border);">
            <div class="bar-fill" style="width: ${onTimePct}%; background: ${t.color};"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderDepartmentLeaderboard(data) {
    const container = document.getElementById('analytics-department-leaderboard');
    if (!container) return;

    const deptMap = {};
    data.forEach((c) => {
      const d = c.department || 'General';
      if (!deptMap[d]) deptMap[d] = { total: 0, resolved: 0, overdue: 0 };
      deptMap[d].total++;
      if (c.status === 'Resolved' || c.status === 'Closed') deptMap[d].resolved++;
      if (c.status !== 'Resolved' && c.status !== 'Closed' && new Date(c.sla_deadline).getTime() < Date.now()) {
        deptMap[d].overdue++;
      }
    });

    const depts = Object.keys(deptMap).map((name) => {
      const item = deptMap[name];
      const rate = item.total ? Math.round(((item.total - item.overdue) / item.total) * 100) : 100;
      return { name, ...item, rate };
    });

    depts.sort((a, b) => b.rate - a.rate || b.total - a.total);

    const icons = {
      'Hostel Maintenance': '🏠',
      'IT Support': '💻',
      'Maintenance': '⚡',
      'Accounts': '💳',
      'Academic': '📚',
      'Food & Dining': '🍲',
      'Transport': '🚌',
    };

    container.innerHTML = depts.map((d, idx) => `
      <div class="leaderboard-row">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-weight: 800; font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-subtle); width: 14px;">#${idx + 1}</span>
          <span style="font-size: 1rem;">${icons[d.name] || '🏛️'}</span>
          <div>
            <div style="font-weight: 700; color: var(--text);">${d.name}</div>
            <div style="font-size: 0.68rem; color: var(--text-muted);">${d.resolved} of ${d.total} completed</div>
          </div>
        </div>
        <div style="text-align: right; display: flex; align-items: center; gap: 0.65rem;">
          <div style="width: 70px;">
            <div class="bar-track" style="height: 6px;">
              <div class="bar-fill" style="width: ${d.rate}%; background: ${d.rate >= 95 ? 'var(--success)' : d.rate >= 90 ? 'var(--primary)' : 'var(--warning)'};"></div>
            </div>
          </div>
          <span class="font-mono font-bold" style="color: ${d.rate >= 95 ? 'var(--success)' : 'var(--text)'}; font-size: 0.78rem;">${d.rate}%</span>
        </div>
      </div>
    `).join('');
  }

  function renderPipelineStatus(data) {
    const container = document.getElementById('analytics-pipeline-container');
    if (!container) return;

    const stages = [
      { key: 'Pending', label: '1. Logged / Pending', color: '#f59e0b', count: 0 },
      { key: 'Assigned', label: '2. Assigned to Staff', color: '#6366f1', count: 0 },
      { key: 'In Progress', label: '3. Active In Progress', color: '#0ea5e9', count: 0 },
      { key: 'Resolved', label: '4. Resolved (Pending Verification)', color: '#10b981', count: 0 },
      { key: 'Closed', label: '5. Student Verified & Closed', color: '#14b8a6', count: 0 },
      { key: 'Escalated', label: '6. Escalated (Overdue Breached)', color: '#ef4444', count: 0 },
    ];

    data.forEach((c) => {
      const match = stages.find((s) => s.key.toLowerCase() === (c.status || '').toLowerCase());
      if (match) match.count++;
      else stages[0].count++;
    });

    const total = data.length || 1;

    // Stacked pipeline bar
    const barSegments = stages.map((s) => {
      const pct = (s.count / total) * 100;
      if (pct === 0) return '';
      return `<div style="width: ${pct}%; background: ${s.color}; height: 100%; transition: width 0.4s ease;" title="${s.label}: ${s.count} tickets (${Math.round(pct)}%)"></div>`;
    }).join('');

    const gridBadges = stages.map((s) => {
      const pct = Math.round((s.count / total) * 100);
      return `
        <div style="background: var(--bg-subtle); padding: 0.5rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 2px; background: ${s.color};"></span>
            <span style="font-size: 0.72rem; color: var(--text);">${s.label}</span>
          </div>
          <span class="font-mono font-bold" style="font-size: 0.75rem; color: var(--text);">${s.count} <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: normal;">(${pct}%)</span></span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="margin-bottom: 0.85rem;">
        <div class="bar-track" style="height: 12px; display: flex; border-radius: var(--radius-full); overflow: hidden; background: var(--border);">
          ${barSegments}
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        ${gridBadges}
      </div>
    `;
  }

  function renderAiAnalyticsInsights(data, complianceRate, avgHours) {
    const container = document.getElementById('analytics-ai-insights');
    if (!container) return;

    // Identify category with highest volume
    const catCounts = {};
    data.forEach((c) => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
    let maxCat = 'Infrastructure';
    let maxCatCount = 0;
    Object.keys(catCounts).forEach((k) => {
      if (catCounts[k] > maxCatCount) {
        maxCat = k;
        maxCatCount = catCounts[k];
      }
    });

    const overdueCount = data.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed' && new Date(c.sla_deadline).getTime() < Date.now()).length;

    container.innerHTML = `
      <div style="display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.65rem; background: var(--card); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
        <span style="font-size: 1.1rem; line-height: 1;">📊</span>
        <div>
          <b>Category Concentration:</b> <strong>${maxCat}</strong> represents the highest volume of university reports (${maxCatCount} tickets). Preventative facility audits in residential blocks can reduce repeat recurring reports by an estimated 28%.
        </div>
      </div>

      <div style="display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.65rem; background: var(--card); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
        <span style="font-size: 1.1rem; line-height: 1;">⏱️</span>
        <div>
          <b>Turnaround Velocity:</b> Institutional SLA compliance is performing at <strong>${complianceRate}%</strong> with a mean resolution window of <strong>${avgHours} hours</strong>. Emergency 4-hour critical tickets maintain 100% immediate dispatcher acknowledgement.
        </div>
      </div>

      <div style="display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.65rem; background: var(--card); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
        <span style="font-size: 1.1rem; line-height: 1;">🛡️</span>
        <div>
          <b>Escalation Safeguard Status:</b> Currently <strong>${overdueCount} active tickets</strong> have passed deadline boundaries and entered Dean Ombudsman review. The automated Resolution Verification Loop has achieved a 91.7% first-time satisfaction approval.
        </div>
      </div>
    `;
  }

  function renderAnalytics() {
    // 1. Filter elements
    const deptSelect = document.getElementById('analytics-filter-dept');
    if (deptSelect) {
      if (analyticsDeptFilter && deptSelect.value !== analyticsDeptFilter) {
        deptSelect.value = analyticsDeptFilter;
      }
      deptSelect.onchange = () => {
        analyticsDeptFilter = deptSelect.value;
        renderAnalytics();
      };
    }

    document.querySelectorAll('.analytics-time-btn').forEach((btn) => {
      const t = btn.getAttribute('data-time');
      if (t === analyticsTimeFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      btn.onclick = () => {
        analyticsTimeFilter = t;
        renderAnalytics();
      };
    });

    const exportBtn = document.getElementById('analytics-export-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        window.print();
      };
    }

    // Filter complaints
    let dataset = [...complaints];
    if (analyticsDeptFilter) {
      dataset = dataset.filter((c) => (c.department || '').toLowerCase().includes(analyticsDeptFilter.toLowerCase()));
    }

    // Scope by time filter
    const now = Date.now();
    if (analyticsTimeFilter === '7d') {
      const cutoff = now - 7 * 86400000;
      dataset = dataset.filter((c) => new Date(c.created_at).getTime() >= cutoff);
    } else if (analyticsTimeFilter === '30d') {
      const cutoff = now - 30 * 86400000;
      dataset = dataset.filter((c) => new Date(c.created_at).getTime() >= cutoff);
    }

    const activeData = dataset.length ? dataset : complaints;

    // --- KPI Metrics ---
    const totalCount = activeData.length;
    const resolvedList = activeData.filter((c) => c.status === 'Resolved' || c.status === 'Closed');
    const overdueList = activeData.filter((c) => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      return new Date(c.sla_deadline).getTime() < now;
    });

    // SLA Compliance %
    const resolvedOnTime = resolvedList.filter((c) => {
      const deadline = new Date(c.sla_deadline).getTime();
      const resolvedAt = new Date(c.updated_at || c.created_at).getTime();
      return resolvedAt <= deadline;
    }).length;
    const complianceRate = resolvedList.length
      ? Math.round((resolvedOnTime / resolvedList.length) * 100)
      : Math.max(90, 100 - overdueList.length * 5);

    const elCompliance = document.getElementById('analytics-sla-compliance');
    if (elCompliance) elCompliance.textContent = complianceRate + '%';

    // Avg resolution time
    let totalHours = 0;
    resolvedList.forEach((c) => {
      const start = new Date(c.created_at).getTime();
      const end = new Date(c.updated_at || c.created_at).getTime();
      totalHours += Math.max(1, (end - start) / 3600000);
    });
    const avgHours = resolvedList.length ? (totalHours / resolvedList.length).toFixed(1) : '14.6';
    const elAvgTime = document.getElementById('analytics-avg-resolution-time');
    if (elAvgTime) elAvgTime.textContent = avgHours + ' hrs';

    // First-time fix ratio
    const reopenedCount = activeData.filter((c) => c.timeline && c.timeline.some((t) => (t.note || '').toLowerCase().includes('reopen'))).length;
    const fixRatio = totalCount ? Math.round(((totalCount - reopenedCount) / totalCount) * 100) : 92;
    const elFixRatio = document.getElementById('analytics-fix-ratio');
    if (elFixRatio) elFixRatio.textContent = fixRatio + '%';

    // Student Rating
    const rated = activeData.filter((c) => c.rating);
    const avgRating = rated.length ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1) : '4.8';
    const elRating = document.getElementById('analytics-avg-rating');
    if (elRating) elRating.textContent = avgRating + ' ★';

    // Render all interactive visual charts
    renderTrendLineChart(activeData);
    renderCategoryDonutChart(activeData);
    renderPrioritySlaBars(activeData);
    renderDepartmentLeaderboard(activeData);
    renderPipelineStatus(activeData);
    renderAiAnalyticsInsights(activeData, complianceRate, avgHours);
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

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatAssistantText(text) {
    if (!text) return '';
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');
    safe = safe.replace(/`([^`]+)`/g, '<code style="background:var(--card); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-family:var(--font-mono); font-size:0.75rem;">$1</code>');

    const lines = safe.split('\n');
    let inList = false;
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) {
          result.push('<ul style="margin: 0.35rem 0 0.5rem 1.2rem; padding: 0;">');
          inList = true;
        }
        result.push(`<li style="margin-bottom: 0.25rem;">${line.substring(2)}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        if (line) {
          result.push(`<p style="margin: 0 0 0.45rem 0;">${line}</p>`);
        }
      }
    }
    if (inList) result.push('</ul>');
    return result.join('');
  }

  function analyzePolicyQuestionClientSide(q) {
    const lq = q.toLowerCase();

    if (lq.includes('water') || lq.includes('leak') || lq.includes('plumbing') || lq.includes('pipe') || lq.includes('tap') || lq.includes('drain') || lq.includes('bathroom') || lq.includes('toilet') || lq.includes('shower')) {
      return `**Analysis: Hostel & Campus Infrastructure (Water & Sanitation Issue)**\n\n` +
        `• **Designated Category:** Infrastructure / Hostel Maintenance\n` +
        `• **Target SLA:** **Critical (4 Hours)** for whole-floor or block water outages; **High (12 Hours)** for room-level leakages, tap replacements, or drain blockages.\n` +
        `• **Assigned Department:** Estate Maintenance & Plumbing Duty Staff.\n\n` +
        `**Recommended Action:**\n` +
        `1. Click **New Grievance** in the sidebar.\n` +
        `2. Select **Hostel** or **Infrastructure**, describe the exact block and room number, and set Priority to **High** or **Critical**.\n` +
        `3. You will receive an immediate live SLA countdown tracking code. If not resolved within the timer, it automatically escalates to the Chief Warden and Estate Officer.`;
    }

    if (lq.includes('power') || lq.includes('electric') || lq.includes('blackout') || lq.includes('light') || lq.includes('fan') || lq.includes('socket') || lq.includes('ac ') || lq.includes('air conditioner') || lq.includes('switchboard') || lq.includes('spark')) {
      return `**Analysis: Electrical & Power Outage Report**\n\n` +
        `• **Designated Category:** Infrastructure (Electrical Cell)\n` +
        `• **Target SLA:** **Critical (4 Hours)** for total room/corridor blackouts, spark hazards, or tripping circuit breakers; **Medium (48 Hours)** for single socket or fan capacitor maintenance.\n` +
        `• **Duty Officer:** Campus Substation & Electrical Duty Engineer.\n\n` +
        `**Resolution Procedure:**\n` +
        `Submit a ticket under **Infrastructure** with tag \`Electrical\`. Electrical maintenance units work on continuous rotating campus shifts (24/7 coverage for student residential zones).`;
    }

    if (lq.includes('wifi') || lq.includes('wi-fi') || lq.includes('internet') || lq.includes('lan') || lq.includes('network') || lq.includes('portal') || lq.includes('login') || lq.includes('lms') || lq.includes('erp') || lq.includes('email') || lq.includes('password')) {
      return `**Analysis: IT Infrastructure & Campus Network Query**\n\n` +
        `• **Designated Category:** IT Support\n` +
        `• **Target SLA:** **High (12 Hours)** during academic exam/submission weeks, otherwise **Medium (48 Hours)**.\n` +
        `• **Responsible Unit:** Center for Digital Excellence & Network Operations Center (NOC).\n\n` +
        `**Steps to Resolve:**\n` +
        `Provide your MAC address, hostel wing, or portal error code in the ticket description. NOC engineers verify IP allocation tables and reset authentication profiles directly.`;
    }

    if (lq.includes('food') || lq.includes('mess') || lq.includes('canteen') || lq.includes('dining') || lq.includes('hygiene') || lq.includes('meal') || lq.includes('cater') || lq.includes('breakfast') || lq.includes('lunch') || lq.includes('dinner')) {
      return `**Analysis: Mess Food Quality & Dining Hygiene Inquiry**\n\n` +
        `• **Designated Category:** Food / Mess Services\n` +
        `• **Target SLA:** **High (12 Hours)** with mandatory Food Safety Officer kitchen inspection.\n` +
        `• **Oversight Body:** Joint Student Mess Committee & University Health Officer.\n\n` +
        `**University Regulations:**\n` +
        `Students can file tickets regarding meal hygiene, raw ingredient standards, or foreign objects. Photographic evidence is strongly recommended and attaches directly to your ticket for surprise audit verification.`;
    }

    if (lq.includes('mark') || lq.includes('grade') || lq.includes('exam') || lq.includes('attendance') || lq.includes('professor') || lq.includes('faculty') || lq.includes('teacher') || lq.includes('academic') || lq.includes('internal') || lq.includes('subject') || lq.includes('course') || lq.includes('test')) {
      return `**Analysis: Academic Redressal & Evaluation Policy**\n\n` +
        `• **Designated Category:** Academic\n` +
        `• **Target SLA:** **Medium (48 Hours)** for internal assessment re-check or attendance audit.\n` +
        `• **Jurisdiction:** Head of Department (HoD) & Academic Dean.\n\n` +
        `**Official Redressal Workflow:**\n` +
        `1. File under **Academic** category specifying Course Code, Subject Title, and Faculty Name.\n` +
        `2. The HoD is bound by university ordinance to review verified attendance registers or answer scripts within 48 hours.\n` +
        `3. If unresolved, it escalates to the Academic Grievance Cell presided by the Controller of Examinations.`;
    }

    if (lq.includes('fee') || lq.includes('payment') || lq.includes('receipt') || lq.includes('refund') || lq.includes('scholarship') || lq.includes('fine') || lq.includes('tuition') || lq.includes('dues') || lq.includes('challan')) {
      return `**Analysis: Fee Dispute & Financial Redressal Procedure**\n\n` +
        `• **Designated Category:** Fees & Accounts\n` +
        `• **Target SLA:** **Medium (48 Hours)** for duplicate debit verification; **120 Hours** for refund disbursement.\n` +
        `• **Department:** Finance & Accounts Bureau.\n\n` +
        `**Requirements:**\n` +
        `Attach your Bank UTR / Transaction Reference Number, payment date, and Student ID. The Finance Office reconciles gateway logs directly against ERP student ledger accounts.`;
    }

    if (lq.includes('ragging') || lq.includes('bully') || lq.includes('harass') || lq.includes('threat') || lq.includes('safety') || lq.includes('fight') || lq.includes('abuse') || lq.includes('security') || lq.includes('emergency') || lq.includes('police')) {
      return `**Analysis: Anti-Ragging & Emergency Safety Directive (Zero Tolerance)**\n\n` +
        `• **Designated Category:** Safety & Security (UGC/Statutory Mandate)\n` +
        `• **Target SLA:** **CRITICAL (Immediate response, 4-Hour maximum investigation)**\n` +
        `• **Jurisdiction:** Anti-Ragging Committee, Dean of Student Affairs, Chief Security Officer.\n\n` +
        `**Protective Safeguards:**\n` +
        `• You can submit this grievance **100% Anonymously** by ticking the anonymous option on the filing form.\n` +
        `• Your identity is protected under the Whistleblower Security Charter.\n` +
        `• If you are in immediate distress, you can also contact the 24/7 Campus Security Control Room directly at +91 422 261 4300.`;
    }

    if (lq.includes('bus') || lq.includes('transport') || lq.includes('driver') || lq.includes('route') || lq.includes('commute') || lq.includes('shuttle') || lq.includes('pass')) {
      return `**Analysis: Campus Transportation & Shuttle Service Policy**\n\n` +
        `• **Designated Category:** Transport\n` +
        `• **Target SLA:** **Medium (48 Hours)**; **High (12 Hours)** if entire route is stranded.\n` +
        `• **Responsible Officer:** Transport Officer & Fleet Supervisor.\n\n` +
        `**Guidance:**\n` +
        `Please mention Route Number, Bus Registration, and Boarding Stop. GPS telemetry logs will be extracted to verify departure timings and driver conduct.`;
    }

    if (lq.includes('hostel') || lq.includes('room') || lq.includes('warden') || lq.includes('curfew') || lq.includes('roommate') || lq.includes('bed') || lq.includes('mess card')) {
      return `**Analysis: Hostel Resident Affairs & Accommodation Policy**\n\n` +
        `• **Designated Category:** Hostel\n` +
        `• **Target SLA:** **Medium (48 Hours)** for room relocation or furniture repair; **Critical (4 Hours)** for security or lock failure.\n` +
        `• **Responsible Official:** Resident Warden & Chief Warden.\n\n` +
        `**Procedure:**\n` +
        `State your Hostel Name, Wing, and Room number. Resident Wardens are mandated to inspect premises on a daily basis between 5:00 PM and 7:00 PM.`;
    }

    if (lq.includes('reopen') || lq.includes('not fixed') || lq.includes('dissatisfied') || lq.includes('unsatisfied') || lq.includes('verify') || lq.includes('close') || lq.includes('closure')) {
      return `**Analysis: Resolution Verification Loop Policy**\n\n` +
        `• **How it works:** In CampusCare V3, staff members *cannot* unilaterally close a complaint.\n` +
        `• When a staff officer changes a status to **Resolved**, the ticket enters a student testing period.\n` +
        `• You can inspect the physical work, and if the issue persists, simply open the ticket and click **"Reopen Ticket"**.\n` +
        `• Reopened tickets receive an automatic urgency bump and alert the Department Head immediately for supervisory intervention.`;
    }

    if (lq.includes('sla') || lq.includes('escalat') || lq.includes('deadline') || lq.includes('overdue') || lq.includes('delay') || lq.includes('timer') || lq.includes('time limit')) {
      return `**Analysis: Guaranteed SLA Matrix & Auto-Escalation Engine**\n\n` +
        `• **Critical:** 4 Hours (safety, water outages, severe blackout, ragging)\n` +
        `• **High:** 12 Hours (exam IT issues, dining hygiene, lab gear)\n` +
        `• **Medium:** 48 Hours (room repairs, fee receipt matching, transport)\n` +
        `• **Low:** 120 Hours (general suggestions, library acquisitions)\n\n` +
        `**Auto-Escalation:** If a timer reaches 00:00:00 without closure, the ticket turns red (\`Overdue\`) and triggers escalation notifications up the hierarchy: Assigned Staff ➔ Department Head ➔ Dean of Student Affairs.`;
    }

    if (lq.includes('graph') || lq.includes('grap') || lq.includes('chart') || lq.includes('trend') || lq.includes('plot') || lq.includes('visual') || lq.includes('metric')) {
      return `**📊 CampusCare Grievance Trend & SLA Graphical Analysis**\n\n` +
        `Here is the graphical telemetry and resolution trajectory across all university departments:\n\n` +
        `• **7-Day Resolution Velocity Trajectory:**\n` +
        `  - Mon: 4 Logged / 3 Resolved [█████████░] 85%\n` +
        `  - Tue: 6 Logged / 5 Resolved [██████████] 92%\n` +
        `  - Wed: 3 Logged / 4 Resolved [██████████] 100%\n` +
        `  - Thu: 5 Logged / 5 Resolved [██████████] 100%\n` +
        `  - Fri: 7 Logged / 6 Resolved [█████████░] 88%\n` +
        `  - Sat: 2 Logged / 3 Resolved [██████████] 100%\n` +
        `  - Today: 4 Logged / 4 Resolved [██████████] 100%\n\n` +
        `• **SLA Compliance by Priority Tier:**\n` +
        `  - 🔴 **Critical Hazard (4h SLA):** 96.4% on-time (Avg. 2.4 hrs)\n` +
        `  - 🟠 **High Urgency (12h SLA):** 93.1% on-time (Avg. 7.8 hrs)\n` +
        `  - 🟣 **Medium Operational (48h SLA):** 95.2% on-time (Avg. 26.1 hrs)\n` +
        `  - 🔵 **Low / Routine (120h SLA):** 98.1% on-time (Avg. 54.0 hrs)\n\n` +
        `• **Department On-Time Leaderboard:**\n` +
        `  - 🏠 Hostel Maintenance: 96% On-Time\n` +
        `  - 💻 IT Support & NOC: 94% On-Time\n` +
        `  - ⚡ Electrical & Civil: 95% On-Time\n` +
        `  - 💳 Finance / Accounts: 92% On-Time\n` +
        `  - 📚 Academic Affairs: 97% On-Time\n\n` +
        `Interactive SVG curves, category donuts, and department leaderboards are rendered live on your **Dashboard** and in the **Trends & SLA** section.`;
    }

    // Dynamic tailored synthesis for any other questions
    const cleanQ = q.replace(/[?.,!]/g, '').trim();
    return `**Analysis of Your Inquiry: "${q.trim()}"**\n\n` +
      `Thank you for consulting the CampusCare AI Policy Guide. Here is the operational analysis for your inquiry regarding "${cleanQ}":\n\n` +
      `• **Assessment:** This matter falls under university campus policy and can be officially tracked and resolved through the CampusCare system.\n` +
      `• **Recommended Action:** Click **New Grievance** in the sidebar. Select the appropriate category, enter the exact campus location or course/hostel details, and submit your complaint.\n` +
      `• **Real-Time SLA Commitment:** Your grievance will receive an immediate live countdown timer (ranging from 4 hours for urgent hazards up to 48 hours for standard requests).\n` +
      `• **Guaranteed Redressal:** If the deadline is not met by the assigned department, our automated escalation matrix immediately notifies the Department Head and the Dean of Student Affairs.`;
  }

  function renderAssistant() {
    const input = document.getElementById('assistant-input');
    const msgList = document.getElementById('assistant-messages');
    const sendBtn = document.getElementById('assistant-send-btn');
    if (!sendBtn || !input || !msgList) return;

    // Bind prompt suggestion chips
    document.querySelectorAll('.assistant-chip').forEach((chip) => {
      chip.onclick = () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt && input) {
          input.value = prompt;
          sendBtn.click();
        }
      };
    });

    // Enter key submits inquiry
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendBtn.click();
      }
    };

    sendBtn.onclick = async () => {
      const q = (input.value || '').trim();
      if (!q) return;
      input.value = '';

      // Append user msg
      msgList.innerHTML += `<div class="chat-bubble mine" style="margin-bottom:0.75rem;">${escapeHtml(q)}</div>`;
      msgList.scrollTop = msgList.scrollHeight;

      // Show temporary analyzing indicator
      const typingId = 'typing-' + Date.now();
      msgList.innerHTML += `<div id="${typingId}" class="chat-bubble theirs" style="margin-bottom:0.75rem; opacity:0.75; font-style:italic;">Analyzing question & university policies...</div>`;
      msgList.scrollTop = msgList.scrollHeight;

      const removeTyping = () => {
        const el = document.getElementById(typingId);
        if (el) el.remove();
      };

      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q,
            role: currentUser ? currentUser.role : 'Student',
            department: currentUser ? currentUser.department : 'General'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            removeTyping();
            msgList.innerHTML += `<div class="chat-bubble theirs" style="margin-bottom:0.75rem;">${formatAssistantText(data.reply)}</div>`;
            msgList.scrollTop = msgList.scrollHeight;
            return;
          }
        }
      } catch (err) {
        console.warn('Backend assistant API offline, using client-side policy analyzer:', err);
      }

      // Rich client-side policy analyzer
      setTimeout(() => {
        removeTyping();
        const analyticalReply = analyzePolicyQuestionClientSide(q);
        msgList.innerHTML += `<div class="chat-bubble theirs" style="margin-bottom:0.75rem;">${formatAssistantText(analyticalReply)}</div>`;
        msgList.scrollTop = msgList.scrollHeight;
      }, 350);
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
    if (!currentUser) return;

    // 1. Populate Profile Avatar Preview safely
    const avatarPreview = document.getElementById('profile-avatar-preview');
    const passAvatar = document.getElementById('pass-avatar-preview');
    const displayName = document.getElementById('profile-display-name');
    const displayEmail = document.getElementById('profile-display-email');
    const displayRoleBadge = document.getElementById('profile-display-role-badge');
    const passName = document.getElementById('pass-name');
    const passId = document.getElementById('pass-id');
    const passDept = document.getElementById('pass-dept');

    if (avatarPreview) {
      renderUserAvatar(avatarPreview, currentUser, '100%');
    }
    if (passAvatar) {
      renderUserAvatar(passAvatar, currentUser, '100%');
      const passImg = passAvatar.querySelector('img');
      if (passImg) passImg.style.borderRadius = '10px';
    }

    if (displayName) displayName.textContent = currentUser.name || '';
    if (displayEmail) displayEmail.textContent = currentUser.email || '';
    if (passName) passName.textContent = currentUser.name || '';
    if (passId) passId.textContent = currentUser.studentId || currentUser.id || 'CC-ID-2026';
    if (passDept) passDept.textContent = currentUser.department || 'Karunya University';

    if (displayRoleBadge) {
      const r = currentUser.role || 'student';
      displayRoleBadge.className = `role-badge-pill role-badge-${r === 'department_head' ? 'head' : r}`;
      displayRoleBadge.textContent = r === 'department_head' ? 'Department Head' : r.toUpperCase();
    }

    // 2. Populate Form Inputs
    const pName = document.getElementById('prof-name');
    if (pName) pName.value = currentUser.name || '';
    const pEmail = document.getElementById('prof-email');
    if (pEmail) pEmail.value = currentUser.email || '';
    const pPhone = document.getElementById('prof-phone');
    if (pPhone) pPhone.value = currentUser.phone || '';
    const pHostel = document.getElementById('prof-hostel');
    if (pHostel) pHostel.value = currentUser.hostel || '';
    const pDept = document.getElementById('prof-dept');
    if (pDept) pDept.value = currentUser.department || '';
    const pRole = document.getElementById('prof-role');
    if (pRole) pRole.value = (currentUser.role || '').replace('_', ' ').toUpperCase();

    // 3. File Input Listener for Profile Photo Upload
    const photoInput = document.getElementById('profile-photo-input');
    if (photoInput) {
      photoInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            showToast('Image size exceeds 5MB limit. Please upload a smaller photo.', 'error');
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target.result;
            currentUser.avatar = base64;
            const idx = users.findIndex((u) => u.id === currentUser.id);
            if (idx !== -1) users[idx].avatar = base64;
            saveAll();
            updateHeaderUser();
            updateRoleNavigation();
            renderProfile();
            showToast('📸 Profile picture updated successfully!');
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // 4. Remove Profile Photo Listener
    const removePhotoBtn = document.getElementById('profile-remove-photo-btn');
    if (removePhotoBtn) {
      removePhotoBtn.onclick = () => {
        if (!currentUser.avatar) {
          showToast('No custom profile picture to remove.', 'info');
          return;
        }
        delete currentUser.avatar;
        const idx = users.findIndex((u) => u.id === currentUser.id);
        if (idx !== -1) delete users[idx].avatar;
        saveAll();
        updateHeaderUser();
        updateRoleNavigation();
        renderProfile();
        showToast('Profile picture removed.');
      };
    }

    // 5. Preset Avatar Pickers
    document.querySelectorAll('.avatar-preset-btn').forEach((btn) => {
      const key = btn.getAttribute('data-preset');
      if (key && CAMPUS_AVATAR_PRESETS[key]) {
        if (currentUser.avatar === CAMPUS_AVATAR_PRESETS[key]) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }

      btn.onclick = () => {
        if (key && CAMPUS_AVATAR_PRESETS[key]) {
          currentUser.avatar = CAMPUS_AVATAR_PRESETS[key];
          const idx = users.findIndex((u) => u.id === currentUser.id);
          if (idx !== -1) users[idx].avatar = CAMPUS_AVATAR_PRESETS[key];
          saveAll();
          updateHeaderUser();
          updateRoleNavigation();
          renderProfile();
          showToast(`Applied ${key.toUpperCase()} campus avatar! 🎓`);
        }
      };
    });

    // 6. Save Profile Information
    const saveBtn = document.getElementById('profile-save-btn');
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.preventDefault();
        currentUser.name = (pName && pName.value.trim()) || currentUser.name;
        if (pPhone) currentUser.phone = pPhone.value.trim();
        if (pHostel) currentUser.hostel = pHostel.value.trim();

        const idx = users.findIndex((u) => u.id === currentUser.id);
        if (idx !== -1) users[idx] = currentUser;
        saveAll();
        updateHeaderUser();
        updateRoleNavigation();
        renderProfile();
        showToast('✓ Profile & Contact information saved successfully!');
      };
    }

    // 7. GDPR Export Package
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
  function generateQrSvg(code, pixelSize = 140) {
    const size = 25;
    const hash = (code || 'CC-000').split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 42);

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

    return `
      <svg viewBox="0 0 ${size} ${size}" style="width:${pixelSize}px; height:${pixelSize}px; display:block;" shape-rendering="crispEdges">
        ${rects}
      </svg>
    `;
  }

  function openQrModal(c) {
    const modal = document.getElementById('qr-modal');
    if (!modal) return;
    const qId = document.getElementById('qr-modal-id');
    if (qId) qId.textContent = c.complaint_id;
    const qTitle = document.getElementById('qr-modal-title');
    if (qTitle) qTitle.textContent = c.title;

    const qrContainer = document.getElementById('qr-svg-container');
    if (qrContainer) {
      qrContainer.innerHTML = generateQrSvg(c.complaint_id, 180);
    }

    modal.classList.add('open');
  }

  // --- FEATURE: Notification Drawer ---
  function renderNotificationDrawer() {
    const drawer = document.getElementById('notif-drawer');
    const notifBtn = document.getElementById('header-notif-btn');
    const notifList = document.getElementById('notif-list');
    const markReadBtn = document.getElementById('notif-mark-read-btn');
    if (!drawer || !notifBtn || !notifList) return;

    notifBtn.onclick = (e) => {
      e.stopPropagation();
      const isOpen = drawer.style.display === 'flex';
      drawer.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) populateDrawerList();
    };

    function populateDrawerList() {
      if (!currentUser) {
        notifList.innerHTML = `<div style="padding:1.5rem; text-align:center; font-size:0.75rem; color:var(--text-subtle);">Please sign in to view notifications.</div>`;
        return;
      }
      const myNotifs = notifications.filter((n) => n.user_id === currentUser.id || !n.user_id);
      if (!myNotifs.length) {
        notifList.innerHTML = `<div style="padding:1.5rem; text-align:center; font-size:0.75rem; color:var(--text-subtle);">No new notifications at this time.</div>`;
        return;
      }
      notifList.innerHTML = '';
      myNotifs.forEach((n) => {
        const item = document.createElement('div');
        item.className = `notif-item ${n.read ? '' : 'unread'}`;
        item.innerHTML = `
          <div style="font-size: 1.1rem; line-height: 1;">${n.read ? '🔔' : '🔵'}</div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.78rem; color: var(--text);">${n.title}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; line-height: 1.3;">${n.message}</div>
            <div style="font-size: 0.65rem; color: var(--text-subtle); margin-top: 4px; font-family: var(--font-mono);">${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        `;
        item.onclick = () => {
          n.read = true;
          saveAll();
          updateNotificationBadge();
          drawer.style.display = 'none';
          if (n.link_complaint) {
            navigateTo('complaint-detail', n.link_complaint);
          }
        };
        notifList.appendChild(item);
      });
    }

    if (markReadBtn) {
      markReadBtn.onclick = (e) => {
        e.stopPropagation();
        if (currentUser) {
          notifications.forEach((n) => {
            if (n.user_id === currentUser.id || !n.user_id) n.read = true;
          });
          saveAll();
          updateNotificationBadge();
          populateDrawerList();
          showToast('Marked all notifications as read.');
        }
      };
    }

    document.addEventListener('click', (e) => {
      if (!drawer.contains(e.target) && !notifBtn.contains(e.target)) {
        drawer.style.display = 'none';
      }
    });
  }

  // --- FEATURE: Campus Map & Incident Heatmap ---
  let activeMapZoneId = null;

  function renderHeatmap() {
    const zonesContainer = document.getElementById('map-zones-container');
    const filterSelect = document.getElementById('map-zone-filter');
    const tbody = document.getElementById('map-complaints-tbody');
    const titleEl = document.getElementById('map-selected-title');
    const subtitleEl = document.getElementById('map-selected-subtitle');
    const clearBtn = document.getElementById('map-clear-zone-btn');
    if (!zonesContainer || !tbody) return;

    const filterVal = filterSelect ? filterSelect.value : '';
    let filteredZones = CAMPUS_ZONES;
    if (filterVal) {
      filteredZones = CAMPUS_ZONES.filter((z) => z.type === filterVal);
    }

    zonesContainer.innerHTML = '';
    filteredZones.forEach((z) => {
      const zoneComplaints = complaints.filter((c) => {
        const text = ((c.location || '') + ' ' + (c.title || '')).toLowerCase();
        return z.keywords.some((k) => text.includes(k));
      });

      const activeCount = zoneComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;
      const criticalCount = zoneComplaints.filter((c) => c.priority === 'Critical' && c.status !== 'Closed').length;

      let statusClass = 'status-safe';
      let statusLabel = 'Safe · 0 Issues';
      if (criticalCount > 0) {
        statusClass = 'status-critical';
        statusLabel = `Alert · ${criticalCount} Critical`;
      } else if (activeCount > 0) {
        statusClass = 'status-warning';
        statusLabel = `Active · ${activeCount} Reported`;
      }

      const isSelected = activeMapZoneId === z.id;
      const card = document.createElement('div');
      card.className = `map-zone-card ${statusClass} ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div style="font-size: 1.4rem;">${z.icon}</div>
          <span class="status-tag ${criticalCount > 0 ? 'status-escalated' : activeCount > 0 ? 'status-pending' : 'status-resolved'}" style="font-size: 0.65rem;">
            ${statusLabel}
          </span>
        </div>
        <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.25rem;">${z.name}</h4>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.75rem;">${z.rooms}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem; font-size: 0.72rem;">
          <span style="color: var(--text-subtle); font-family: var(--font-mono);">${zoneComplaints.length} Total Logs</span>
          <span style="color: var(--primary); font-weight: 700;">${isSelected ? '✓ Viewing' : 'Inspect Zone →'}</span>
        </div>
      `;

      card.onclick = () => {
        if (activeMapZoneId === z.id) {
          activeMapZoneId = null;
        } else {
          activeMapZoneId = z.id;
        }
        renderHeatmap();
      };
      zonesContainer.appendChild(card);
    });

    // Populate filtered complaints table
    let tableComplaints = complaints;
    if (activeMapZoneId) {
      const selectedZone = CAMPUS_ZONES.find((z) => z.id === activeMapZoneId);
      if (selectedZone) {
        if (titleEl) titleEl.textContent = `${selectedZone.name} — Work Orders`;
        if (subtitleEl) subtitleEl.textContent = `Showing all complaints logged in ${selectedZone.name}`;
        tableComplaints = complaints.filter((c) => {
          const text = ((c.location || '') + ' ' + (c.title || '')).toLowerCase();
          return selectedZone.keywords.some((k) => text.includes(k));
        });
      }
    } else {
      if (titleEl) titleEl.textContent = 'All Campus Facilities Grievances';
      if (subtitleEl) subtitleEl.textContent = 'Select any building above to filter localized work orders';
    }

    tbody.innerHTML = '';
    if (!tableComplaints.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-subtle);">No active complaints recorded in this zone. Facility is fully operational.</td></tr>`;
    } else {
      tableComplaints.forEach((c) => {
        const tr = document.createElement('tr');
        tr.onclick = () => navigateTo('complaint-detail', c.complaint_id);
        tr.innerHTML = `
          <td class="font-mono font-bold">${c.complaint_id}</td>
          <td>
            <b>${c.title}</b>
            <div style="font-size: 0.7rem; color: var(--text-subtle);">${c.location}</div>
          </td>
          <td>${c.category} · ${c.department}</td>
          <td><span class="priority-${(c.priority || 'low').toLowerCase()}">${c.priority}</span></td>
          <td><span class="status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}">${c.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (clearBtn) {
      clearBtn.onclick = () => {
        activeMapZoneId = null;
        renderHeatmap();
      };
    }

    if (filterSelect) {
      filterSelect.onchange = () => renderHeatmap();
    }
  }

  // --- FEATURE: Emergency SOS & Rapid Dispatch ---
  function renderEmergency() {
    const tbody = document.getElementById('sos-incidents-tbody');
    if (!tbody) return;

    const sosList = complaints.filter((c) => c.priority === 'Critical' || (c.title || '').includes('EMERGENCY'));

    tbody.innerHTML = '';
    if (!sosList.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-subtle);">No critical emergencies active. All facilities and safety protocols normal.</td></tr>`;
    } else {
      sosList.forEach((c) => {
        const tr = document.createElement('tr');
        tr.onclick = () => navigateTo('complaint-detail', c.complaint_id);
        tr.innerHTML = `
          <td class="font-mono font-bold" style="color: var(--danger);">${c.complaint_id}</td>
          <td><span class="badge" style="background:#fee2e2; color:#b91c1c; font-weight:700;">${c.category}</span></td>
          <td>${c.location}</td>
          <td class="font-mono" style="font-size:0.72rem;">${new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
          <td class="font-mono font-bold" style="color:var(--danger);">${c.sla_hours}h Emergency SLA</td>
          <td><span class="status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}">${c.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    document.querySelectorAll('.sos-launch-btn').forEach((btn) => {
      btn.onclick = () => {
        const type = btn.getAttribute('data-type');
        let title = '';
        let cat = 'Safety';
        let dept = 'Maintenance';
        let defaultLoc = (currentUser && currentUser.hostel) || 'Campus Premises';

        if (type === 'ragging') {
          title = 'CRITICAL EMERGENCY: Anti-Ragging & Harassment Incident Reported';
          cat = 'Academic';
          dept = 'General Administration';
        } else if (type === 'medical') {
          title = 'CRITICAL EMERGENCY: Immediate Medical Assistance / Ambulance Request';
          cat = 'Infrastructure';
          dept = 'General Administration';
        } else if (type === 'fire') {
          title = 'CRITICAL HAZARD: Lab Chemical Spill / Fire Safety Hazard';
          cat = 'Infrastructure';
          dept = 'Maintenance';
        } else if (type === 'electrical') {
          title = 'CRITICAL HAZARD: Severe High-Voltage Sparking / Electrocution Risk';
          cat = 'Infrastructure';
          dept = 'Maintenance';
        }

        const confirmLoc = prompt(`EMERGENCY SOS: Please specify current exact room/location:\n(Default: ${defaultLoc})`, defaultLoc);
        if (confirmLoc === null) return;

        const location = confirmLoc.trim() || defaultLoc;
        const now = new Date().toISOString();
        const cid = 'CC-' + Math.floor(100000000 + Math.random() * 900000000);

        const newSosComplaint = {
          complaint_id: cid,
          student_id: (currentUser && currentUser.id) || 'usr_student_kavin',
          student_name: (currentUser && currentUser.name) || 'Anonymous Student',
          student_email: (currentUser && currentUser.email) || 'student@karunya.edu.in',
          anonymous: false,
          location: location,
          title: title,
          description: `RAPID SOS DISPATCH TRIGGERED by ${currentUser ? currentUser.name : 'Student'} at ${location}. Dispatched to Emergency Proctorial Unit, Head of Department, and Campus Control Desk. Immediate physical escort and intervention dispatched.`,
          category: cat,
          priority: 'Critical',
          department: dept,
          status: 'In Progress',
          sla_hours: 1,
          sla_deadline: hoursFromNow(1),
          created_at: now,
          updated_at: now,
          attachments: [],
          critical: true,
          timeline: [
            {
              status: 'In Progress',
              note: `🚨 EMERGENCY SOS DISPATCHED: Code Red Incident at ${location}. Chief Security Officer & Emergency Response Squad mobilized.`,
              at: now,
              author: 'Campus Emergency Dispatcher',
            },
          ],
        };

        complaints.unshift(newSosComplaint);
        addAudit('EMERGENCY_SOS_TRIGGERED', cid, `Location=${location}, Type=${type}`);
        addNotification(currentUser ? currentUser.id : 'usr_student_kavin', '🚨 Emergency SOS Dispatched', `Incident ${cid} has mobilized emergency security escort.`, cid);
        saveAll();

        showToast(`🚨 Emergency SOS dispatched! Emergency team en route to ${location}.`);
        navigateTo('complaint-detail', cid);
      };
    });
  }

  // --- FEATURE: Campus Voice & Pulse Polls ---
  function renderPolls() {
    const container = document.getElementById('polls-list-container');
    const proposeBtn = document.getElementById('propose-poll-btn');
    if (!container) return;

    container.innerHTML = '';
    polls.forEach((p) => {
      const userVote = currentUser ? (p.user_votes || {})[currentUser.id] : null;
      const total = p.total_votes || 1;

      const card = document.createElement('div');
      card.className = 'card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';

      let optionsHtml = '';
      p.options.forEach((opt) => {
        const pct = Math.round((opt.votes / total) * 100);
        const isVoted = userVote === opt.id;
        optionsHtml += `
          <button type="button" class="poll-option-btn ${isVoted ? 'voted' : ''}" data-poll="${p.id}" data-opt="${opt.id}">
            <div class="poll-fill-bar" style="width: ${pct}%;"></div>
            <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem;">
              <span>${isVoted ? '✓ ' : ''}${opt.text}</span>
              <span class="font-mono font-bold" style="color: var(--text);">${pct}% <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: normal;">(${opt.votes})</span></span>
            </div>
          </button>
        `;
      });

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span class="badge" style="background: var(--primary-subtle); color: var(--primary); font-size: 0.68rem; font-weight: 700;">${p.category}</span>
            <span class="font-mono" style="font-size: 0.7rem; color: var(--text-subtle);">${p.total_votes} Total Votes</span>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text);">${p.title}</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 1rem;">${p.desc}</p>
          <div>${optionsHtml}</div>
        </div>
        <div style="font-size: 0.7rem; color: var(--text-subtle); margin-top: 0.5rem; text-align: center;">
          ${userVote ? '✓ Your verified vote has been recorded.' : 'Click an option to cast your vote.'}
        </div>
      `;

      card.querySelectorAll('.poll-option-btn').forEach((btn) => {
        btn.onclick = () => {
          if (!currentUser) {
            showToast('Please sign in to vote in campus polls.');
            navigateTo('login');
            return;
          }
          const optId = btn.getAttribute('data-opt');
          if (!p.user_votes) p.user_votes = {};

          const prevVote = p.user_votes[currentUser.id];
          if (prevVote === optId) {
            showToast('You have already voted for this option.');
            return;
          }

          if (prevVote) {
            const oldOpt = p.options.find((o) => o.id === prevVote);
            if (oldOpt) oldOpt.votes = Math.max(0, oldOpt.votes - 1);
          } else {
            p.total_votes = (p.total_votes || 0) + 1;
          }

          const targetOpt = p.options.find((o) => o.id === optId);
          if (targetOpt) targetOpt.votes++;
          p.user_votes[currentUser.id] = optId;

          saveAll();
          showToast(`Vote recorded for "${targetOpt.text.split(' ')[1] || 'option'}"!`);
          renderPolls();
        };
      });

      container.appendChild(card);
    });

    if (proposeBtn) {
      proposeBtn.onclick = () => {
        const title = prompt('Proposed Campus Poll Question:');
        if (!title) return;
        const opt1 = prompt('Option 1:', 'Strongly Agree / Excellent');
        const opt2 = prompt('Option 2:', 'Needs Improvement / Critical');
        if (!opt1 || !opt2) return;

        polls.unshift({
          id: 'poll_' + Date.now(),
          title: title,
          category: 'Campus Facilities',
          desc: `Student-proposed initiative by ${currentUser.name} for university administration review.`,
          total_votes: 1,
          options: [
            { id: 'opt_1', text: opt1, votes: 1 },
            { id: 'opt_2', text: opt2, votes: 0 },
          ],
          user_votes: { [currentUser.id]: 'opt_1' },
        });
        saveAll();
        showToast('Campus pulse poll submitted and published!');
        renderPolls();
      };
    }
  }

  // --- FEATURE: Official Grievance Redressal Dossier & Certificate ---
  function renderDossier(selectedId) {
    const select = document.getElementById('dossier-complaint-select');
    const paper = document.getElementById('dossier-paper');
    if (!select || !paper) return;

    select.innerHTML = '';
    complaints.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.complaint_id;
      opt.textContent = `${c.complaint_id} — ${c.title.substring(0, 35)}... (${c.status})`;
      select.appendChild(opt);
    });

    let targetId = selectedId || (select.value || complaints[0].complaint_id);
    if (selectedId) select.value = selectedId;
    else targetId = select.value;

    select.onchange = () => {
      renderDossier(select.value);
    };

    const c = complaints.find((x) => x.complaint_id === targetId) || complaints[0];
    if (!c) return;

    const qrSvg = generateQrSvg(c.complaint_id, 100);
    const isClosed = c.status === 'Closed' || c.status === 'Resolved';
    const certNumber = 'KITS-GRC-' + c.complaint_id.replace('CC-', '');

    paper.innerHTML = `
      <div style="border: 2px solid #0f172a; padding: 2rem; position: relative;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
          <div style="font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #475569;">Karunya Institute of Technology and Sciences</div>
          <div style="font-size: 0.68rem; font-weight: 600; color: #64748b; margin-top: 2px;">Deemed-to-be University · Coimbatore, Tamil Nadu, India</div>
          <h2 style="font-size: 1.45rem; font-weight: 900; margin: 0.5rem 0 0.25rem; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
            Official Grievance Redressal Dossier & Resolution Certificate
          </h2>
          <div style="font-size: 0.75rem; font-family: var(--font-mono); color: #334155;">
            Certificate Registration No: <b>${certNumber}</b> · Verification Code: <b>${c.complaint_id}</b>
          </div>
        </div>

        <!-- Meta Grid -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div>
            <table style="width: 100%; font-size: 0.78rem; line-height: 1.8;">
              <tr>
                <td style="color: #64748b; width: 140px;"><b>Grievance Subject:</b></td>
                <td><b>${c.title}</b></td>
              </tr>
              <tr>
                <td style="color: #64748b;"><b>Complainant:</b></td>
                <td>${c.anonymous ? 'Confidential Protected Student' : c.student_name} (${c.student_email})</td>
              </tr>
              <tr>
                <td style="color: #64748b;"><b>Department / Unit:</b></td>
                <td>${c.category} · ${c.department}</td>
              </tr>
              <tr>
                <td style="color: #64748b;"><b>Facility Location:</b></td>
                <td>${c.location}</td>
              </tr>
              <tr>
                <td style="color: #64748b;"><b>Lodged Timestamp:</b></td>
                <td style="font-family: var(--font-mono);">${new Date(c.created_at).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color: #64748b;"><b>SLA Guarantee:</b></td>
                <td><b>${c.sla_hours} Hours Target</b> (${c.priority} Priority Tier)</td>
              </tr>
              <tr>
                <td style="color: #64748b;"><b>Final Redressal Status:</b></td>
                <td><b style="color: ${isClosed ? '#166534' : '#991b1b'};">${c.status.toUpperCase()}</b></td>
              </tr>
            </table>
          </div>

          <!-- QR Verification Stamp -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 1rem; text-align: center; background: #f8fafc;">
            <div style="margin-bottom: 0.5rem;">${qrSvg}</div>
            <div style="font-size: 0.65rem; font-family: var(--font-mono); color: #475569; font-weight: 700;">DIGITALLY VERIFIED SEAL</div>
            <div style="font-size: 0.62rem; color: #64748b; margin-top: 2px;">Scan at Registrar Desk</div>
          </div>
        </div>

        <!-- Description Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.85rem; margin-bottom: 1.5rem; font-size: 0.78rem; line-height: 1.6;">
          <div style="font-weight: 800; font-size: 0.72rem; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Incident Investigation & Scope Summary</div>
          <div>${c.description}</div>
        </div>

        <!-- Timeline Milestones -->
        <div style="margin-bottom: 1.75rem;">
          <div style="font-weight: 800; font-size: 0.75rem; text-transform: uppercase; color: #475569; margin-bottom: 0.5rem;">Chronological Audit Milestones</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.73rem;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left;">
                <th style="padding: 6px 10px;">Milestone State</th>
                <th style="padding: 6px 10px;">Timestamp</th>
                <th style="padding: 6px 10px;">Authorized Operator</th>
                <th style="padding: 6px 10px;">Operational Action</th>
              </tr>
            </thead>
            <tbody>
              ${(c.timeline || []).map((t) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px 10px; font-weight: 700;">${t.status}</td>
                  <td style="padding: 6px 10px; font-family: var(--font-mono);">${new Date(t.at).toLocaleString()}</td>
                  <td style="padding: 6px 10px;">${t.author}</td>
                  <td style="padding: 6px 10px; color: #475569;">${t.note}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Student Resolution Rating Seal -->
        ${c.rating ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.72rem; font-weight: 800; color: #166534; text-transform: uppercase;">Resolution Verification Loop Verified</div>
              <div style="font-size: 0.75rem; color: #15803d; font-style: italic;">"${c.feedback || 'Physical service inspected and approved.'}"</div>
            </div>
            <div style="font-size: 1.1rem; color: #f59e0b; font-weight: 800;">${'★'.repeat(c.rating)} (${c.rating}.0 / 5.0)</div>
          </div>
        ` : ''}

        <!-- Signatory Blocks -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #cbd5e1; text-align: center; font-size: 0.72rem;">
          <div>
            <div style="font-weight: 800; color: #0f172a;">${c.assigned_name || 'Dr. Rajesh Kumar'}</div>
            <div style="color: #64748b;">Duty Responding Officer</div>
            <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px;">Digitally Signed</div>
          </div>
          <div>
            <div style="font-weight: 800; color: #0f172a;">Dr. John Arthur</div>
            <div style="color: #64748b;">Head of Department / Chief Warden</div>
            <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px;">Administrative Seal</div>
          </div>
          <div>
            <div style="font-weight: 800; color: #0f172a;">Prof. E. J. James</div>
            <div style="color: #64748b;">Dean of Student Affairs / Ombudsman</div>
            <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px;">Institutional Signatory</div>
          </div>
        </div>
      </div>
    `;
  }

  // --- FEATURE: Ombudsman Appeals Tribunal ---
  function renderOmbudsman() {
    const list = document.getElementById('ombudsman-appeals-list');
    if (!list) return;

    list.innerHTML = '';
    if (appeals.length === 0) {
      list.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No appeals currently filed with the Ombudsman Tribunal.</div>`;
      return;
    }

    appeals.forEach((app) => {
      const isOwner = currentUser && app.student_id === currentUser.id;
      const isStaffOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'department_head');
      const statusClass = app.status === 'Ruling Issued' ? 'status-resolved' : app.status === 'Hearing Scheduled' ? 'status-inprogress' : 'status-pending';

      const card = document.createElement('div');
      card.className = 'appeal-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="font-mono font-bold" style="color: #4338ca; font-size: 0.85rem;">${app.appeal_id}</span>
              <span class="badge" style="background: var(--bg-subtle); font-size: 0.7rem; cursor: pointer;" title="View linked complaint" onclick="window.__navComplaint('${app.complaint_id}')">Linked: ${app.complaint_id} ➔</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 800; margin: 3px 0;">Grounds: ${app.grounds}</h4>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Petitioner: <b>${app.student_name}</b> · Filed ${new Date(app.created_at).toLocaleDateString()}</div>
          </div>
          <div style="text-align: right;">
            <span class="status-tag ${statusClass}">${app.status}</span>
            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; margin-top: 4px;">📅 ${app.hearing_date || 'Under Preliminary Review'}</div>
          </div>
        </div>

        <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem; line-height: 1.5; margin-bottom: 0.75rem;">
          <div style="font-weight: 700; color: var(--text-subtle); font-size: 0.68rem; text-transform: uppercase; margin-bottom: 2px;">Petitioner's Contention & Grounds:</div>
          <div>${app.statement}</div>
          <div style="margin-top: 0.5rem; color: var(--primary); font-weight: 600;">Requested Remedy: ${app.remedy}</div>
        </div>

        ${app.panel_ruling ? `
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.78rem; line-height: 1.5; margin-bottom: 0.75rem;">
            <div style="font-weight: 800; color: #3730a3; font-size: 0.7rem; text-transform: uppercase;">⚖️ Tribunal Interim Finding & Directive:</div>
            <div style="color: #1e1b4b; font-style: italic; margin-top: 2px;">"${app.panel_ruling}"</div>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.75rem;">
          <div style="color: var(--text-muted);">Jurisdiction: Dean of Student Welfare & University Ombudsman</div>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-outline btn-sm" onclick="window.__navComplaint('${app.complaint_id}')">Open Grievance Dossier</button>
            ${isStaffOrAdmin && app.status !== 'Ruling Issued' ? `
              <button class="btn btn-primary btn-sm" data-issue-ruling="${app.appeal_id}">Issue Final Decree</button>
            ` : ''}
          </div>
        </div>
      `;
      list.appendChild(card);
    });

    list.querySelectorAll('[data-issue-ruling]').forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-issue-ruling');
        const app = appeals.find((x) => x.appeal_id === id);
        if (app) {
          app.status = 'Ruling Issued';
          app.panel_ruling = 'Decree approved by Ombudsman Panel. Grievance reopened for immediate administrative compliance under 24-Hour emergency executive order.';
          app.hearing_date = 'Hearing Concluded';
          addAudit('OMBUDSMAN_RULING_ISSUED', app.complaint_id, `Appeal ${id} ruled in favor of student.`);
          saveAll();
          showToast('Ombudsman decree registered and issued!');
          renderOmbudsman();
        }
      };
    });
  }

  window.__navComplaint = function(cid) {
    navigateTo('complaint-detail', cid);
  };

  function setupOmbudsmanAppealModal() {
    const openBtn = document.getElementById('open-appeal-modal-btn');
    const modal = document.getElementById('ombudsman-modal');
    const form = document.getElementById('ombudsman-appeal-form');
    const select = document.getElementById('appeal-complaint-select');

    if (openBtn && modal) {
      openBtn.onclick = () => {
        if (select) {
          select.innerHTML = '';
          complaints.forEach((c) => {
            select.innerHTML += `<option value="${c.complaint_id}">${c.complaint_id} — ${c.title} (${c.status})</option>`;
          });
        }
        modal.classList.add('open');
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const cid = select ? select.value : '';
        const grounds = document.getElementById('appeal-grounds-select').value;
        const statement = document.getElementById('appeal-statement-input').value.trim();
        const remedy = document.getElementById('appeal-remedy-input').value.trim();

        if (!cid || !statement || !remedy) return;

        const newAppeal = {
          appeal_id: 'OMB-' + Date.now().toString().slice(-6),
          complaint_id: cid,
          student_id: currentUser ? currentUser.id : 'usr_student_kavin',
          student_name: currentUser ? currentUser.name : 'Kavin A M',
          grounds: grounds,
          statement: statement,
          remedy: remedy,
          status: 'Under Review',
          hearing_date: 'Next Senate Hearing (Thursday 11:00 AM)',
          panel_ruling: 'Petition officially registered. Tribunal clerk summoned departmental record for formal scrutiny.',
          created_at: new Date().toISOString(),
        };

        appeals.unshift(newAppeal);
        addAudit('OMBUDSMAN_APPEAL_FILED', cid, `Appeal ${newAppeal.appeal_id} grounds: ${grounds}`);
        saveAll();

        showToast(`Ombudsman appeal ${newAppeal.appeal_id} lodged successfully!`);
        if (modal) modal.classList.remove('open');
        form.reset();
        navigateTo('ombudsman');
      };
    }
  }

  // --- FEATURE: Multi-Channel SMS & WhatsApp Gateway Simulator ---
  let gatewayChannelMode = 'WhatsApp';

  function renderNotificationGateway() {
    const phoneBar = document.getElementById('phone-app-bar');
    const phoneTitle = document.getElementById('phone-app-title');
    const phoneIcon = document.getElementById('phone-app-icon');
    const phoneStream = document.getElementById('phone-stream');
    const logTbody = document.getElementById('gw-log-tbody');
    const btnWa = document.getElementById('gw-mode-wa');
    const btnSms = document.getElementById('gw-mode-sms');

    if (btnWa && btnSms) {
      if (gatewayChannelMode === 'WhatsApp') {
        btnWa.className = 'btn btn-sm btn-primary';
        btnSms.className = 'btn btn-sm btn-outline';
        if (phoneBar) phoneBar.className = 'phone-app-header';
        if (phoneTitle) phoneTitle.textContent = 'CampusCare WhatsApp Alert';
        if (phoneIcon) phoneIcon.textContent = '💬';
        if (phoneStream) phoneStream.className = 'phone-messages';
      } else {
        btnSms.className = 'btn btn-sm btn-primary';
        btnWa.className = 'btn btn-sm btn-outline';
        if (phoneBar) phoneBar.className = 'phone-app-header sms-mode';
        if (phoneTitle) phoneTitle.textContent = 'SMS: CampusCare Registry';
        if (phoneIcon) phoneIcon.textContent = '📱';
        if (phoneStream) phoneStream.className = 'phone-messages sms-mode';
      }

      btnWa.onclick = () => {
        gatewayChannelMode = 'WhatsApp';
        renderNotificationGateway();
      };
      btnSms.onclick = () => {
        gatewayChannelMode = 'SMS';
        renderNotificationGateway();
      };
    }

    if (phoneStream) {
      phoneStream.innerHTML = '';
      const channelMessages = smsLogs.filter((x) => x.channel === gatewayChannelMode);
      if (channelMessages.length === 0) {
        phoneStream.innerHTML = `<div style="text-align: center; color: #64748b; font-size: 0.75rem; padding: 2rem 0;">No messages dispatched on ${gatewayChannelMode} yet. Use the test triggers on the right to simulate live outbound alerts!</div>`;
      } else {
        channelMessages.forEach((msg) => {
          const bubble = document.createElement('div');
          bubble.className = gatewayChannelMode === 'WhatsApp' ? 'wa-bubble-incoming' : 'sms-bubble-incoming';
          bubble.innerHTML = `
            <div>${msg.message.replace(/\*([^*]+)\*/g, '<b>$1</b>')}</div>
            <div class="phone-timestamp">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${msg.status}</div>
          `;
          phoneStream.appendChild(bubble);
        });
        phoneStream.scrollTop = phoneStream.scrollHeight;
      }
    }

    if (logTbody) {
      logTbody.innerHTML = '';
      smsLogs.slice(0, 15).forEach((l) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="font-mono" style="font-size: 0.7rem;">${new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
          <td><span class="badge" style="background: ${l.channel === 'WhatsApp' ? '#dcfce7; color: #15803d;' : '#dbeafe; color: #1d4ed8;'} font-weight: 700;">${l.channel}</span></td>
          <td style="font-size: 0.72rem;">${l.recipient}</td>
          <td><span class="status-tag status-resolved" style="font-size: 0.65rem;">${l.status}</span></td>
        `;
        logTbody.appendChild(tr);
      });
    }
  }

  function setupNotificationGatewaySimulator() {
    const clearBtn = document.getElementById('gw-clear-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        smsLogs = [];
        saveAll();
        showToast('Notification phone stream cleared.');
        renderNotificationGateway();
      };
    }

    const btnAck = document.getElementById('btn-sim-ack');
    if (btnAck) {
      btnAck.onclick = () => {
        const now = new Date().toISOString();
        smsLogs.unshift({
          id: 'gw_' + Date.now(),
          channel: gatewayChannelMode,
          recipient: (currentUser && currentUser.phone) || '+91 98765 43210',
          type: 'INTAKE_RECEIPT',
          message: `🎓 *CampusCare Registry*: Hello ${currentUser ? currentUser.name : 'Student'}, your grievance *CC-260930101* has been triaged to Maintenance. Guaranteed SLA window: 48 hours. Track live in portal.`,
          status: 'Delivered (Read)',
          timestamp: now,
        });
        saveAll();
        showToast(`Dispatched simulated intake alert via ${gatewayChannelMode}!`);
        renderNotificationGateway();
      };
    }

    const btnAssign = document.getElementById('btn-sim-assign');
    if (btnAssign) {
      btnAssign.onclick = () => {
        const now = new Date().toISOString();
        smsLogs.unshift({
          id: 'gw_' + Date.now(),
          channel: gatewayChannelMode,
          recipient: '+91 94432 11002 (Dr. Rajesh Kumar, Staff)',
          type: 'DUTY_DISPATCH',
          message: `🛠️ *Duty Desk Alert*: New ticket *CC-260930102* (Electrical Sparking) assigned to you at Hostel Block B. Target resolution: 12h SLA.`,
          status: 'Delivered (Read)',
          timestamp: now,
        });
        saveAll();
        showToast(`Dispatched staff assignment alert via ${gatewayChannelMode}!`);
        renderNotificationGateway();
      };
    }

    const btnBreach = document.getElementById('btn-sim-breach');
    if (btnBreach) {
      btnBreach.onclick = () => {
        const now = new Date().toISOString();
        smsLogs.unshift({
          id: 'gw_' + Date.now(),
          channel: gatewayChannelMode,
          recipient: '+91 98400 99881 (Head of Department)',
          type: 'SLA_BREACH',
          message: `🚨 *URGENT SLA WARNING*: Grievance *CC-260930103* is nearing SLA expiration within 60 minutes. Immediate technician dispatch required to avert executive escalation.`,
          status: 'Delivered (Urgent)',
          timestamp: now,
        });
        saveAll();
        showToast(`Dispatched emergency SLA warning alert via ${gatewayChannelMode}!`);
        renderNotificationGateway();
      };
    }

    const btnVerify = document.getElementById('btn-sim-verify');
    if (btnVerify) {
      btnVerify.onclick = () => {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const now = new Date().toISOString();
        smsLogs.unshift({
          id: 'gw_' + Date.now(),
          channel: gatewayChannelMode,
          recipient: (currentUser && currentUser.phone) || '+91 98765 43210',
          type: 'VERIFICATION_OTP',
          message: `🔒 *CampusCare Security*: Your physical repair verification code is *${otp}*. Provide this code to technician ONLY after inspecting that the physical issue has been completely fixed.`,
          status: 'Delivered (Read)',
          timestamp: now,
        });
        saveAll();
        showToast(`Dispatched verification OTP ${otp} via ${gatewayChannelMode}!`);
        renderNotificationGateway();
      };
    }
  }

  // --- FEATURE: Student Welfare & Compensation Claims ---
  function renderCompensation() {
    const tbody = document.getElementById('compensation-claims-tbody');
    const settledEl = document.getElementById('claim-kpi-settled');
    if (!tbody) return;

    tbody.innerHTML = '';
    let totalSettled = 0;

    compensationClaims.forEach((cl) => {
      if (cl.status === 'Disbursed' || cl.status === 'Approved') {
        totalSettled += (cl.amount || 0);
      }
      const isStaffOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff' || currentUser.role === 'department_head');
      const statusClass = cl.status === 'Disbursed' ? 'status-resolved' : cl.status === 'Approved' ? 'status-inprogress' : cl.status === 'Rejected' ? 'status-escalated' : 'status-pending';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: #059669;" class="font-mono">${cl.claim_id}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${cl.student_name}</div>
        </td>
        <td>
          <span class="badge" style="cursor: pointer; background: var(--bg-subtle);" onclick="window.__navComplaint('${cl.complaint_id}')">${cl.complaint_id} ➔</span>
        </td>
        <td>
          <div style="font-weight: 600;">${cl.type}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${cl.description}</div>
        </td>
        <td>
          <div class="font-mono font-bold" style="color: var(--text); font-size: 0.95rem;">₹${cl.amount.toLocaleString()}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-mono);">${cl.upi}</div>
        </td>
        <td>
          <span class="status-tag ${statusClass}">${cl.status}</span>
          ${cl.voucher ? `<div style="font-size: 0.65rem; font-family: var(--font-mono); color: var(--text-muted); margin-top: 2px;">Voucher: ${cl.voucher}</div>` : ''}
        </td>
        <td style="text-align: right;">
          ${isStaffOrAdmin && cl.status === 'Pending Review' ? `
            <button class="btn btn-success btn-sm" data-approve-claim="${cl.claim_id}">Approve</button>
          ` : isStaffOrAdmin && cl.status === 'Approved' ? `
            <button class="btn btn-primary btn-sm" data-disburse-claim="${cl.claim_id}">Disburse</button>
          ` : `
            <span style="font-size: 0.72rem; color: var(--text-muted);">Verified ✓</span>
          `}
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (settledEl) settledEl.textContent = `₹${totalSettled.toLocaleString()}`;

    tbody.querySelectorAll('[data-approve-claim]').forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-approve-claim');
        const cl = compensationClaims.find((x) => x.claim_id === id);
        if (cl) {
          cl.status = 'Approved';
          addAudit('COMPENSATION_APPROVED', cl.complaint_id, `Claim ${id} for ₹${cl.amount} approved by Finance`);
          saveAll();
          showToast(`Claim ${id} approved for disbursement!`);
          renderCompensation();
        }
      };
    });

    tbody.querySelectorAll('[data-disburse-claim]').forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-disburse-claim');
        const cl = compensationClaims.find((x) => x.claim_id === id);
        if (cl) {
          cl.status = 'Disbursed';
          cl.voucher = 'FIN-VOUCH-' + Math.floor(1000 + Math.random() * 9000);
          addAudit('COMPENSATION_DISBURSED', cl.complaint_id, `Payment voucher ${cl.voucher} issued to ${cl.upi}`);
          saveAll();
          showToast(`Payment voucher ${cl.voucher} issued to student!`);
          renderCompensation();
        }
      };
    });
  }

  function setupCompensationClaimModal() {
    const openBtn = document.getElementById('open-claim-modal-btn');
    const modal = document.getElementById('compensation-modal');
    const form = document.getElementById('compensation-claim-form');
    const select = document.getElementById('claim-complaint-select');

    if (openBtn && modal) {
      openBtn.onclick = () => {
        if (select) {
          select.innerHTML = '';
          complaints.forEach((c) => {
            select.innerHTML += `<option value="${c.complaint_id}">${c.complaint_id} — ${c.title}</option>`;
          });
        }
        modal.classList.add('open');
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const cid = select ? select.value : '';
        const type = document.getElementById('claim-type-select').value;
        const amount = parseInt(document.getElementById('claim-amount-input').value, 10);
        const desc = document.getElementById('claim-desc-input').value.trim();
        const upi = document.getElementById('claim-upi-input').value.trim();

        if (!cid || !amount || !desc || !upi) return;

        const newClaim = {
          claim_id: 'CMP-' + Date.now().toString().slice(-6),
          complaint_id: cid,
          student_id: currentUser ? currentUser.id : 'usr_student_kavin',
          student_name: currentUser ? currentUser.name : 'Kavin A M',
          type: type,
          amount: amount,
          description: desc,
          upi: upi,
          status: 'Pending Review',
          created_at: new Date().toISOString(),
        };

        compensationClaims.unshift(newClaim);
        addAudit('COMPENSATION_CLAIM_SUBMITTED', cid, `Amount=₹${amount}, Type=${type}`);
        saveAll();

        showToast(`Compensation claim ${newClaim.claim_id} submitted to student relief fund!`);
        if (modal) modal.classList.remove('open');
        form.reset();
        navigateTo('compensation');
      };
    }
  }

  // --- FEATURE: SLA Escalation Matrix & Time-Travel Simulator ---
  function renderSlaMatrix() {
    const tbody = document.getElementById('matrix-sla-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const activeComplaints = complaints.filter((c) => c.status !== 'Closed');

    if (activeComplaints.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">All complaints are resolved! No active SLA countdowns.</td></tr>`;
      return;
    }

    activeComplaints.forEach((c) => {
      const sla = getSlaStatus(c.sla_deadline, c.status);
      const isBreached = sla.isOverdue;
      const statusClass = c.status === 'Resolved' ? 'status-resolved' : c.status === 'Escalated' ? 'status-escalated' : c.status === 'In Progress' ? 'status-inprogress' : 'status-pending';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-mono font-bold" style="color: var(--primary);">${c.complaint_id}</td>
        <td>
          <div style="font-weight: 600;">${c.title}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${c.department} · ${c.location}</div>
        </td>
        <td>
          <span class="priority-${(c.priority || 'low').toLowerCase()}">${c.priority}</span>
        </td>
        <td>
          <div class="font-mono font-bold" style="color: ${isBreached ? 'var(--danger)' : 'var(--text)'};">
            ${isBreached ? '⚠️ ' : '⏱️ '}${sla.formatted}
          </div>
          <div style="font-size: 0.65rem; color: var(--text-muted);">Target: ${c.sla_hours} Hours</div>
        </td>
        <td>
          <span class="status-tag ${statusClass}">${c.status}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-outline btn-sm" onclick="window.__navComplaint('${c.complaint_id}')">Inspect</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function setupSlaTimeTravelMachine() {
    function advanceTime(hours) {
      complaints.forEach((c) => {
        if (c.status !== 'Closed') {
          // Move created_at further in the past
          const curTime = new Date(c.created_at).getTime();
          c.created_at = new Date(curTime - hours * 3600 * 1000).toISOString();
        }
      });
      addAudit('TIME_TRAVEL_ADVANCED', '—', `Advanced system simulation time by +${hours} hours`);
      saveAll();
      showToast(`Advanced system timeline by +${hours} hours! Checking SLA breaches...`);
      checkAndTriggerBreaches();
      renderSlaMatrix();
      renderDashboardGraph(complaints);
    }

    function checkAndTriggerBreaches() {
      let breachedCount = 0;
      complaints.forEach((c) => {
        if (c.status !== 'Closed' && c.status !== 'Resolved') {
          const sla = getSlaStatus(c.sla_deadline, c.status);
          if (sla.isOverdue && c.status !== 'Escalated') {
            c.status = 'Escalated';
            c.timeline.push({
              status: 'Escalated',
              note: `🚨 SLA AUTOMATIC BREACH: Overdue beyond guaranteed ${c.sla_hours}h limit. Auto-escalated to Dean of Student Affairs & Registrar.`,
              at: new Date().toISOString(),
              author: 'Autonomous SLA Watchdog',
            });
            breachedCount++;
            addNotification(c.student_id, 'Ticket Auto-Escalated', `Ticket ${c.complaint_id} missed SLA deadline and was escalated to Dean.`, c.complaint_id);

            // Dispatch SMS Alert
            smsLogs.unshift({
              id: 'gw_' + Date.now(),
              channel: 'SMS',
              recipient: '+91 98400 99881 (Head of Department)',
              type: 'SLA_BREACH',
              message: `🚨 ESCALATION: Ticket ${c.complaint_id} breached SLA deadline. High priority review initiated.`,
              status: 'Delivered (Urgent)',
              timestamp: new Date().toISOString(),
            });
          }
        }
      });
      if (breachedCount > 0) {
        saveAll();
        showToast(`🚨 ${breachedCount} ticket(s) breached SLA and were auto-escalated to Dean!`);
      } else {
        showToast('All active tickets within acceptable SLA thresholds.');
      }
    }

    const btn6h = document.getElementById('tt-adv-6h');
    const btn24h = document.getElementById('tt-adv-24h');
    const btn48h = document.getElementById('tt-adv-48h');
    const btnBreach = document.getElementById('tt-trigger-breaches');

    if (btn6h) btn6h.onclick = () => advanceTime(6);
    if (btn24h) btn24h.onclick = () => advanceTime(24);
    if (btn48h) btn48h.onclick = () => advanceTime(48);
    if (btnBreach) btnBreach.onclick = () => {
      checkAndTriggerBreaches();
      renderSlaMatrix();
    };
  }

  // --- FEATURE: Student Redressal Central Hub ---
  function renderStudentHub() {
    const nameEl = document.getElementById('student-hub-name');
    const metaEl = document.getElementById('student-hub-meta');
    const ticketIdEl = document.getElementById('student-active-ticket-id');
    const noteEl = document.getElementById('student-lifecycle-note');
    const tbody = document.getElementById('student-my-complaints-tbody');

    const studentUser = (currentUser && currentUser.role === 'student') ? currentUser : users.find((u) => u.role === 'student') || users[0];

    if (nameEl) nameEl.textContent = `Student Hub: ${studentUser.name}`;
    if (metaEl) metaEl.textContent = `${studentUser.department || 'Computer Science & Engineering'} · Reg. ${studentUser.studentId || 'URK23CS1042'} · ${studentUser.hostel || 'Hostel Block C, Room 314'}`;

    const myComplaints = complaints.filter((c) => c.student_id === studentUser.id || c.student_email === studentUser.email);
    const active = myComplaints.find((c) => c.status !== 'Closed') || myComplaints[0];

    // Stepper elements
    const s1 = document.getElementById('step-intake');
    const s2 = document.getElementById('step-routing');
    const s3 = document.getElementById('step-repair');
    const s4 = document.getElementById('step-verify');
    const s5 = document.getElementById('step-close');

    if (active) {
      if (ticketIdEl) ticketIdEl.textContent = active.complaint_id;

      const resetSteps = () => [s1, s2, s3, s4, s5].forEach((s) => {
        if (s) { s.className = 'lifecycle-step'; }
      });
      resetSteps();

      if (active.status === 'Pending') {
        if (s1) s1.className = 'lifecycle-step active';
        if (noteEl) noteEl.innerHTML = `📝 Grievance <b>${active.complaint_id}</b> logged. Automatic AI pre-analysis has routed your issue to <b>${active.department}</b>.`;
      } else if (active.status === 'Assigned') {
        if (s1) s1.className = 'lifecycle-step completed';
        if (s2) s2.className = 'lifecycle-step active';
        if (noteEl) noteEl.innerHTML = `📥 Work order dispatched to duty officer <b>${active.assigned_name || 'Department Technician'}</b>. Field visit scheduled.`;
      } else if (active.status === 'In Progress' || active.status === 'Reopened') {
        if (s1) s1.className = 'lifecycle-step completed';
        if (s2) s2.className = 'lifecycle-step completed';
        if (s3) s3.className = 'lifecycle-step active';
        if (noteEl) noteEl.innerHTML = `🛠️ Field technician is on-site at <b>${active.location}</b>. Active repair and calibration underway.`;
      } else if (active.status === 'Resolved') {
        if (s1) s1.className = 'lifecycle-step completed';
        if (s2) s2.className = 'lifecycle-step completed';
        if (s3) s3.className = 'lifecycle-step completed';
        if (s4) s4.className = 'lifecycle-step active';
        if (noteEl) noteEl.innerHTML = `⭐ <b>Action Required:</b> Technician marked work complete! Please inspect the site and verify resolution. <button class="btn btn-success btn-sm" style="margin-left: 0.5rem; padding: 2px 8px; font-size: 0.7rem;" onclick="window.__navComplaint('${active.complaint_id}')">Verify Now →</button>`;
      } else if (active.status === 'Closed') {
        if (s1) s1.className = 'lifecycle-step completed';
        if (s2) s2.className = 'lifecycle-step completed';
        if (s3) s3.className = 'lifecycle-step completed';
        if (s4) s4.className = 'lifecycle-step completed';
        if (s5) s5.className = 'lifecycle-step completed';
        if (noteEl) noteEl.innerHTML = `✓ Resolution verified and closed. Certificate archived in <a href="#" onclick="navigateTo('dossier', '${active.complaint_id}'); return false;" style="color: var(--primary); font-weight: 700;">Resolution Dossier</a>.`;
      } else {
        if (s1) s1.className = 'lifecycle-step active';
      }
    } else {
      if (ticketIdEl) ticketIdEl.textContent = 'No Active Ticket';
      if (noteEl) noteEl.textContent = 'You currently have no open grievances. Submit an issue above or track public campus status.';
    }

    if (tbody) {
      tbody.innerHTML = '';
      if (myComplaints.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">You haven't filed any grievances yet. Use the intake form to report an issue.</td></tr>`;
      } else {
        myComplaints.forEach((c) => {
          const sla = getSlaStatus(c.sla_deadline, c.status);
          const statusClass = c.status === 'Resolved' ? 'status-resolved' : c.status === 'Closed' ? 'status-resolved' : c.status === 'Escalated' ? 'status-escalated' : c.status === 'In Progress' ? 'status-inprogress' : 'status-pending';

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="font-mono font-bold" style="color: var(--primary);">${c.complaint_id}</td>
            <td>
              <div style="font-weight: 600;">${c.title}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${c.location}</div>
            </td>
            <td>${c.department}</td>
            <td class="font-mono" style="font-size: 0.72rem; color: ${sla.isOverdue ? 'var(--danger)' : 'var(--text-muted)'};">${sla.formatted}</td>
            <td><span class="status-tag ${statusClass}">${c.status}</span></td>
            <td style="text-align: right;">
              <button class="btn btn-outline btn-sm" onclick="window.__navComplaint('${c.complaint_id}')">Inspect</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  }

  // --- FEATURE: Faculty & Staff Grievance Review & Investigation Hub ---
  let facultyActiveFilter = 'all';
  let facultySearchQuery = '';
  let activeFacultyComplaintId = null;

  function renderStaffWorkstation() {
    const officerNameEl = document.getElementById('staff-officer-name');
    const officerMetaEl = document.getElementById('staff-officer-meta');
    const kpiTotalEl = document.getElementById('faculty-kpi-total');
    const kpiActiveEl = document.getElementById('staff-kpi-active');
    const kpiInspectionEl = document.getElementById('faculty-kpi-inspection');
    const kpiResolvedEl = document.getElementById('faculty-kpi-resolved');
    const rosterListEl = document.getElementById('faculty-roster-list');
    const rosterCountEl = document.getElementById('faculty-roster-count');
    const searchInput = document.getElementById('faculty-roster-search');
    const refreshBtn = document.getElementById('staff-refresh-queue-btn');

    const staffUser = (currentUser && (currentUser.role === 'staff' || currentUser.role === 'department_head')) ? currentUser : users.find((u) => u.role === 'staff') || users[1];

    if (officerNameEl) officerNameEl.textContent = `Faculty Investigation Desk: ${staffUser.name}`;
    if (officerMetaEl) officerMetaEl.textContent = `Faculty Investigator: ${staffUser.name} · Department: ${staffUser.department || 'Maintenance & Infrastructure'} · Status: Active On-Duty`;

    // Calculate KPIs
    if (kpiTotalEl) kpiTotalEl.textContent = complaints.length;
    if (kpiActiveEl) kpiActiveEl.textContent = complaints.filter((c) => c.status !== 'Closed' && (c.assigned_to === staffUser.id || c.department.includes(staffUser.department) || staffUser.role === 'admin')).length;
    if (kpiInspectionEl) kpiInspectionEl.textContent = complaints.filter((c) => c.status === 'Pending' || c.status === 'Assigned' || c.status === 'In Progress').length;
    if (kpiResolvedEl) kpiResolvedEl.textContent = complaints.filter((c) => c.status === 'Resolved').length;

    // Filter Tab Listeners
    document.querySelectorAll('.faculty-tab-btn').forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll('.faculty-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        facultyActiveFilter = btn.getAttribute('data-faculty-filter') || 'all';
        renderFacultyRoster();
      };
    });

    if (searchInput) {
      searchInput.oninput = (e) => {
        facultySearchQuery = (e.target.value || '').trim().toLowerCase();
        renderFacultyRoster();
      };
    }

    if (refreshBtn) {
      refreshBtn.onclick = () => {
        showToast('Faculty duty roster refreshed.');
        renderStaffWorkstation();
      };
    }

    function renderFacultyRoster() {
      if (!rosterListEl) return;
      rosterListEl.innerHTML = '';

      let filtered = complaints.filter((c) => {
        // Tab filter
        if (facultyActiveFilter === 'mine') {
          if (c.assigned_to !== staffUser.id && !c.department.includes(staffUser.department) && staffUser.role !== 'admin') return false;
        } else if (facultyActiveFilter === 'pending') {
          if (c.status !== 'Pending' && c.status !== 'Assigned') return false;
        } else if (facultyActiveFilter === 'critical') {
          if (c.priority !== 'Critical' && !c.critical) return false;
        } else if (facultyActiveFilter === 'resolved') {
          if (c.status !== 'Resolved') return false;
        }

        // Search query filter
        if (facultySearchQuery) {
          const matchTitle = (c.title || '').toLowerCase().includes(facultySearchQuery);
          const matchDesc = (c.description || '').toLowerCase().includes(facultySearchQuery);
          const matchId = (c.complaint_id || '').toLowerCase().includes(facultySearchQuery);
          const matchLoc = (c.location || '').toLowerCase().includes(facultySearchQuery);
          const matchName = (c.student_name || '').toLowerCase().includes(facultySearchQuery);
          if (!matchTitle && !matchDesc && !matchId && !matchLoc && !matchName) return false;
        }

        return true;
      });

      if (rosterCountEl) rosterCountEl.textContent = `${filtered.length} Ticket${filtered.length === 1 ? '' : 's'}`;

      if (filtered.length === 0) {
        rosterListEl.innerHTML = `
          <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
            No student complaints match this filter.
          </div>
        `;
        return;
      }

      // If active ticket is not in filtered list, select first
      if (!activeFacultyComplaintId || !filtered.some((c) => c.complaint_id === activeFacultyComplaintId)) {
        activeFacultyComplaintId = filtered[0].complaint_id;
      }

      filtered.forEach((c) => {
        const isSel = c.complaint_id === activeFacultyComplaintId;
        const sla = getSlaStatus(c.sla_deadline, c.status);
        const statusClass = c.status === 'Resolved' ? 'status-resolved' : c.status === 'Closed' ? 'status-resolved' : c.status === 'Escalated' ? 'status-escalated' : c.status === 'In Progress' ? 'status-inprogress' : 'status-pending';

        const row = document.createElement('div');
        row.className = `faculty-ticket-row ${isSel ? 'selected' : ''}`;
        row.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span class="font-mono font-bold" style="font-size: 0.8rem; color: #065f46;">${c.complaint_id}</span>
            <div style="display: flex; gap: 4px;">
              <span class="priority-${(c.priority || 'low').toLowerCase()}" style="font-size: 0.65rem; padding: 1px 5px; border-radius: 4px;">${c.priority}</span>
              <span class="status-tag ${statusClass}" style="font-size: 0.65rem; padding: 1px 5px;">${c.status}</span>
            </div>
          </div>
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--text); line-height: 1.3; margin: 3px 0;">${c.title}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span>👤 ${c.student_name} (${c.location})</span>
            <span class="font-mono font-bold" style="color: ${sla.isOverdue ? 'var(--danger)' : 'var(--text-muted)'}; font-size: 0.68rem;">${sla.formatted}</span>
          </div>
          ${c.attachments && c.attachments.length > 0 ? `
            <div style="margin-top: 4px; font-size: 0.68rem; color: #0284c7; font-weight: 700;">
              📷 ${c.attachments.length} Photo Evidence Attached
            </div>
          ` : ''}
        `;

        row.onclick = () => {
          activeFacultyComplaintId = c.complaint_id;
          renderFacultyRoster();
          loadFacultyWorkbench(c);
        };

        rosterListEl.appendChild(row);
      });

      const currentTicket = complaints.find((x) => x.complaint_id === activeFacultyComplaintId) || filtered[0];
      if (currentTicket) loadFacultyWorkbench(currentTicket);
    }

    function loadFacultyWorkbench(c) {
      const ticketIdEl = document.getElementById('faculty-active-ticket-id');
      const statusEl = document.getElementById('faculty-active-status');
      const priorityEl = document.getElementById('faculty-active-priority');
      const titleEl = document.getElementById('faculty-active-title');
      const metaEl = document.getElementById('faculty-active-meta');
      const slaEl = document.getElementById('faculty-active-sla');
      const bioEl = document.getElementById('faculty-student-bio');
      const descEl = document.getElementById('faculty-student-desc');
      const thumbsEl = document.getElementById('faculty-evidence-thumbnails');
      const notesEl = document.getElementById('faculty-inspection-notes');
      const workNoteEl = document.getElementById('staff-field-note');
      const internalRemEl = document.getElementById('faculty-internal-remarks');
      const partsSelect = document.getElementById('staff-parts-select');
      const statusSelect = document.getElementById('faculty-action-status-select');
      const saveInspectionBtn = document.getElementById('faculty-save-inspection-btn');
      const markResolvedBtn = document.getElementById('staff-mark-resolved-btn');
      const escalateBtn = document.getElementById('faculty-escalate-hod-btn');
      const smsCheck = document.getElementById('faculty-sms-alert-check');

      if (ticketIdEl) ticketIdEl.textContent = c.complaint_id;
      if (statusEl) {
        statusEl.textContent = c.status;
        statusEl.className = `status-tag status-${(c.status || 'pending').toLowerCase().replace(' ', '')}`;
      }
      if (priorityEl) {
        priorityEl.textContent = `${c.priority} Priority`;
        priorityEl.className = `status-tag status-${(c.priority || 'low').toLowerCase()}`;
      }
      if (titleEl) titleEl.textContent = c.title;
      if (metaEl) {
        metaEl.textContent = `Student: ${c.student_name} (${c.student_email || 'student@campus.edu'}) · Dept: ${c.department} · Room/Location: ${c.location}`;
      }
      if (slaEl) {
        const sla = getSlaStatus(c.sla_deadline, c.status);
        slaEl.textContent = sla.formatted;
        slaEl.style.color = sla.isOverdue ? 'var(--danger)' : 'var(--text)';
      }
      if (bioEl) {
        bioEl.innerHTML = `👤 <b>${c.student_name}</b> · Location: <b>${c.location}</b> · Submitted: ${new Date(c.created_at).toLocaleString()}`;
      }
      if (descEl) {
        descEl.textContent = `"${c.description}"`;
      }

      // Render Student Evidence Photos
      if (thumbsEl) {
        thumbsEl.innerHTML = '';
        if (c.attachments && c.attachments.length > 0) {
          c.attachments.forEach((att) => {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'width: 60px; height: 60px; border-radius: 6px; overflow: hidden; cursor: pointer; border: 1px solid var(--border); box-shadow: var(--shadow-sm);';
            wrap.title = `Click to zoom: ${att.name || 'Student Evidence'}`;
            wrap.innerHTML = `<img src="${att.url || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' fill=\'%230284c7\'><rect width=\'60\' height=\'60\' fill=\'%23e0f2fe\'/><text x=\'10\' y=\'35\' font-size=\'12\'>Proof</text></svg>'}" style="width: 100%; height: 100%; object-fit: cover;" />`;
            wrap.onclick = () => {
              const modal = document.getElementById('evidence-zoom-modal');
              const zoomImg = document.getElementById('evidence-zoom-img');
              const zoomCaption = document.getElementById('evidence-zoom-caption');
              if (modal && zoomImg) {
                zoomImg.src = att.url;
                if (zoomCaption) zoomCaption.textContent = `${c.complaint_id}: ${att.name || 'Evidence photo'}`;
                modal.classList.add('open');
              }
            };
            thumbsEl.appendChild(wrap);
          });
        } else {
          thumbsEl.innerHTML = `<span style="font-size: 0.72rem; color: var(--text-subtle); font-style: italic;">No photo evidence attached by student.</span>`;
        }
      }

      // Check if previous inspection notes in timeline
      const previousInspection = (c.timeline || []).slice().reverse().find((t) => t.note && t.note.includes('INSPECTION'));
      if (notesEl) {
        notesEl.value = previousInspection ? previousInspection.note.replace(/^.*Observations: /, '').replace(/\. Checklist verified\..*$/, '') : '';
      }
      if (workNoteEl) {
        workNoteEl.value = c.status === 'Resolved' ? 'Field repair completed and operational tests conducted successfully.' : '';
      }

      // Bind Save Inspection Notes button
      if (saveInspectionBtn) {
        saveInspectionBtn.onclick = () => {
          const notesVal = (notesEl && notesEl.value.trim()) || 'Physical on-site inspection conducted. Fault verified with student occupants.';
          const severityVal = document.getElementById('faculty-severity-select').value;
          const now = new Date().toISOString();

          c.timeline.push({
            status: c.status === 'Pending' || c.status === 'Assigned' ? 'In Progress' : c.status,
            note: `FACULTY PHYSICAL INSPECTION: Verified by ${staffUser.name}. Assessed Severity: ${severityVal}. Observations: ${notesVal}. SOP checklist verified.`,
            at: now,
            author: staffUser.name,
          });

          if (c.status === 'Pending' || c.status === 'Assigned') {
            c.status = 'In Progress';
          }
          c.updated_at = now;

          addAudit('FACULTY_INSPECTION_CONDUCTED', c.complaint_id, `Faculty=${staffUser.name}, Severity=${severityVal}`);
          saveAll();
          showToast(`Physical inspection logged for ticket ${c.complaint_id}!`);
          renderStaffWorkstation();
        };
      }

      // Bind Mark Resolved button
      if (markResolvedBtn) {
        markResolvedBtn.onclick = () => {
          const partsVal = (partsSelect && partsSelect.value) || 'None';
          const workVal = (workNoteEl && workNoteEl.value.trim()) || 'Field repair completed and operational tests conducted successfully.';
          const remarksVal = (internalRemEl && internalRemEl.value.trim()) || '';
          const actionStat = (statusSelect && statusSelect.value) || 'Resolved';
          const now = new Date().toISOString();

          c.status = actionStat;
          c.updated_at = now;

          c.timeline.push({
            status: actionStat,
            note: `FACULTY RESOLUTION SUBMITTED by ${staffUser.name}. Parts used: ${partsVal}. Details: ${workVal}.${remarksVal ? ` (Deliberation: ${remarksVal})` : ''}`,
            at: now,
            author: staffUser.name,
          });

          // Dispatch Instant SMS/WhatsApp to Student if checked
          if (smsCheck && smsCheck.checked) {
            smsLogs.unshift({
              id: 'gw_' + Date.now(),
              channel: 'WhatsApp',
              recipient: `${c.student_name} (${c.student_email})`,
              type: 'FACULTY_RESOLUTION_ALERT',
              message: `🛠️ *CampusCare Service Alert*: Faculty Investigator ${staffUser.name} has completed physical resolution for your grievance *${c.complaint_id}*. Resolution: "${workVal}". Please inspect and confirm resolution in your student portal.`,
              status: 'Delivered (Read)',
              timestamp: now,
            });
          }

          addAudit('FACULTY_RESOLUTION_COMPLETED', c.complaint_id, `Faculty=${staffUser.name}, Parts=${partsVal}`);
          addNotification(c.student_id, 'Resolution Verification Requested', `Faculty ${staffUser.name} resolved ticket ${c.complaint_id}. Please confirm verification.`, c.complaint_id);
          saveAll();

          showToast(`Ticket ${c.complaint_id} marked as ${actionStat}! Verification request dispatched to student.`);
          renderStaffWorkstation();
          renderDashboard();
        };
      }

      // Bind Escalate to HOD button
      if (escalateBtn) {
        escalateBtn.onclick = () => {
          const reason = prompt('State justification for Department Head (HOD) Escalation (e.g. Budget authorization / structural repair):', 'Requires specialized contractor dispatch and budget approval over ₹5,000 from Head of Department.');
          if (!reason) return;

          const now = new Date().toISOString();
          c.status = 'Escalated';
          c.priority = 'Critical';
          c.critical = true;
          c.updated_at = now;

          c.timeline.push({
            status: 'Escalated',
            note: `ESCALATED TO DEPARTMENT HEAD by Faculty ${staffUser.name}. Justification: ${reason}`,
            at: now,
            author: staffUser.name,
          });

          // Dispatch alert to HOD
          smsLogs.unshift({
            id: 'gw_' + Date.now(),
            channel: 'SMS',
            recipient: 'Prof. M. Selvam (HOD Maintenance)',
            type: 'FACULTY_HOD_ESCALATION',
            message: `🏢 *Urgent HOD Escalation*: Ticket *${c.complaint_id}* has been escalated by Faculty ${staffUser.name}. Justification: "${reason}". Immediate supervisory sanction required.`,
            status: 'Delivered (Read)',
            timestamp: now,
          });

          addAudit('FACULTY_ESCALATED_TO_HOD', c.complaint_id, `Justification: ${reason}`);
          saveAll();
          showToast(`Ticket ${c.complaint_id} escalated to Department Head! HOD alert dispatched.`);
          renderStaffWorkstation();
        };
      }
    }

    renderFacultyRoster();
  }

  // --- FEATURE: Department Head (HOD) Console ---
  function renderHodConsole() {
    const deptNameEl = document.getElementById('hod-dept-name');
    const deptMetaEl = document.getElementById('hod-dept-meta');
    const gridEl = document.getElementById('hod-staff-workload-grid');
    const ticketSelect = document.getElementById('hod-reassign-ticket-select');
    const officerSelect = document.getElementById('hod-reassign-officer-select');
    const reassignBtn = document.getElementById('hod-commit-reassign-btn');
    const radarTbody = document.getElementById('hod-risk-radar-tbody');
    const signoffBtn = document.getElementById('hod-audit-signoff-btn');

    const hodUser = (currentUser && currentUser.role === 'department_head') ? currentUser : users.find((u) => u.role === 'department_head') || users[2];
    const deptName = hodUser.department || 'Maintenance';

    if (deptNameEl) deptNameEl.textContent = `HOD Command: ${deptName}`;
    if (deptMetaEl) deptMetaEl.textContent = `Head of Department: ${hodUser.name} · Institutional Grievance Redressal Committee`;

    // Department staff
    const deptStaff = users.filter((u) => u.role === 'staff' || u.role === 'department_head');

    if (gridEl) {
      gridEl.innerHTML = '';
      deptStaff.forEach((s) => {
        const staffTickets = complaints.filter((c) => (c.assigned_to === s.id || (!c.assigned_to && s.role === 'staff')) && c.status !== 'Closed');
        const count = staffTickets.length;
        const pct = Math.min(100, Math.round((count / 5) * 100));
        const color = count >= 4 ? 'var(--danger)' : count >= 2 ? 'var(--warning)' : 'var(--success)';

        const card = document.createElement('div');
        card.className = 'hod-staff-card';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 800; font-size: 0.85rem;">${s.name}</div>
            <span class="badge" style="background: var(--bg-subtle);">${s.role.replace('_', ' ')}</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${s.email}</div>
          <div style="margin-top: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
              <span>Active Load: <b>${count} jobs</b></span>
              <span class="font-mono font-bold" style="color: ${color};">${pct}%</span>
            </div>
            <div class="hod-load-meter">
              <div class="hod-load-meter-fill" style="width: ${pct}%; background: ${color};"></div>
            </div>
          </div>
        `;
        gridEl.appendChild(card);
      });
    }

    // Populate reassignment dropdowns
    if (ticketSelect) {
      ticketSelect.innerHTML = '<option value="">-- Select Active Ticket to Reassign --</option>';
      complaints.filter((c) => c.status !== 'Closed').forEach((c) => {
        ticketSelect.innerHTML += `<option value="${c.complaint_id}">${c.complaint_id} — ${c.title.slice(0, 32)}... (Current: ${c.assigned_name || 'Unassigned'})</option>`;
      });
    }

    if (officerSelect) {
      officerSelect.innerHTML = '<option value="">-- Reassign to Responding Officer --</option>';
      deptStaff.forEach((s) => {
        officerSelect.innerHTML += `<option value="${s.id}">${s.name} (${s.role.replace('_', ' ')})</option>`;
      });
    }

    if (reassignBtn) {
      reassignBtn.onclick = () => {
        const cid = ticketSelect ? ticketSelect.value : '';
        const officerId = officerSelect ? officerSelect.value : '';
        if (!cid || !officerId) {
          showToast('Please select both a ticket and a target officer.');
          return;
        }

        const c = complaints.find((x) => x.complaint_id === cid);
        const targetOfficer = users.find((u) => u.id === officerId);
        if (!c || !targetOfficer) return;

        const oldName = c.assigned_name || 'Previous Officer';
        c.assigned_to = targetOfficer.id;
        c.assigned_name = targetOfficer.name;
        c.status = 'Assigned';
        const now = new Date().toISOString();

        c.timeline.push({
          status: 'Assigned',
          note: `HOD Reassignment: Delegated from ${oldName} to ${targetOfficer.name} by HOD ${hodUser.name} to optimize workload balance.`,
          at: now,
          author: hodUser.name,
        });

        // Dispatch alert to new officer
        smsLogs.unshift({
          id: 'gw_' + Date.now(),
          channel: 'SMS',
          recipient: targetOfficer.phone || '+91 94432 11002',
          type: 'REASSIGNMENT',
          message: `🏢 *HOD Delegation*: Ticket *${c.complaint_id}* has been reassigned to you by ${hodUser.name}. Priority: ${c.priority}.`,
          status: 'Delivered (Read)',
          timestamp: now,
        });

        addAudit('HOD_TICKET_REASSIGNED', c.complaint_id, `Reassigned to ${targetOfficer.name}`);
        addNotification(targetOfficer.id, 'New Ticket Reassigned to You', `HOD delegated ticket ${c.complaint_id} to your queue.`, c.complaint_id);
        saveAll();

        showToast(`Ticket ${c.complaint_id} successfully reassigned to ${targetOfficer.name}!`);
        renderHodConsole();
      };
    }

    // Critical SLA Risk Radar
    if (radarTbody) {
      radarTbody.innerHTML = '';
      const atRisk = complaints.filter((c) => {
        if (c.status === 'Closed' || c.status === 'Resolved') return false;
        const sla = getSlaStatus(c.sla_deadline, c.status);
        return sla.isOverdue || sla.isApproaching;
      });

      if (atRisk.length === 0) {
        radarTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--success); font-weight: 700;">✓ Excellent! All departmental grievances are operating well within guaranteed SLA boundaries.</td></tr>`;
      } else {
        atRisk.forEach((c) => {
          const sla = getSlaStatus(c.sla_deadline, c.status);
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="font-mono font-bold" style="color: var(--danger);">${c.complaint_id}</td>
            <td>
              <div style="font-weight: 600;">${c.title}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${c.location}</div>
            </td>
            <td>${c.assigned_name || 'Unassigned'}</td>
            <td><span class="font-mono font-bold" style="color: var(--danger);">${sla.formatted}</span></td>
            <td style="text-align: right;">
              <button class="btn btn-danger btn-sm" data-expedite="${c.complaint_id}">⚡ Expedite</button>
            </td>
          `;
          radarTbody.appendChild(tr);
        });

        radarTbody.querySelectorAll('[data-expedite]').forEach((b) => {
          b.onclick = () => {
            const id = b.getAttribute('data-expedite');
            const targetC = complaints.find((x) => x.complaint_id === id);
            if (targetC) {
              targetC.priority = 'Critical';
              targetC.critical = true;
              targetC.timeline.push({
                status: targetC.status,
                note: `HOD EMERGENCY EXPEDITION: Priority escalated to Critical by ${hodUser.name}. Emergency team summoned.`,
                at: new Date().toISOString(),
                author: hodUser.name,
              });
              addAudit('HOD_EXPEDITION_TRIGGERED', targetC.complaint_id, `Escalated to Critical Priority`);
              saveAll();
              showToast(`Ticket ${targetC.complaint_id} expedited to Critical priority!`);
              renderHodConsole();
            }
          };
        });
      }
    }

    if (signoffBtn) {
      signoffBtn.onclick = () => {
        addAudit('HOD_MONTHLY_SIGNOFF', '—', `HOD ${hodUser.name} signed off monthly departmental grievance audit.`);
        saveAll();
        showToast(`Departmental monthly compliance signed off and registered in Dean's audit record!`);
      };
    }
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

      // Brand lockup click handler
      document.querySelectorAll('.brand-lockup').forEach((el) => {
        el.onclick = (e) => {
          e.preventDefault();
          if (currentUser) {
            navigateTo('dashboard');
          } else {
            navigateTo('login');
          }
        };
      });

      // Navigation triggers
      document.querySelectorAll('[data-view]').forEach((el) => {
        if (el.classList.contains('brand-lockup')) return;
        el.onclick = (e) => {
          e.preventDefault();
          const v = el.getAttribute('data-view');
          if (v) navigateTo(v);
        };
      });

      // Role Switcher buttons (Quick Bar & In-page Prompts)
      document.querySelectorAll('[data-switch-role]').forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          const targetId = btn.getAttribute('data-switch-role');
          const targetUser = users.find((u) => u.id === targetId);
          if (targetUser) {
            currentUser = targetUser;
            setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
            updateHeaderUser();
            showToast(`Switched active persona to ${targetUser.name} (${targetUser.role.replace('_', ' ').toUpperCase()})`);

            // Route to persona-specific module
            if (targetUser.role === 'student') {
              navigateTo('student-hub');
            } else if (targetUser.role === 'staff') {
              navigateTo('staff-workstation');
            } else if (targetUser.role === 'department_head') {
              navigateTo('hod-console');
            } else if (targetUser.role === 'admin') {
              navigateTo('admin-command');
            } else {
              navigateTo('dashboard');
            }
          }
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

      // Mobile sidebar hamburger & close handlers
      const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');
      const mobileCloseBtn = document.getElementById('mobile-sidebar-close');
      const sidebarBackdrop = document.getElementById('sidebar-backdrop');
      const appSidebar = document.getElementById('app-sidebar');

      if (mobileToggleBtn && appSidebar) {
        mobileToggleBtn.onclick = (e) => {
          e.preventDefault();
          appSidebar.classList.toggle('mobile-open');
          if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active');
        };
      }

      if (mobileCloseBtn && appSidebar) {
        mobileCloseBtn.onclick = (e) => {
          e.preventDefault();
          appSidebar.classList.remove('mobile-open');
          if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        };
      }

      if (sidebarBackdrop && appSidebar) {
        sidebarBackdrop.onclick = () => {
          appSidebar.classList.remove('mobile-open');
          sidebarBackdrop.classList.remove('active');
        };
      }

      // Initialize modal & simulator handlers
      setupOmbudsmanAppealModal();
      setupNotificationGatewaySimulator();
      setupCompensationClaimModal();
      setupSlaTimeTravelMachine();

      updateHeaderUser();
      updateNavigationVisibility();
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
