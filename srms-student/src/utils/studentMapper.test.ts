import { describe, expect, it } from 'vitest';
import { mapStudentProfile, mapSchoolBrand } from './studentMapper';

describe('student mapper', () => {
  it('maps backend student data to the student portal profile shape', () => {
    const profile = mapStudentProfile({
      _id: 'student_123',
      name: 'Ali Khan',
      class: 'Class 10',
      section: 'A',
      admission_number: 'GVA-1042',
      academic_year_id: { name: '2026-27' },
      roll_number: '10A-17',
      father_name: 'Ahmad Khan',
      mother_name: 'Ayesha Khan',
      gender: 'Male',
      dob: '2008-06-14',
      address: 'Lahore',
      school_id: { name: 'Green Valley Academy' },
    });

    expect(profile.id).toBe('student_123');
    expect(profile.name).toBe('Ali Khan');
    expect(profile.className).toBe('Class 10');
    expect(profile.section).toBe('A');
    expect(profile.grade).toBe('A');
    expect(profile.academicYear).toBe('2026-27');
  });

  it('maps school payload to the existing portal brand model', () => {
    const school = mapSchoolBrand({
      _id: 'school_1',
      name: 'Green Valley Academy',
      abbreviation: 'GVA',
      address: 'Lahore',
      phone: '+92 300 1234567',
      email: 'hello@greenvalley.edu.pk',
      website: 'https://greenvalley.edu.pk',
    });

    expect(school.name).toBe('Green Valley Academy');
    expect(school.logo).toBe('GVA');
  });
});
