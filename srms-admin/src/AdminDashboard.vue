<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PlatformSidebar from './components/common/PlatformSidebar.js';
import PlatformStats from './components/pages/dashboard/PlatformStats.js';
import SchoolList from './components/pages/school/SchoolList.js';
import SchoolDetails from './components/pages/school/SchoolDetails.js';

const route = useRoute();
const router = useRouter();
const currentYear = new Date().getFullYear();
const token = ref(localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token') || '');
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
  sessionStorage.removeItem('srms_platform_token');
  router.replace('/login');
}

watch(() => route.path, () => { if (token.value) loadSchools(); });
onMounted(() => { if (token.value) loadSchools(); });
</script>

<template>
  <div class="layout">
    <PlatformSidebar :current-year="currentYear" @logout="logout" />
    <main class="content">
      <header class="topbar"><div><p class="eyebrow">PLATFORM OVERVIEW</p><h1>Good day, Administrator</h1></div><span class="admin-pill">Super Admin</span></header>
      <p v-if="error" class="alert error">{{ error }}</p>
      <p v-if="success" class="alert success">{{ success }}</p>
      <PlatformStats :statistics="statistics" />
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
      <SchoolDetails v-if="selectedSchool" :school="selectedSchool" :administrators="administrators" :editing-school="editingSchool" :form="form" :saving="saving" :admin-form="adminForm" :password-reset-admin="passwordResetAdmin" :admin-new-password="adminNewPassword" :school-portal-url="schoolPortalUrl" @back="router.push('/dashboard')" @edit="beginEditSchool" @save-school="saveSchoolEdit" @cancel-edit="editingSchool = false" @upload-branding="uploadBrandingAsset" @start-password-reset="startPasswordReset" @cancel-password-reset="cancelPasswordReset" @update-password="updateAdministratorPassword" @update-admin-password="adminNewPassword = $event" @create-administrator="createAdministrator" />
      <SchoolList v-else :loading="loading" :schools="schools" :paginated-schools="paginatedSchools" :page-start="schoolPageStart" :page-end="schoolPageEnd" :current-page="currentSchoolPage" :page-count="schoolPageCount" :school-portal-url="schoolPortalUrl" @refresh="loadSchools" @view="viewSchool" @toggle="toggleSchool" @previous="currentSchoolPage--" @next="currentSchoolPage++" />
      <footer class="content-footer">© {{ currentYear }} Hubi-Infotech. All rights reserved.</footer>
    </main>
  </div>
</template>
