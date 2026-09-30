import {
  Announcement,
  AuditLog,
  Complaint,
  MaintenanceNotice,
  Message,
  NotificationItem,
  ResponseTemplate,
  ServiceDesk,
  User,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'campuscare_current_user',
  USERS: 'campuscare_users',
  COMPLAINTS: 'campuscare_complaints',
  MESSAGES: 'campuscare_messages',
  NOTIFICATIONS: 'campuscare_notifications',
  ANNOUNCEMENTS: 'campuscare_announcements',
  MAINTENANCE: 'campuscare_maintenance',
  SERVICES: 'campuscare_services',
  TEMPLATES: 'campuscare_templates',
  AUDIT_LOGS: 'campuscare_audit_logs',
  WATCHLIST: 'campuscare_watchlist',
  THEME: 'campuscare_theme',
};

// Default seed users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_student_kavin',
    name: 'Kavin A M',
    email: 'kavinam@karunya.edu.in',
    role: 'student',
    department: 'Computer Science & Engineering',
    studentId: 'URK23CS1042',
    active: true,
    phone: '+91 98765 43210',
  },
  {
    id: 'usr_staff_rajesh',
    name: 'Dr. Rajesh Kumar',
    email: 'staff@campus.com',
    role: 'staff',
    department: 'Maintenance',
    avatarUrl: '/src/assets/images/avatar_staff_specialist_1790786379532.jpg',
    active: true,
    phone: 'Ext. 204',
  },
  {
    id: 'usr_staff_ananya',
    name: 'Ananya Sharma',
    email: 'itstaff@campus.com',
    role: 'staff',
    department: 'IT Support',
    active: true,
    phone: 'Ext. 102',
  },
  {
    id: 'usr_head_selvam',
    name: 'Prof. M. Selvam',
    email: 'head@campus.com',
    role: 'department_head',
    department: 'Maintenance',
    active: true,
    phone: 'Ext. 200',
  },
  {
    id: 'usr_admin_sarah',
    name: 'Dr. Sarah Jenkins',
    email: 'admin@campus.com',
    role: 'admin',
    department: 'General Administration',
    avatarUrl: '/src/assets/images/avatar_admin_officer_1790786368554.jpg',
    active: true,
    phone: 'Ext. 900',
  },
];

// Helper to make relative ISO deadlines
const hoursFromNow = (h: number): string => {
  return new Date(Date.now() + h * 3600 * 1000).toISOString();
};
const hoursAgo = (h: number): string => {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
};

const INITIAL_COMPLAINTS: Complaint[] = [
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
    attachments: [
      {
        name: 'water_leak_corridor.jpg',
        size: '1.8 MB',
        type: 'image/jpeg',
      },
    ],
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
    // Perfect demo: resolved, waiting for student verification!
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
    attachments: [
      {
        name: 'ping_packet_loss_log.txt',
        size: '24 KB',
        type: 'text/plain',
      },
    ],
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
    student_id: 'usr_student_2',
    student_name: 'Priya Dharshini',
    student_email: 'priyadh@karunya.edu.in',
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
    student_id: 'usr_student_3',
    student_name: 'Arun Balaji',
    student_email: 'arunb@karunya.edu.in',
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
    attachments: [
      {
        name: 'bank_neft_challan.pdf',
        size: '420 KB',
        type: 'application/pdf',
      },
    ],
    critical: false,
    assigned_to: 'usr_admin_sarah',
    assigned_name: 'Dr. Sarah Jenkins',
    timeline: [
      {
        status: 'Pending',
        note: 'Submitted with bank payment challan.',
        at: hoursAgo(48),
      },
      {
        status: 'In Progress',
        note: 'Accounts desk reconciling UTR with State Bank nodal account.',
        at: hoursAgo(36),
      },
      {
        status: 'Resolved',
        note: 'Ledger updated, fee clearance certificate generated on ERP.',
        at: hoursAgo(18),
      },
      {
        status: 'Closed',
        note: 'Student verified that fee dues cleared and hall ticket unlocked.',
        at: hoursAgo(12),
        author: 'Arun Balaji',
      },
    ],
    verified: true,
    verified_at: hoursAgo(12),
    verification_note: 'Verified in ERP portal. Hall ticket downloaded successfully. Thanks for fast action!',
    rating: 5,
    feedback: 'Accounts staff responded promptly and reconciled the bank transaction within a few hours.',
    feedback_at: hoursAgo(12),
  },
  {
    complaint_id: 'CC-260927105',
    student_id: 'usr_student_kavin',
    student_name: 'Kavin A M',
    student_email: 'kavinam@karunya.edu.in',
    anonymous: false,
    location: 'Campus South Gate Shuttle Terminal',
    title: 'Route 8 Evening Shuttle Bus Skipping South Gate Stop',
    description:
      'For three consecutive days, the 5:30 PM Route 8 shuttle bypassed the South Gate waiting shed, leaving over 35 day-scholar students stranded for over 45 minutes.',
    category: 'Transport',
    priority: 'Medium',
    department: 'Transport',
    status: 'Escalated',
    sla_hours: 48,
    sla_deadline: hoursAgo(12), // Overdue!
    created_at: hoursAgo(62),
    updated_at: hoursAgo(4),
    attachments: [],
    critical: false,
    assigned_to: 'usr_head_selvam',
    assigned_name: 'Prof. M. Selvam',
    timeline: [
      {
        status: 'Pending',
        note: 'Complaint logged for Transport Bureau.',
        at: hoursAgo(62),
      },
      {
        status: 'Assigned',
        note: 'Assigned to Transport Coordinator.',
        at: hoursAgo(60),
      },
      {
        status: 'Escalated',
        note: 'SLA target exceeded 48 hours without closure. Automatically escalated to Dean of Student Affairs.',
        at: hoursAgo(12),
        author: 'SLA Daemon',
      },
    ],
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    complaint_id: 'CC-260930101',
    user_id: 'usr_student_kavin',
    user_name: 'Kavin A M',
    user_email: 'kavinam@karunya.edu.in',
    user_role: 'student',
    body: 'Hello sir, the water is already spreading into Rooms 312 and 314. Could you please send someone urgently before floor mats are ruined?',
    created_at: hoursAgo(6),
  },
  {
    id: 'msg_2',
    complaint_id: 'CC-260930101',
    user_id: 'usr_staff_rajesh',
    user_name: 'Dr. Rajesh Kumar',
    user_email: 'staff@campus.com',
    user_role: 'staff',
    body: 'Plumber Murugan is already on his way to the 3rd floor with main stopcock isolator tools. The main line valve is being shut off right now.',
    created_at: hoursAgo(5.8),
  },
  {
    id: 'msg_3',
    complaint_id: 'CC-260930101',
    user_id: 'usr_staff_rajesh',
    user_name: 'Dr. Rajesh Kumar',
    user_email: 'staff@campus.com',
    user_role: 'staff',
    body: 'We have replaced the damaged section and tested the pressure. Please let us know if your taps are flowing cleanly.',
    created_at: hoursAgo(1),
  },
  {
    id: 'msg_4',
    complaint_id: 'CC-260930102',
    user_id: 'usr_student_kavin',
    user_name: 'Kavin A M',
    user_email: 'kavinam@karunya.edu.in',
    user_role: 'student',
    body: 'The signal is strongest on 5GHz band, but after 3 minutes the DHCP lease drops.',
    created_at: hoursAgo(8),
  },
  {
    id: 'msg_5',
    complaint_id: 'CC-260930102',
    user_id: 'usr_staff_ananya',
    user_name: 'Ananya Sharma',
    user_email: 'itstaff@campus.com',
    user_role: 'staff',
    body: 'Noted Kavin. We are checking if rogue DHCP broadcasts are originating from one of the desktop rigs in Row C.',
    created_at: hoursAgo(2),
  },
];

const INITIAL_SERVICES: ServiceDesk[] = [
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

const INITIAL_MAINTENANCE: MaintenanceNotice[] = [
  {
    id: 'maint_1',
    title: 'Hostel Block B & C Overhead Water Tank Deep Sanitization',
    area: 'Hostel Blocks B and C',
    date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
    note: 'Municipal chlorination and ultraviolet tank scouring. Supply will be suspended between 08:00 AM and 01:00 PM. Alternate reserve taps available at Ground Floor tank.',
    created_by: 'staff@campus.com',
    created_at: hoursAgo(14),
    status: 'Scheduled',
  },
  {
    id: 'maint_2',
    title: 'Campus Central Fiber Backbone Switch Migration',
    area: 'Academic Blocks 1 to 4 & Central Library',
    date: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
    note: 'Upgrading core network 10G SFP+ modules. Brief 15-minute intermittent network drops expected between 11:00 PM and 11:30 PM.',
    created_by: 'itstaff@campus.com',
    created_at: hoursAgo(20),
    status: 'Scheduled',
  },
  {
    id: 'maint_3',
    title: 'High-Tension Substation Safety Breaker Calibrations',
    area: 'Whole Campus Power Grid',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
    note: 'Scheduled statutory load testing on diesel backup generators. Successfully completed without classroom interruptions.',
    created_by: 'staff@campus.com',
    created_at: hoursAgo(50),
    status: 'Completed',
  },
];

const INITIAL_TEMPLATES: ResponseTemplate[] = [
  {
    id: 'tmpl_1',
    title: 'Acknowledged & Field Tech Dispatched',
    body: 'Your complaint has been acknowledged by the duty desk. A specialized technician has been dispatched to your location with estimated arrival within 45 minutes.',
  },
  {
    id: 'tmpl_2',
    title: 'Awaiting Hardware / Replacement Spare',
    body: 'Site inspection has completed. A replacement component has been requisitioned from the campus engineering store. Work will resume immediately upon store issue.',
  },
  {
    id: 'tmpl_3',
    title: 'Resolved - Awaiting Student Confirmation',
    body: 'The reported issue has been addressed and tested by the service team. Please review the service restoration on your end and verify the resolution in the portal.',
  },
  {
    id: 'tmpl_4',
    title: 'Escalated to Department Head',
    body: 'Due to procurement requirements or multi-department coordination, this matter has been forwarded directly to the Department Head for expedited clearance.',
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
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
  {
    id: 'ann_3',
    title: 'Mid-Semester Examination Hall Ticket Issuance Policy',
    message:
      'Students experiencing any portal fee reconciliation delays are advised to submit an Accounts grievance with bank UTR attachment to unlock provisional clearance without queuing at counters.',
    audience: 'all',
    created_at: hoursAgo(100),
    created_by: 'Academic Office',
    urgent: false,
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    user_id: 'usr_student_kavin',
    title: 'Complaint Resolved: Verification Requested',
    message: 'Complaint CC-260930101 (Water pipeline leakage) has been marked Resolved. Please verify if it is working.',
    read: false,
    created_at: hoursAgo(1),
    complaint_id: 'CC-260930101',
  },
  {
    id: 'notif_2',
    user_id: 'usr_student_kavin',
    title: 'Technician Update on Network Issue',
    message: 'Ananya Sharma updated status to In Progress on complaint CC-260930102.',
    read: true,
    created_at: hoursAgo(2),
    complaint_id: 'CC-260930102',
  },
  {
    id: 'notif_3',
    user_id: 'usr_staff_rajesh',
    title: 'New High Priority Complaint Assigned',
    message: 'Complaint CC-260930101 (Hostel Block C) has been auto-assigned to your queue.',
    read: true,
    created_at: hoursAgo(6.5),
    complaint_id: 'CC-260930101',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    user_id: 'usr_student_kavin',
    user_email: 'kavinam@karunya.edu.in',
    action: 'COMPLAINT_CREATED',
    complaint_id: 'CC-260930101',
    detail: 'Category=Hostel, Priority=High, SLA=12h, Dept=Hostel Maintenance',
    created_at: hoursAgo(7),
  },
  {
    id: 'aud_2',
    user_id: 'usr_staff_rajesh',
    user_email: 'staff@campus.com',
    action: 'STATUS_CHANGED',
    complaint_id: 'CC-260930101',
    detail: 'Status changed to In Progress',
    created_at: hoursAgo(4),
  },
  {
    id: 'aud_3',
    user_id: 'usr_staff_rajesh',
    user_email: 'staff@campus.com',
    action: 'STATUS_CHANGED',
    complaint_id: 'CC-260930101',
    detail: 'Status changed to Resolved (awaiting student verification)',
    created_at: hoursAgo(1),
  },
  {
    id: 'aud_4',
    user_id: 'usr_admin_sarah',
    user_email: 'admin@campus.com',
    action: 'LOGIN',
    detail: 'User logged in to Command Center',
    created_at: hoursAgo(3),
  },
];

// Helper to safely get from localStorage with initial fallback
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (e) {
    console.warn(`Storage read error for ${key}:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Storage write error for ${key}:`, e);
  }
}

export class CampusCareStorage {
  // Current user session
  static getCurrentUser(): User {
    const user = getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (user) return user;
    // Default to student Kavin
    return INITIAL_USERS[0];
  }

  static setCurrentUser(user: User): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    this.addAuditLog(user.id, user.email, 'SWITCH_ROLE', undefined, `Switched view to ${user.name} (${user.role})`);
  }

  static getAllUsers(): User[] {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static saveUsers(users: User[]): void {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  static toggleUserActive(userId: string): void {
    const users = this.getAllUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u));
    this.saveUsers(updated);
  }

  static addUser(user: User): void {
    const users = this.getAllUsers();
    users.unshift(user);
    this.saveUsers(users);
    this.addAuditLog(this.getCurrentUser().id, this.getCurrentUser().email, 'USER_CREATED', undefined, `${user.email} (${user.role})`);
  }

  // Complaints
  static getComplaints(): Complaint[] {
    return getFromStorage<Complaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  }

  static saveComplaints(complaints: Complaint[]): void {
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);
  }

  static getComplaintById(cid: string): Complaint | undefined {
    const list = this.getComplaints();
    return list.find((c) => c.complaint_id === cid);
  }

  static addComplaint(complaint: Complaint): void {
    const list = this.getComplaints();
    list.unshift(complaint);
    this.saveComplaints(list);

    this.addAuditLog(
      complaint.student_id,
      complaint.student_email,
      'COMPLAINT_CREATED',
      complaint.complaint_id,
      `Category=${complaint.category}, Priority=${complaint.priority}, Dept=${complaint.department}`
    );

    // Notify assigned staff
    if (complaint.assigned_to) {
      this.addNotification(
        complaint.assigned_to,
        'New Complaint Assigned',
        `Complaint ${complaint.complaint_id} (${complaint.title.slice(0, 45)}...) was assigned to you.`,
        complaint.complaint_id
      );
    }
  }

  static updateComplaint(updated: Complaint): void {
    const list = this.getComplaints();
    const idx = list.findIndex((c) => c.complaint_id === updated.complaint_id);
    if (idx !== -1) {
      list[idx] = updated;
      this.saveComplaints(list);
    }
  }

  // Watchlist
  static getWatchlist(userId: string): string[] {
    const all = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.WATCHLIST, {
      usr_student_kavin: ['CC-260930101', 'CC-260927105'],
    });
    return all[userId] || [];
  }

  static toggleWatchlist(userId: string, complaintId: string): boolean {
    const all = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.WATCHLIST, {});
    const userList = all[userId] || [];
    const exists = userList.includes(complaintId);
    let updated: string[];

    if (exists) {
      updated = userList.filter((id) => id !== complaintId);
    } else {
      updated = [...userList, complaintId];
    }

    all[userId] = updated;
    saveToStorage(STORAGE_KEYS.WATCHLIST, all);
    return !exists;
  }

  // Messages
  static getMessages(complaintId: string): Message[] {
    const all = getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return all.filter((m) => m.complaint_id === complaintId);
  }

  static addMessage(msg: Message): void {
    const all = getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    all.push(msg);
    saveToStorage(STORAGE_KEYS.MESSAGES, all);

    this.addAuditLog(msg.user_id, msg.user_email, 'MESSAGE_SENT', msg.complaint_id, msg.body.slice(0, 60));

    // Send notification to the opposite party
    const complaint = this.getComplaintById(msg.complaint_id);
    if (complaint) {
      if (msg.user_role === 'student') {
        if (complaint.assigned_to) {
          this.addNotification(
            complaint.assigned_to,
            'New Student Reply',
            `Student replied on ${complaint.complaint_id}: "${msg.body.slice(0, 60)}"`,
            complaint.complaint_id
          );
        }
      } else {
        this.addNotification(
          complaint.student_id,
          'Administrative Update on Your Issue',
          `${msg.user_name} sent a message on ${complaint.complaint_id}`,
          complaint.complaint_id
        );
      }
    }
  }

  // Notifications
  static getNotifications(userId: string): NotificationItem[] {
    const all = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter((n) => n.user_id === userId);
  }

  static addNotification(userId: string, title: string, message: string, complaintId?: string): void {
    const all = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      title,
      message,
      read: false,
      created_at: new Date().toISOString(),
      complaint_id: complaintId,
    };
    all.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  static markAllNotificationsRead(userId: string): void {
    const all = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = all.map((n) => (n.user_id === userId ? { ...n, read: true } : n));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // Announcements
  static getAnnouncements(): Announcement[] {
    return getFromStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }

  static addAnnouncement(announcement: Announcement): void {
    const all = this.getAnnouncements();
    all.unshift(announcement);
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, all);
    this.addAuditLog(this.getCurrentUser().id, this.getCurrentUser().email, 'ANNOUNCEMENT_CREATED', undefined, announcement.title);
  }

  // Maintenance
  static getMaintenance(): MaintenanceNotice[] {
    return getFromStorage<MaintenanceNotice[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE);
  }

  static addMaintenance(item: MaintenanceNotice): void {
    const all = this.getMaintenance();
    all.unshift(item);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, all);
    this.addAuditLog(this.getCurrentUser().id, this.getCurrentUser().email, 'MAINTENANCE_CREATED', undefined, `${item.title} (${item.area})`);
  }

  // Services Directory
  static getServices(): ServiceDesk[] {
    return getFromStorage<ServiceDesk[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  }

  // Response Templates
  static getTemplates(): ResponseTemplate[] {
    return getFromStorage<ResponseTemplate[]>(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
  }

  static addTemplate(template: ResponseTemplate): void {
    const all = this.getTemplates();
    all.unshift(template);
    saveToStorage(STORAGE_KEYS.TEMPLATES, all);
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  static addAuditLog(userId: string, userEmail: string, action: string, complaintId?: string, detail: string = ''): void {
    const all = getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    all.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      user_email: userEmail,
      action,
      complaint_id: complaintId,
      detail,
      created_at: new Date().toISOString(),
    });
    // keep latest 250
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, all.slice(0, 250));
  }

  // Theme
  static getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  }

  static setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Reset to default factory state
  static resetToDefaults(): void {
    localStorage.clear();
    window.location.reload();
  }
}
