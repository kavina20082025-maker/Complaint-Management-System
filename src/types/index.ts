export type UserRole = 'student' | 'staff' | 'department_head' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  studentId?: string;
  avatarUrl?: string;
  active: boolean;
  phone?: string;
}

export type ComplaintCategory =
  | 'Academic'
  | 'Hostel'
  | 'Transport'
  | 'Fees'
  | 'Food'
  | 'IT Support'
  | 'Infrastructure'
  | 'Library'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened'
  | 'Escalated';

export interface TimelineEvent {
  status: ComplaintStatus;
  note: string;
  at: string; // ISO string
  author?: string;
}

export interface Attachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Complaint {
  complaint_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  anonymous: boolean;
  location: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  department: string;
  status: ComplaintStatus;
  sla_hours: number;
  sla_deadline: string; // ISO date
  created_at: string;
  updated_at: string;
  attachments: Attachment[];
  duplicate_of?: string | null;
  critical: boolean;
  assigned_to?: string;
  assigned_name?: string;
  timeline: TimelineEvent[];
  verified?: boolean;
  verified_at?: string;
  verification_note?: string;
  rating?: number; // 1 to 5
  feedback?: string;
  feedback_at?: string;
}

export interface Message {
  id: string;
  complaint_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  body: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  complaint_id?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'students' | 'staff';
  created_at: string;
  created_by: string;
  urgent?: boolean;
}

export interface MaintenanceNotice {
  id: string;
  title: string;
  area: string;
  date: string;
  note: string;
  created_by: string;
  created_at: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface ServiceDesk {
  id: string;
  name: string;
  department: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  hours: string;
}

export interface ResponseTemplate {
  id: string;
  title: string;
  body: string;
  department?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  complaint_id?: string;
  detail: string;
  created_at: string;
}
