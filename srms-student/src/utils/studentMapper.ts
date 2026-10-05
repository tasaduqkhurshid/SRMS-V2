import type { SchoolBrand, StudentProfile } from '../models';

export const mapSchoolBrand = (school: Partial<SchoolBrand> & Record<string, any> = {}): SchoolBrand => {
  const name = school.name || school.school_name || 'School';
  const abbreviation = school.abbreviation || school.school_code || name.slice(0, 3).toUpperCase();

  return {
    name,
    address: school.address || '',
    phone: school.phone || school.contact_number || '',
    email: school.email || '',
    website: school.website || '',
    schoolCode: school.schoolCode || school.school_code || '',
    primaryColor: '#1d4ed8',
    secondaryColor: '#0f766e',
    logo: abbreviation.toUpperCase(),
    logoUrl: school.logoUrl || school.logo_url || school.logo_path || '',
    campusImageUrl: school.campusImageUrl || school.campus_image_url || '',
  };
};

export const mapStudentProfile = (student: Record<string, any> = {}): StudentProfile => {
  const academicYear = student.academic_year_id?.name || student.academic_year || 'Current Year';
  const className = student.className || student.class || 'N/A';
  const section = student.section || 'A';
  const name = student.name || 'Student';

  const fallbackGrade = (value: number) => {
    if (value >= 90) return 'A';
    if (value >= 75) return 'B+';
    if (value >= 60) return 'B';
    return 'C';
  };

  const attendance = typeof student.attendance === 'number' ? student.attendance : 92;
  const performance = typeof student.performance === 'number' ? student.performance : 92;
  const pendingFee = typeof student.pendingFee === 'number' ? student.pendingFee : Number(student.pending_fee || 0);

  return {
    id: student._id || student.id || 'student-1',
    name,
    className,
    section,
    admissionNumber: student.admission_number || student.admissionNumber || '',
    academicYear,
    rollNumber: student.roll_number || student.rollNumber || '',
    attendance,
    performance,
    pendingFee,
    nextExam: student.next_exam || student.nextExam || 'Final Examination',
    nextExamDate: student.next_exam_date || student.nextExamDate || new Date().toISOString().slice(0, 10),
    avatar: student.avatar || name.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase() || 'ST',
    grade: student.grade || fallbackGrade(performance),
    guardianName: student.guardian_name || student.guardianName || student.father_name || 'Parent',
    phone: student.phone || '',
    email: student.email || '',
    address: student.address || '',
  };
};
