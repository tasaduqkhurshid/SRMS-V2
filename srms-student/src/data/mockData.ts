import type {
  HomeworkItem,
  LearningMaterial,
  NoticeItem,
  NotificationItem,
  ParentSession,
  ResultRecord,
  SchoolBrand,
  StudentProfile,
} from '../models';

export const schoolBrand: SchoolBrand = {
  name: 'Green Valley Academy',
  address: '14 Orchard Road, Lahore',
  phone: '+92 300 1234567',
  email: 'hello@greenvalley.edu.pk',
  website: 'https://greenvalley.edu.pk',
  primaryColor: '#1d4ed8',
  secondaryColor: '#0f766e',
  logo: 'GV',
};

export const studentProfiles: StudentProfile[] = [
  {
    id: 'ali-khan',
    name: 'Ali Khan',
    className: 'Class 10-A',
    section: 'Section A',
    admissionNumber: 'GVA-2026-1042',
    academicYear: '2026-27',
    rollNumber: '10A-17',
    attendance: 92,
    performance: 87,
    pendingFee: 4500,
    nextExam: 'Mathematics',
    nextExamDate: '2026-10-12',
    avatar: 'AK',
    grade: 'A',
    guardianName: 'Mr. Ahmad Khan',
    phone: '+92 321 4567890',
    email: 'ali.khan@demo.greenvalley.edu.pk',
    address: 'House 42, Gulshan-e-Iqbal, Lahore',
  },
  {
    id: 'sara-khan',
    name: 'Sara Khan',
    className: 'Class 7-B',
    section: 'Section B',
    admissionNumber: 'GVA-2026-1186',
    academicYear: '2026-27',
    rollNumber: '7B-09',
    attendance: 96,
    performance: 90,
    pendingFee: 2800,
    nextExam: 'Science',
    nextExamDate: '2026-10-18',
    avatar: 'SK',
    grade: 'A+',
    guardianName: 'Mr. Ahmad Khan',
    phone: '+92 321 4567890',
    email: 'sara.khan@demo.greenvalley.edu.pk',
    address: 'House 42, Gulshan-e-Iqbal, Lahore',
  },
];

export const parentSession: ParentSession = {
  id: 'mr-ahmad',
  name: 'Mr. Ahmad Khan',
  email: 'ahmad.khan@demo.greenvalley.edu.pk',
  children: studentProfiles,
};

export const notices: NoticeItem[] = [
  {
    id: 'n1',
    title: 'School Annual Function',
    category: 'General',
    date: '2026-10-05',
    priority: 'High',
    description: 'The annual function will be held on 18 October at the main auditorium. Parents are welcome.',
  },
  {
    id: 'n2',
    title: 'Midterm Report Cards',
    category: 'Academic',
    date: '2026-10-03',
    priority: 'Medium',
    description: 'Report cards for the first assessment cycle are available for viewing in the portal.',
  },
];

export const homework: HomeworkItem[] = [
  { id: 'h1', subject: 'Mathematics', title: 'Quadratic Equations', dueDate: '2026-10-12', status: 'Pending' },
  { id: 'h2', subject: 'Science', title: 'Plant Cell Diagram', dueDate: '2026-10-10', status: 'Overdue' },
  { id: 'h3', subject: 'English', title: 'Grammar Practice', dueDate: '2026-10-15', status: 'Submitted' },
];

export const learningMaterials: LearningMaterial[] = [
  { id: 'l1', title: 'Quadratic Equations', subject: 'Mathematics', chapter: 'Algebra', updatedAt: '2026-10-05', type: 'notes' },
  { id: 'l2', title: 'Photosynthesis Basics', subject: 'Science', chapter: 'Biology', updatedAt: '2026-10-04', type: 'video' },
  { id: 'l3', title: 'Essay Writing', subject: 'English', chapter: 'Writing Skills', updatedAt: '2026-10-02', type: 'notes' },
];

export const notifications: NotificationItem[] = [
  {
    id: 'nt1',
    category: 'Academic',
    title: 'Result Published',
    description: 'Annual Examination 2026 result is now available.',
    timeAgo: '2 hours ago',
    unread: true,
    route: '/results',
  },
  {
    id: 'nt2',
    category: 'Fees',
    title: 'Fee Reminder',
    description: 'Pending fee of ₹4,500 is due by 20 October.',
    timeAgo: '1 day ago',
    unread: true,
    route: '/fees',
  },
  {
    id: 'nt3',
    category: 'Homework',
    title: 'Assignment Due',
    description: 'Mathematics assignment is due tomorrow.',
    timeAgo: '3 days ago',
    unread: false,
    route: '/homework',
  },
];

export const results: ResultRecord[] = [
  { id: 'r1', subject: 'Mathematics', marks: 92, grade: 'A', teacherRemark: 'Excellent understanding and application.' },
  { id: 'r2', subject: 'Science', marks: 88, grade: 'A', teacherRemark: 'Strong analytical reasoning.' },
  { id: 'r3', subject: 'English', marks: 79, grade: 'B+', teacherRemark: 'Good expression with room for improvement.' },
];
