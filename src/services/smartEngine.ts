import {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  User,
} from '../types';

export const CATEGORIES: ComplaintCategory[] = [
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

export const DEPARTMENTS: string[] = [
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

export const PRIORITIES: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export const SLA_HOURS: Record<ComplaintPriority, number> = {
  Low: 120,      // 5 days
  Medium: 48,    // 2 days
  High: 12,      // 12 hours
  Critical: 4,   // 4 hours
};

const CATEGORY_RULES: Record<string, string[]> = {
  Hostel: ['hostel', 'room', 'water', 'warden', 'bed', 'bathroom', 'mess', 'accommodation', 'dormitory', 'geyser', 'tap', 'leakage', 'toilet'],
  Transport: ['bus', 'transport', 'driver', 'route', 'vehicle', 'stop', 'commute', 'shuttle', 'pass', 'timing'],
  Fees: ['fee', 'fees', 'payment', 'scholarship', 'refund', 'accounts', 'challan', 'receipt', 'tuition', 'fine', 'dues'],
  Academic: ['exam', 'mark', 'marks', 'faculty', 'course', 'class', 'attendance', 'assignment', 'academic', 'syllabus', 'professor', 'hod', 'timetable', 'hall ticket'],
  'IT Support': ['wifi', 'wi-fi', 'internet', 'computer', 'password', 'login', 'portal', 'network', 'software', 'email', 'lms', 'server', 'erp', 'lan', 'printer'],
  Food: ['food', 'canteen', 'mess', 'breakfast', 'lunch', 'dinner', 'meal', 'hygiene', 'catering', 'snack', 'water cooler'],
  Infrastructure: ['building', 'classroom', 'fan', 'light', 'electricity', 'water', 'chair', 'bench', 'projector', 'lift', 'elevator', 'ac', 'air conditioning', 'switch'],
  Library: ['library', 'book', 'borrow', 'fine', 'reading room', 'journal', 'librarian', 'catalog', 'due date', 'e-resource'],
};

const DEPT_RULES: Record<string, string[]> = {
  'Hostel Maintenance': ['hostel', 'room', 'warden', 'water', 'bathroom', 'dormitory', 'geyser', 'tap', 'leakage'],
  Transport: ['bus', 'transport', 'driver', 'route', 'shuttle', 'vehicle'],
  Accounts: ['fee', 'payment', 'scholarship', 'refund', 'challan', 'tuition'],
  'IT Support': ['wifi', 'wi-fi', 'internet', 'computer', 'password', 'portal', 'network', 'login', 'server', 'lms', 'lan'],
  'Food Services': ['food', 'canteen', 'mess', 'meal', 'breakfast', 'lunch', 'dinner', 'catering'],
  Library: ['library', 'book', 'reading', 'journal', 'catalog'],
  Maintenance: ['building', 'classroom', 'fan', 'light', 'electricity', 'chair', 'bench', 'ac', 'projector', 'lift'],
  Academic: ['exam', 'mark', 'faculty', 'course', 'class', 'attendance', 'assignment', 'hall ticket'],
};

/**
 * Calculates smart category based on keyword frequencies
 */
export function smartCategory(text: string): ComplaintCategory {
  const normalized = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [cat, words] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    for (const word of words) {
      if (normalized.includes(word)) {
        score += 1;
      }
    }
    scores[cat] = score;
  }

  let bestCat: string = 'Other';
  let maxScore = 0;

  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCat = cat;
    }
  }

  return (maxScore > 0 ? bestCat : 'Other') as ComplaintCategory;
}

/**
 * Maps smart department based on text content and detected category
 */
export function smartDepartment(text: string, category: ComplaintCategory): string {
  const normalized = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [dept, words] of Object.entries(DEPT_RULES)) {
    let score = 0;
    for (const word of words) {
      if (normalized.includes(word)) {
        score += 1;
      }
    }
    scores[dept] = score;
  }

  let bestDept = '';
  let maxScore = 0;

  for (const [dept, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestDept = dept;
    }
  }

  if (maxScore > 0) return bestDept;

  const fallbackMap: Record<string, string> = {
    Hostel: 'Hostel Maintenance',
    Transport: 'Transport',
    Fees: 'Accounts',
    'IT Support': 'IT Support',
    Food: 'Food Services',
    Library: 'Library',
    Academic: 'Academic',
    Infrastructure: 'Maintenance',
  };

  return fallbackMap[category] || 'General Administration';
}

/**
 * Detects priority level with critical keyword triggers
 */
export function smartPriority(text: string, isCriticalCheckbox: boolean = false): ComplaintPriority {
  const t = text.toLowerCase();

  const criticalKeywords = [
    'emergency',
    'danger',
    'fire',
    'accident',
    'injury',
    'security threat',
    'no water in entire',
    'power failure entire',
    'sparking',
    'short circuit',
    'life threat',
    'ragging',
    'harassment',
  ];

  if (isCriticalCheckbox || criticalKeywords.some((w) => t.includes(w))) {
    return 'Critical';
  }

  const highKeywords = [
    'urgent',
    'immediately',
    'unsafe',
    'no water',
    'no electricity',
    'cannot attend',
    'system down',
    'exam tomorrow',
    'hall ticket blocked',
    'blocked portal',
    'broken pipe',
    'flooding',
  ];

  if (highKeywords.some((w) => t.includes(w))) {
    return 'High';
  }

  const mediumKeywords = [
    'not working',
    'problem',
    'issue',
    'delay',
    'broken',
    'slow',
    'damaged',
    'faulty',
    'incorrect',
    'missing',
  ];

  if (mediumKeywords.some((w) => t.includes(w))) {
    return 'Medium';
  }

  return 'Low';
}

/**
 * Bigram/Dice Coefficient text similarity matching (SequenceMatcher equivalent)
 */
function getBigrams(str: string): Set<string> {
  const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const bigrams = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.substring(i, i + 2));
  }
  return bigrams;
}

export function calculateTextSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1.trim().toLowerCase() === str2.trim().toLowerCase()) return 1.0;

  const bg1 = getBigrams(str1);
  const bg2 = getBigrams(str2);

  if (bg1.size === 0 || bg2.size === 0) return 0;

  let intersection = 0;
  bg1.forEach((b) => {
    if (bg2.has(b)) intersection++;
  });

  return (2 * intersection) / (bg1.size + bg2.size);
}

/**
 * Searches existing complaints to detect potential duplicates
 */
export function findDuplicate(
  title: string,
  description: string,
  existingComplaints: Complaint[],
  currentStudentId?: string,
  currentComplaintId?: string
): Complaint | null {
  const newText = `${title} ${description}`.trim();
  if (newText.length < 10) return null;

  for (const c of existingComplaints) {
    if (c.complaint_id === currentComplaintId) continue;
    // Don't flag resolved/closed from months ago as blocking duplicates if student wants to report again
    if (c.status === 'Closed') continue;

    const oldText = `${c.title} ${c.description}`.trim();
    const ratio = calculateTextSimilarity(newText, oldText);

    if (ratio >= 0.65) {
      return c;
    }
  }

  return null;
}

/**
 * Workload-aware staff assignment algorithm:
 * Finds active staff in the designated department with the lowest number of unresolved complaints
 */
export function suggestStaff(
  department: string,
  allUsers: User[],
  complaints: Complaint[]
): User | null {
  const candidates = allUsers.filter(
    (u) =>
      u.active &&
      (u.role === 'staff' || u.role === 'department_head') &&
      u.department.toLowerCase() === department.toLowerCase()
  );

  if (candidates.length === 0) {
    // Fallback: look for general administration or staff who handles any department
    const generalStaff = allUsers.filter(
      (u) => u.active && (u.role === 'staff' || u.role === 'department_head')
    );
    if (generalStaff.length === 0) return null;
    return generalStaff[0];
  }

  const loadRanked = candidates.map((staff) => {
    const activeLoad = complaints.filter(
      (c) =>
        c.assigned_to === staff.id &&
        c.status !== 'Resolved' &&
        c.status !== 'Closed'
    ).length;
    return { staff, activeLoad };
  });

  loadRanked.sort((a, b) => a.activeLoad - b.activeLoad);
  return loadRanked[0].staff;
}

/**
 * Action guidance tips based on priority & category
 */
export function getActionTip(priority: ComplaintPriority, category: ComplaintCategory): string {
  if (priority === 'Critical') {
    return 'Immediate campus security & physical safety teams are auto-alerted. If in bodily danger, also contact the emergency control room Ext. 999.';
  }
  if (priority === 'High') {
    return 'State your exact room/floor and whether your batchmates or wing are affected so maintenance can dispatch emergency teams with proper gear.';
  }
  if (category === 'Academic') {
    return 'Provide your course code, section, semester, and faculty name for expedited academic board review.';
  }
  if (category === 'Fees') {
    return 'Keep your transaction reference number, student ID, and challan date handy in the description.';
  }
  if (category === 'IT Support') {
    return 'Mention device OS, MAC address if on campus Wi-Fi, and any specific error code displayed on the portal.';
  }
  return 'Provide clear details, time when issue began, and physical location to resolve this within the guaranteed SLA.';
}

/**
 * SLA countdown calculation
 */
export function getSlaStatus(deadlineIso: string, status: string): {
  isOverdue: boolean;
  isApproaching: boolean; // < 6 hours
  formatted: string;
  totalHoursRemaining: number;
} {
  if (status === 'Resolved' || status === 'Closed') {
    return {
      isOverdue: false,
      isApproaching: false,
      formatted: 'Completed within SLA',
      totalHoursRemaining: 999,
    };
  }

  const now = new Date().getTime();
  const deadline = new Date(deadlineIso).getTime();
  const diffMs = deadline - now;
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

  const totalHoursRemaining = diffMs / (1000 * 60 * 60);
  const isApproaching = !isOverdue && totalHoursRemaining <= 6;

  let formatted = '';
  if (isOverdue) {
    formatted = `Overdue by ${hours}h ${minutes}m`;
  } else {
    formatted = `${hours}h ${minutes}m remaining`;
  }

  return {
    isOverdue,
    isApproaching,
    formatted,
    totalHoursRemaining,
  };
}

export function generateComplaintId(): string {
  const dateStr = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(2, 12);
  const rand = Math.floor(100 + Math.random() * 900);
  return `CC-${dateStr}${rand}`;
}
