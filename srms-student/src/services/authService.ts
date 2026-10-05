import { ApiClient } from '../api/ApiClient';
import { mapSchoolBrand, mapStudentProfile } from '../utils/studentMapper';
import type { ParentSession, Role, StudentProfile } from '../models';
import { parentSession } from '../data/mockData';

export const authService = {
  async getSchoolBrand() {
    const response = await ApiClient.request<Record<string, unknown>>('/api/student/school/brand');
    return mapSchoolBrand(response);
  },

  async login(mode: Role, credentials?: { studentId?: string; password?: string }): Promise<{ role: Role; user: ParentSession | null; token?: string; school?: unknown; student?: StudentProfile | null }> {
    const loginPayload = {
      ...(credentials?.studentId ? { studentId: credentials.studentId } : {}),
      ...(credentials?.password ? { password: credentials.password } : {}),
    };

    try {
      const response = await ApiClient.request<{
        token?: string;
        user?: { id?: string; email?: string; role?: string; studentId?: string };
        school?: Record<string, unknown>;
        student?: Record<string, unknown>;
      }>('/api/student/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginPayload),
      });

      if (!response?.token) {
        return {
          role: mode,
          user: mode === 'parent' ? parentSession : null,
        };
      }

      ApiClient.setToken(response.token);
      const mappedStudent = response.student ? mapStudentProfile(response.student) : null;
      const school = response.school ? mapSchoolBrand(response.school) : parentSession;

      const session: ParentSession = {
        id: response.user?.id ?? mappedStudent?.id ?? parentSession.id,
        name: mappedStudent?.name ?? parentSession.name,
        email: response.user?.email ?? parentSession.email,
        children: mappedStudent ? [mappedStudent] : parentSession.children,
      };

      ApiClient.setSession({ token: response.token, school, user: response.user, student: mappedStudent, parent: session });

      return {
        role: mode,
        user: session,
        token: response.token,
        school,
        student: mappedStudent,
      };
    } catch (error) {
      return {
        role: mode,
        user: mode === 'parent' ? parentSession : null,
      };
    }
  },
};
