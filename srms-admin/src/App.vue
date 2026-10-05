<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const token = ref(localStorage.getItem('srms_platform_token') || '');
const username = ref('platform-admin');
const password = ref('');
const schools = ref([]);
const selectedSchool = ref(null);
const administrators = ref([]);
const passwordResetAdmin = ref(null);
const adminNewPassword = ref('');
const currentSchoolPage = ref(1);
const schoolPageSize = 10;
const schoolPageCount = computed(() => Math.max(1, Math.ceil(schools.value.length / schoolPageSize)));
const paginatedSchools = computed(() => {
  const start = (currentSchoolPage.value - 1) * schoolPageSize;
  return schools.value.slice(start, start + schoolPageSize);
});
const schoolPageStart = computed(() => schools.value.length ? (currentSchoolPage.value - 1) * schoolPageSize + 1 : 0);
const schoolPageEnd = computed(() => Math.min(currentSchoolPage.value * schoolPageSize, schools.value.length));
const adminForm = ref({ username: '', email: '', password: '' });
const editingSchool = ref(false);
const statistics = ref({ schools: 0, activeSchools: 0, inactiveSchools: 0, students: 0, schoolAdministrators: 0 });
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const form = ref({ school_name: '', slug: '', email: '', address: '', status: 'active' });
const isLogin = computed(() => route.path === '/login');

async function api(path, options = {}) {
  const response = await fetch(`/api/admin${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || `Request failed (${response.status})`);
  return result.data;
}

async function login() {
  error.value = '';
  saving.value = true;
  try {
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    });
    const result = await response.json();
    if (!response.ok || !result?.data?.token || result.data.user?.role !== 'SUPER_ADMIN') {
      throw new Error(result.message || 'Platform administrator login failed');
    }
    token.value = result.data.token;
    localStorage.setItem('srms_platform_token', token.value);
    await router.push('/dashboard');
  } catch (cause) {
    error.value = cause.message;
  } finally {
    saving.value = false;
  }
}

async function loadSchools() {
  loading.value = true;
  error.value = '';
  try {
    const data = await api('/schools');
    schools.value = data.schools || [];
    currentSchoolPage.value = Math.min(currentSchoolPage.value, schoolPageCount.value);
    statistics.value = data.statistics || statistics.value;
    if (route.params.id) {
      selectedSchool.value = await api(`/schools/${route.params.id}`);
      administrators.value = await api(`/schools/${route.params.id}/admins`);
    } else {
      selectedSchool.value = null;
      administrators.value = [];
    }
  } catch (cause) {
    error.value = cause.message;
    if (cause.message.toLowerCase().includes('authentication')) logout();
  } finally {
    loading.value = false;
  }
}

async function viewSchool(school) {
  await router.push(`/schools/${school._id}`);
}

function schoolPortalUrl(school, path = '/admin/') {
  const { protocol, hostname, port } = window.location;
  const rootDomain = hostname.replace(/^admin\./, '');
  const portalDomain = ['localhost', '127.0.0.1'].includes(rootDomain) ? 'sms.local' : rootDomain;
  const portSuffix = port ? `:${port}` : '';
  return `${protocol}//${school.slug}.${portalDomain}${portSuffix}${path}`;
}

function beginEditSchool() {
  form.value = {
    school_name: selectedSchool.value.school_name,
    slug: selectedSchool.value.slug,
    email: selectedSchool.value.email || '',
    address: selectedSchool.value.address || '',
    status: selectedSchool.value.status || 'active',
    tagline: selectedSchool.value.branding?.tagline || '',
    description: selectedSchool.value.branding?.description || '',
  };
  editingSchool.value = true;
}

async function saveSchoolEdit() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await api(`/schools/${selectedSchool.value._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ school_name: form.value.school_name, email: form.value.email, address: form.value.address, status: form.value.status, branding: { tagline: form.value.tagline, description: form.value.description } }),
    });
    editingSchool.value = false;
    success.value = 'School details updated.';
    await loadSchools();
  } catch (cause) { error.value = cause.message; }
  finally { saving.value = false; }
}

async function uploadBrandingAsset(asset, event) {
  const file = event.target.files?.[0];
  if (!file || !selectedSchool.value) return;
  saving.value = true; error.value = ''; success.value = '';
  try { const data = new FormData(); data.append('file', file); await api('/schools/' + selectedSchool.value._id + '/branding/' + asset, { method: 'POST', body: data }); success.value = (asset === 'logo' ? 'School logo' : 'Welcome image') + ' uploaded.'; await loadSchools(); }
  catch (cause) { error.value = cause.message; }
  finally { saving.value = false; event.target.value = ''; }
}

function startPasswordReset(administrator) {
  passwordResetAdmin.value = administrator;
  adminNewPassword.value = '';
  error.value = '';
  success.value = '';
}

function cancelPasswordReset() {
  passwordResetAdmin.value = null;
  adminNewPassword.value = '';
}

async function updateAdministratorPassword() {
  if (!passwordResetAdmin.value || adminNewPassword.value.length < 8) return;
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await api(`/schools/${selectedSchool.value._id}/admins/${passwordResetAdmin.value._id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password: adminNewPassword.value }),
    });
    success.value = `Password updated for ${passwordResetAdmin.value.username}.`;
    cancelPasswordReset();
  } catch (cause) {
    error.value = cause.message;
  } finally {
    saving.value = false;
  }
}

async function createAdministrator() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await api(`/schools/${selectedSchool.value._id}/admins`, { method: 'POST', body: JSON.stringify(adminForm.value) });
    adminForm.value = { username: '', email: '', password: '' };
    administrators.value = await api(`/schools/${selectedSchool.value._id}/admins`);
    success.value = 'School administrator created.';
  } catch (cause) { error.value = cause.message; }
  finally { saving.value = false; }
}

async function createSchool() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    const data = await api('/schools', { method: 'POST', body: JSON.stringify(form.value) });
    const rootDomain = window.location.hostname.replace(/^admin\./, '');
    success.value = `${data.school_name} created at ${data.slug}.${rootDomain}`;
    form.value = { school_name: '', slug: '', email: '', address: '', status: 'active' };
    await loadSchools();
  } catch (cause) {
    error.value = cause.message;
  } finally {
    saving.value = false;
  }
}

async function toggleSchool(school) {
  const status = school.status === 'inactive' ? 'active' : 'inactive';
  if (!window.confirm(`${status === 'active' ? 'Activate' : 'Deactivate'} ${school.school_name}?`)) return;
  try {
    await api(`/schools/${school._id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await loadSchools();
  } catch (cause) { error.value = cause.message; }
}

function logout() {
  token.value = '';
  localStorage.removeItem('srms_platform_token');
  router.replace('/login');
}

watch(() => route.path, (path) => { if (path !== '/login' && token.value) loadSchools(); });
onMounted(() => { if (!isLogin.value && token.value) loadSchools(); });
</script>

<template>
  <main v-if="isLogin" class="login-page">
    <section class="login-card">
      <div class="brand-mark">S</div>
      <p class="eyebrow">SRMS PLATFORM</p>
      <h1>Welcome back</h1>
      <p class="muted">Sign in to manage the school network.</p>
      <form @submit.prevent="login">
        <label>Username<input v-model="username" autocomplete="username" required /></label>
        <label>Password<input v-model="password" type="password" autocomplete="current-password" required /></label>
        <p v-if="error" class="alert error">{{ error }}</p>
        <button class="primary full" :disabled="saving">{{ saving ? 'Signing in…' : 'Sign in' }}</button>
      </form>
      <small>Platform administrators only</small>
    </section>
  </main>

  <div v-else class="layout">
    <aside class="sidebar">
      <a class="brand" href="/dashboard"><span class="brand-mark small">S</span><span>SRMS<small>Platform</small></span></a>
      <nav><RouterLink to="/dashboard" active-class="active">Overview</RouterLink><RouterLink to="/schools" active-class="active">Schools</RouterLink></nav>
      <button class="logout" @click="logout">Sign out</button>
    </aside>
    <main class="content">
      <header class="topbar"><div><p class="eyebrow">PLATFORM OVERVIEW</p><h1>Good day, Administrator</h1></div><span class="admin-pill">Super Admin</span></header>
      <p v-if="error" class="alert error">{{ error }}</p>
      <p v-if="success" class="alert success">{{ success }}</p>
      <section class="stats">
        <article><span>Schools</span><strong>{{ statistics.schools }}</strong><small>Registered on SRMS</small></article>
        <article><span>Active schools</span><strong>{{ statistics.activeSchools }}</strong><small>Currently enabled</small></article>
        <article><span>Students</span><strong>{{ statistics.students }}</strong><small>Across all schools</small></article>
        <article><span>School admins</span><strong>{{ statistics.schoolAdministrators }}</strong><small>Existing user accounts</small></article>
      </section>
      <section v-if="!selectedSchool" class="panel create-panel">
        <div><p class="eyebrow">SCHOOL DIRECTORY</p><h2>Add a school</h2><p class="muted">A unique slug becomes the school's hostname.</p></div>
        <form class="school-form" @submit.prevent="createSchool">
          <label>School name<input v-model.trim="form.school_name" placeholder="School name" required /></label>
          <label>Hostname slug<input v-model.trim="form.slug" placeholder="hanfia" pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></label>
          <label>Email<input v-model.trim="form.email" type="email" placeholder="office@school.edu" /></label>
          <label>Address<input v-model.trim="form.address" placeholder="School address" /></label>
          <button class="primary" :disabled="saving">{{ saving ? 'Creating…' : 'Create school' }}</button>
        </form>
      </section>
      <section v-if="selectedSchool" class="panel">
        <div class="section-heading"><div><p class="eyebrow">SCHOOL DETAILS</p><h2>{{ selectedSchool.school_name }}</h2><p class="school-meta"><code>{{ selectedSchool.slug }}</code><span :class="['status', selectedSchool.status === 'inactive' ? 'off' : 'on']">{{ selectedSchool.status || 'active' }}</span></p></div><div class="row-actions detail-actions"><button class="secondary" type="button" @click="router.push('/dashboard')"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19 12H5m7 7-7-7 7-7" /></svg><span>Back</span></button><button class="secondary" type="button" @click="beginEditSchool"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg><span>Edit school</span></button></div></div>
        <form v-if="editingSchool" class="school-form edit-form" @submit.prevent="saveSchoolEdit"><label>Name<input v-model.trim="form.school_name" required /></label><label>Email<input v-model.trim="form.email" type="email" /></label><label>Address<input v-model.trim="form.address" /></label><label>Status<select v-model="form.status"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label>Welcome tagline<input v-model.trim="form.tagline" maxlength="120" /></label><label class="description-field">Welcome description<textarea v-model.trim="form.description" maxlength="500" rows="3"></textarea></label><div class="form-actions"><button class="secondary" type="button" @click="editingSchool = false">Cancel</button><button class="primary" type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Save changes' }}</button></div></form>
        <div class="school-stats">
          <article><span>Administrators</span><strong>{{ administrators.length }}</strong><small>School admin accounts</small></article>
          <article><span>Students</span><strong>{{ selectedSchool.statistics?.students ?? 0 }}</strong><small>Enrolled students</small></article>
          <article><span>Teachers</span><strong>{{ selectedSchool.statistics?.teachers ?? 0 }}</strong><small>Teacher accounts</small></article>
        </div>
        <section class="branding-manager"><div><p class="eyebrow">PORTAL BRANDING</p><h3>School images</h3><p class="muted">JPEG, PNG, or WebP up to 5 MB. Images load privately through the school portal.</p></div><div class="branding-upload-grid"><label>School logo<input type="file" accept="image/jpeg,image/png,image/webp" @change="uploadBrandingAsset('logo', $event)" :disabled="saving" /><img v-if="selectedSchool.branding?.logoKey" :src="schoolPortalUrl(selectedSchool, '/api/student/school/branding/logo')" alt="Current school logo" /></label><label>Welcome image<input type="file" accept="image/jpeg,image/png,image/webp" @change="uploadBrandingAsset('welcome-image', $event)" :disabled="saving" /><img v-if="selectedSchool.branding?.welcomeImageKey" :src="schoolPortalUrl(selectedSchool, '/api/student/school/branding/welcome-image')" alt="Current school welcome image" /></label></div></section>
        <div class="admins-section"><div class="section-heading"><div><p class="eyebrow">ACCESS</p><h2>School administrators</h2></div></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody><tr v-if="!administrators.length"><td colspan="4" class="admin-table-empty">No administrators yet.</td></tr><tr v-for="administrator in administrators" :key="administrator._id"><td><strong>{{ administrator.username }}</strong></td><td>{{ administrator.email || 'No email' }}</td><td><span class="admin-role">{{ administrator.role }}</span></td><td><button class="secondary admin-password-action" type="button" @click="startPasswordReset(administrator)">Change password</button></td></tr></tbody></table></div><form v-if="passwordResetAdmin" class="password-reset-form" @submit.prevent="updateAdministratorPassword"><div><p class="eyebrow">PASSWORD RESET</p><strong>Set a new password for {{ passwordResetAdmin.username }}</strong></div><label>New password<input v-model="adminNewPassword" type="password" autocomplete="new-password" minlength="8" required /></label><div class="form-actions"><button class="secondary" type="button" @click="cancelPasswordReset">Cancel</button><button class="primary" type="submit" :disabled="saving || adminNewPassword.length < 8">{{ saving ? 'Saving…' : 'Update password' }}</button></div></form><form class="school-form admin-form" @submit.prevent="createAdministrator"><label>Username<input v-model.trim="adminForm.username" autocomplete="off" required /></label><label>Email<input v-model.trim="adminForm.email" type="email" /></label><label>Temporary password<input v-model="adminForm.password" type="password" minlength="8" required /></label><button class="primary" type="submit" :disabled="saving">{{ saving ? 'Adding…' : 'Add administrator' }}</button></form></div>
      </section>
      <section v-else class="panel">
        <div class="section-heading"><div><p class="eyebrow">TENANT MANAGEMENT</p><h2>Schools</h2></div><button class="secondary" @click="loadSchools">Refresh</button></div>
        <div v-if="loading" class="empty">Loading schools…</div>
        <div v-else-if="schools.length" class="table-wrap"><table><thead><tr><th>School</th><th>Slug</th><th>Admin portal URL</th><th>Student portal URL</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody><tr v-for="school in paginatedSchools" :key="school._id"><td><strong>{{ school.school_name }}</strong><small>{{ school.email || 'No email' }}</small></td><td><code>{{ school.slug }}</code></td><td><a class="portal-url" :href="schoolPortalUrl(school)" target="_blank" rel="noopener noreferrer">{{ schoolPortalUrl(school) }}</a></td><td><a class="portal-url" :href="schoolPortalUrl(school, '/login')" target="_blank" rel="noopener noreferrer">{{ schoolPortalUrl(school, '/login') }}</a></td><td><span :class="['status', school.status === 'inactive' ? 'off' : 'on']">{{ school.status || 'active' }}</span></td><td>{{ school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '—' }}</td><td class="row-actions"><button class="secondary" @click="viewSchool(school)">View / edit</button><button class="secondary" @click="toggleSchool(school)">{{ school.status === 'inactive' ? 'Activate' : 'Deactivate' }}</button></td></tr></tbody></table></div>
        <div v-else class="empty">No schools found yet.</div>
        <div v-if="schools.length" class="pagination-bar">
          <span>Showing {{ schoolPageStart }}–{{ schoolPageEnd }} of {{ schools.length }} schools</span>
          <div class="pagination-controls">
            <button class="secondary" type="button" :disabled="currentSchoolPage <= 1" @click="currentSchoolPage--">Previous</button>
            <span>Page {{ currentSchoolPage }} of {{ schoolPageCount }}</span>
            <button class="secondary" type="button" :disabled="currentSchoolPage >= schoolPageCount" @click="currentSchoolPage++">Next</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
