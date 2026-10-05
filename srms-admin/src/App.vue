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
      'Content-Type': 'application/json',
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

function beginEditSchool() {
  form.value = {
    school_name: selectedSchool.value.school_name,
    slug: selectedSchool.value.slug,
    email: selectedSchool.value.email || '',
    address: selectedSchool.value.address || '',
    status: selectedSchool.value.status || 'active',
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
      body: JSON.stringify({ school_name: form.value.school_name, email: form.value.email, address: form.value.address, status: form.value.status }),
    });
    editingSchool.value = false;
    success.value = 'School details updated.';
    await loadSchools();
  } catch (cause) { error.value = cause.message; }
  finally { saving.value = false; }
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
        <div class="section-heading"><div><p class="eyebrow">SCHOOL DETAILS</p><h2>{{ selectedSchool.school_name }}</h2><p class="muted">{{ selectedSchool.slug }} · {{ selectedSchool.status || 'active' }}</p></div><div class="row-actions"><button class="secondary" @click="router.push('/dashboard')">Back</button><button class="secondary" @click="beginEditSchool">Edit school</button></div></div>
        <form v-if="editingSchool" class="school-form edit-form" @submit.prevent="saveSchoolEdit"><label>Name<input v-model.trim="form.school_name" required /></label><label>Email<input v-model.trim="form.email" type="email" /></label><label>Address<input v-model.trim="form.address" /></label><label>Status<select v-model="form.status"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><button class="primary" :disabled="saving">Save changes</button></form>
        <div class="admins-section"><div class="section-heading"><div><p class="eyebrow">ACCESS</p><h2>School administrators</h2></div></div><div v-if="administrators.length" class="admin-list"><div v-for="administrator in administrators" :key="administrator._id"><strong>{{ administrator.username }}</strong><span>{{ administrator.email || 'No email' }}</span><small>{{ administrator.role }}</small></div></div><div v-else class="empty">No administrators yet.</div><form class="school-form admin-form" @submit.prevent="createAdministrator"><label>Username<input v-model.trim="adminForm.username" autocomplete="off" required /></label><label>Email<input v-model.trim="adminForm.email" type="email" /></label><label>Temporary password<input v-model="adminForm.password" type="password" minlength="8" required /></label><button class="primary" :disabled="saving">Add administrator</button></form></div>
      </section>
      <section v-else class="panel">
        <div class="section-heading"><div><p class="eyebrow">TENANT MANAGEMENT</p><h2>Schools</h2></div><button class="secondary" @click="loadSchools">Refresh</button></div>
        <div v-if="loading" class="empty">Loading schools…</div>
        <div v-else-if="schools.length" class="table-wrap"><table><thead><tr><th>School</th><th>Slug</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody><tr v-for="school in schools" :key="school._id"><td><strong>{{ school.school_name }}</strong><small>{{ school.email || 'No email' }}</small></td><td><code>{{ school.slug }}</code></td><td><span :class="['status', school.status === 'inactive' ? 'off' : 'on']">{{ school.status || 'active' }}</span></td><td>{{ school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '—' }}</td><td class="row-actions"><button class="secondary" @click="viewSchool(school)">View / edit</button><button class="secondary" @click="toggleSchool(school)">{{ school.status === 'inactive' ? 'Activate' : 'Deactivate' }}</button></td></tr></tbody></table></div>
        <div v-else class="empty">No schools found yet.</div>
        <div v-if="schools.length" class="visually-hidden">{{ schools.length }}</div>
      </section>
    </main>
  </div>
</template>