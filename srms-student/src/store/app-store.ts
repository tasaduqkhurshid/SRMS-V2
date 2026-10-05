import { create } from 'zustand';
import type { ParentSession, SchoolBrand, StudentProfile } from '../models';
import { parentSession, schoolBrand } from '../data/mockData';

interface AppState {
  isAuthenticated: boolean;
  school: SchoolBrand;
  parent: ParentSession;
  selectedChildId: string;
  authMode: 'student' | 'parent';
  token: string | null;
  login: (mode: 'student' | 'parent', payload?: { studentId?: string; password?: string }) => Promise<boolean>;
  logout: () => void;
  setSelectedChild: (childId: string) => void;
  selectedChild: () => StudentProfile | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  school: schoolBrand,
  parent: parentSession,
  selectedChildId: parentSession.children[0]?.id ?? '',
  authMode: 'student',
  token: null,
  login: async (mode, payload) => {
    try {
      const { authService } = await import('../services/authService');
      const result = await authService.login(mode, payload);
      if (!result.user) {
        set({ isAuthenticated: false, authMode: mode, token: null });
        return false;
      }

      set({
        isAuthenticated: true,
        authMode: mode,
        token: result.token ?? null,
        parent: result.user,
        school: (result.school as SchoolBrand) ?? schoolBrand,
        selectedChildId: result.user.children[0]?.id ?? parentSession.children[0]?.id ?? '',
      });
      return true;
    } catch (error) {
      set({ isAuthenticated: false, authMode: mode, token: null });
      return false;
    }
  },
  logout: () => set({ isAuthenticated: false, authMode: 'student', token: null, parent: parentSession, selectedChildId: parentSession.children[0]?.id ?? '' }),
  setSelectedChild: (childId) => set({ selectedChildId: childId }),
  selectedChild: () => {
    const selected = get().parent.children.find((child) => child.id === get().selectedChildId);
    return selected ?? get().parent.children[0];
  },
}));
