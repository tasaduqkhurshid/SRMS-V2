const TOKEN_KEY = 'srms_student_token';
const SESSION_KEY = 'srms_student_session';

const readJson = (value) => {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
};

export const portalApi = {
  getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
  },
  async request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.getToken() ? { Authorization: `Bearer ${this.getToken()}` } : {}),
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || payload.error || `Request failed (${response.status})`);
    return payload?.data ?? payload;
  },
  async getSchoolBrand() { return this.request('/api/student/school/brand'); },
  async login(studentId, password, rememberMe) {
    const data = await this.request('/api/student/auth/login', {
      method: 'POST',
      body: JSON.stringify({ studentId, password }),
    });
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    storage.setItem(TOKEN_KEY, data.token);
    storage.setItem(SESSION_KEY, JSON.stringify({ user: data.user, student: data.student, school: data.school }));
    otherStorage.removeItem(TOKEN_KEY);
    otherStorage.removeItem(SESSION_KEY);
    if (rememberMe) localStorage.setItem('srms_remembered_student_id', studentId);
    else localStorage.removeItem('srms_remembered_student_id');
    return data;
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },
  getSession() {
    return readJson(sessionStorage.getItem(SESSION_KEY)) || readJson(localStorage.getItem(SESSION_KEY));
  },
};