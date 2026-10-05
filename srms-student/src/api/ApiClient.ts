type ApiEnvelope<T> = {
  status?: string;
  success?: boolean;
  data?: T;
  message?: string;
};

const storageKey = 'srms_student_session';

export class ApiClient {
  private static readonly baseUrl =
    process.env.EXPO_PUBLIC_API_URL ?? process.env.API_BASE_URL ?? '';

  static getToken(): string | null {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      return window.localStorage.getItem('srms_student_token');
    }

    return (globalThis as typeof globalThis & { __srmsStudentToken?: string }).__srmsStudentToken ?? null;
  }

  static setToken(token: string | null): void {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      if (token) {
        window.localStorage.setItem('srms_student_token', token);
        return;
      }
      window.localStorage.removeItem('srms_student_token');
      return;
    }

    if (token) {
      (globalThis as typeof globalThis & { __srmsStudentToken?: string }).__srmsStudentToken = token;
      return;
    }
    delete (globalThis as typeof globalThis & { __srmsStudentToken?: string }).__srmsStudentToken;
  }

  static getSession(): Record<string, unknown> | null {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      const value = window.localStorage.getItem(storageKey);
      return value ? (JSON.parse(value) as Record<string, unknown>) : null;
    }

    return (globalThis as typeof globalThis & { __srmsStudentSession?: Record<string, unknown> }).__srmsStudentSession ?? null;
  }

  static setSession(session: Record<string, unknown> | null): void {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      if (session) {
        window.localStorage.setItem(storageKey, JSON.stringify(session));
        return;
      }
      window.localStorage.removeItem(storageKey);
      return;
    }

    if (session) {
      (globalThis as typeof globalThis & { __srmsStudentSession?: Record<string, unknown> }).__srmsStudentSession = session;
      return;
    }
    delete (globalThis as typeof globalThis & { __srmsStudentSession?: Record<string, unknown> }).__srmsStudentSession;
  }

  static async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${normalizedPath}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });

    const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

    if (!response.ok) {
      const message = payload?.message || payload?.status || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (payload && 'data' in payload) {
      return (payload.data ?? payload) as T;
    }

    return (payload ?? ({} as T)) as T;
  }
}
