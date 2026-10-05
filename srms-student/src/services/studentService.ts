import { ApiClient } from '../api/ApiClient';
import { mapStudentProfile } from '../utils/studentMapper';
import { studentProfiles } from '../data/mockData';
import type { StudentProfile } from '../models';

export const studentService = {
  async getStudentProfileById(studentId: string): Promise<StudentProfile> {
    try {
      const profile = await ApiClient.request<{ student?: Record<string, unknown>; school?: Record<string, unknown> }>('/api/student/profile');
      if (profile?.student) {
        return mapStudentProfile(profile.student);
      }
    } catch (error) {
      // fall back to local demo data if the backend is unavailable
    }

    const fallback = studentProfiles.find((student) => student.id === studentId) ?? studentProfiles[0];
    return fallback;
  },

  async getParentChildren(): Promise<StudentProfile[]> {
    try {
      const response = await ApiClient.request<{ student?: Record<string, unknown> }>('/api/student/profile');
      if (response?.student) {
        return [mapStudentProfile(response.student)];
      }
    } catch (error) {
      // fall back to local demo data if the backend is unavailable
    }

    return studentProfiles;
  },
};
