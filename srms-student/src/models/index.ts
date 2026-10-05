export type Role = 'student' | 'parent';

export interface SchoolBrand {
  name: string;
  schoolCode?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  logoUrl?: string;
  campusImageUrl?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  className: string;
  section: string;
  admissionNumber: string;
  academicYear: string;
  rollNumber: string;
  attendance: number;
  performance: number;
  pendingFee: number;
  nextExam: string;
  nextExamDate: string;
  avatar: string;
  grade: string;
  guardianName: string;
  phone: string;
  email: string;
  address: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  category: string;
  date: string;
  priority: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Overdue';
}

export interface LearningMaterial {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  updatedAt: string;
  type: 'notes' | 'video';
}

export interface NotificationItem {
  id: string;
  category: 'Academic' | 'Fees' | 'Exams' | 'Homework' | 'Attendance' | 'General';
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
  route: string;
}

export interface FeeStructureItem {
  id: string;
  label: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

export interface AttendanceEntry {
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export interface ResultRecord {
  id: string;
  subject: string;
  marks: number;
  grade: string;
  teacherRemark: string;
}

export interface ParentSession {
  id: string;
  name: string;
  email: string;
  children: StudentProfile[];
}
