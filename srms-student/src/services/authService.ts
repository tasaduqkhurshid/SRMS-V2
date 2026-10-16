import { ApiClient } from '../api/ApiClient';
import { mapSchoolBrand, mapStudentProfile } from '../utils/studentMapper';
import type { ParentSession, Role, StudentProfile } from '../models';

export const authService = {
  async getSchoolBrand() {
    const response = await ApiClient.request<Record<string, unknown>>('/api/student/school/brand');
    return mapSchoolBrand(response);
  },

  async login(mode: Role, credentials?: { studentId?: string; username?: string; password?: string }): Promise<{ role: Role; user: ParentSession | null; token?: string; school?: unknown; student?: StudentProfile | null }> {
    const loginPayload = mode === 'parent'
      ? { username: credentials?.username || '', password: credentials?.password || '' }
      : { studentId: credentials?.studentId || '', password: credentials?.password || '' };

    try {
      const response = await ApiClient.request<{
        token?: string;
        user?: { id?: string; username?: string; email?: string; role?: string; studentId?: string };
        school?: Record<string, unknown>;
        student?: Record<string, unknown>;
        children?: Record<string, unknown>[];
      }>(mode === 'parent' ? '/api/student/auth/parent-login' : '/api/student/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginPayload),
      });

      if (!response?.token) {
        return { role: mode, user: null };
      }

      ApiClient.setToken(response.token);
      const mappedStudent = response.student ? mapStudentProfile(response.student) : null;
      const mappedChildren = (response.children || []).map((child) => mapStudentProfile(child));
      if (mappedStudent && !mappedChildren.length) mappedChildren.push(mappedStudent);
      const school = response.school ? mapSchoolBrand(response.school) : undefined;

      const session: ParentSession = {
        id: response.user?.id ?? mappedStudent?.id ?? '',
        name: response.user?.username ?? mappedStudent?.name ?? 'Parent',
        email: response.user?.email ?? '',
        children: mappedChildren,
      };

      ApiClient.setSession({ token: response.token, school, user: response.user, student: mappedStudent, children: mappedChildren, parent: session });

      return {
        role: mode,
        user: session,
        token: response.token,
        school,
        student: mappedStudent,
      };
    } catch (error) {
      return { role: mode, user: null };
    }
  },
};
