<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSchoolAdminUrl, getStudentPortalUrl } from './utils/portalUrls.js';
import PlatformSidebar from './components/common/PlatformSidebar.js';
import PlatformStats from './components/pages/dashboard/PlatformStats.js';
import SchoolList from './components/pages/school/SchoolList.js';
import SchoolDetails from './components/pages/school/SchoolDetails.js';
import SchoolModalComponent from './components/pages/school/SchoolModalComponent.js';
import AddUserModal from './components/pages/school/AddUserModal.js';

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
const statistics = ref({ schools: 0, activeSchools: 0, inactiveSchools: 0, students: 0, schoolAdministrators: 0 });
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');

// Modal state
const modalOpen = ref(false);
const modalMode = ref('create'); // 'create' | 'edit'
const modalSchool = ref(null);
const modalSaving = ref(false);

// Add User Modal state
const addUserModalOpen = ref(false);
const addUserModalSchool = ref(null);

const api = async (path, options = {}) => {
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
};

const loadSchools = async () => {
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
};

const viewSchool = async (school) => {
  await router.push(`/schools/${school._id}`);
};

const schoolPortalUrl = (school, path = '/admin/') => getSchoolAdminUrl(school, path);
const studentPortalUrl = (school, path = '/') => getStudentPortalUrl(school, path);

// Modal handlers
const openCreateModal = () => {
  modalMode.value = 'create';
  modalSchool.value = null;
  modalOpen.value = true;
};

const openEditModal = (school) => {
  const schoolToEdit = school || selectedSchool.value;
  if (!schoolToEdit) return;
  modalMode.value = 'edit';
  modalSchool.value = schoolToEdit;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  modalSchool.value = null;
};

const openAddUserModal = (school) => {
  addUserModalSchool.value = school;
  addUserModalOpen.value = true;
};

const closeAddUserModal = () => {
  addUserModalOpen.value = false;
  addUserModalSchool.value = null;
};

const handleModalSubmit = async (formData) => {
    modalSaving.value = true;
    error.value = '';
    success.value = '';
    try {
      if (modalMode.value === 'create') {
        const data = await api('/schools', {
          method: 'POST',
          body: JSON.stringify({
            school: formData,
          }),
        });
        const rootDomain = window.location.hostname.replace(/^admin\./, '');
        success.value = `${data.school_name} created at ${data.slug}.${rootDomain}`;
      } else {
      await api(`/schools/${modalSchool.value._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          school_name: formData.school_name,
          email: formData.email,
          address: formData.address,
          status: formData.status,
          branding: {
            tagline: formData.tagline,
            description: formData.description,
          },
        }),
      });
      success.value = 'School details updated.';
    }
    closeModal();
    await loadSchools();
  } catch (cause) {
    error.value = cause.message;
    throw cause; // Re-throw to let modal handle it
  } finally {
    modalSaving.value = false;
  }
};

const uploadBrandingAsset = async (asset, event) => {
  const file = event.target.files?.[0];
  if (!file || !selectedSchool.value) return;
  saving.value = true; error.value = ''; success.value = '';
  try {
    const data = new FormData(); data.append('file', file);
    await api('/schools/' + selectedSchool.value._id + '/branding/' + asset, { method: 'POST', body: data });
    success.value = (asset === 'logo' ? 'School logo' : 'Welcome image') + ' uploaded.';
    await loadSchools();
  } catch (cause) { error.value = cause.message; }
  finally { saving.value = false; event.target.value = ''; }
};

const startPasswordReset = (administrator) => {
  passwordResetAdmin.value = administrator;
  adminNewPassword.value = '';
  error.value = '';
  success.value = '';
};

const cancelPasswordReset = () => {
  passwordResetAdmin.value = null;
  adminNewPassword.value = '';
};

const updateAdministratorPassword = async () => {
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
};

const createAdministrator = async () => {
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
};

const toggleSchool = async (school) => {
  const status = school.status === 'inactive' ? 'active' : 'inactive';
  if (!window.confirm(`${status === 'active' ? 'Activate' : 'Deactivate'} ${school.school_name}?`)) return;
  try {
    await api(`/schools/${school._id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await loadSchools();
  } catch (cause) { error.value = cause.message; }
};

const handleEditAdmin = async (school, admin) => {
  const newEmail = window.prompt(`Edit email for ${admin.username}:`, admin.email);
  if (!newEmail || newEmail === admin.email) return;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    error.value = 'Please enter a valid email address';
    return;
  }

  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await api(`/schools/${school._id}/admins/${admin._id}`, { method: 'PATCH', body: JSON.stringify({ email: newEmail }) });
    success.value = `Email updated for ${admin.username}.`;
    await loadSchools();
  } catch (cause) { error.value = cause.message; }
  finally { saving.value = false; }
};

const handleDeleteAdmin = async (school, admin) => {
  if (!window.confirm(`Delete administrator "${admin.username}" from ${school.school_name}? This action cannot be undone.`)) return;

  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await api(`/schools/${school._id}/admins/${admin._id}`, { method: 'DELETE' });
    success.value = `Administrator "${admin.username}" deleted.`;
    await loadSchools();
  } catch (cause) { error.value = cause.message; }
  finally { saving.value = false; }
};

const logout = () => {
  token.value = '';
  localStorage.removeItem('srms_platform_token');
  sessionStorage.removeItem('srms_platform_token');
  router.replace('/login');
};

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
      <SchoolList
        v-if="!selectedSchool"
        :loading="loading"
        :schools="schools"
        :paginated-schools="paginatedSchools"
        :page-start="schoolPageStart"
        :page-end="schoolPageEnd"
        :current-page="currentSchoolPage"
        :page-count="schoolPageCount"
        :school-portal-url="schoolPortalUrl"
        :student-portal-url="studentPortalUrl"
        @refresh="loadSchools"
        @view="viewSchool"
        @edit="openEditModal"
        @toggle="toggleSchool"
        @add-user="openAddUserModal"
        @add="openCreateModal"
        @edit-admin="handleEditAdmin"
        @delete-admin="handleDeleteAdmin"
        @previous="currentSchoolPage--"
        @next="currentSchoolPage++"
      />
      <SchoolDetails
        v-else
        :school="selectedSchool"
        :administrators="administrators"
        :password-reset-admin="passwordResetAdmin"
        :admin-new-password="adminNewPassword"
        :admin-form="adminForm"
        :saving="saving"
        :school-portal-url="schoolPortalUrl"
        @back="router.push('/dashboard')"
        @edit="openEditModal"
        @upload-branding="uploadBrandingAsset"
        @start-password-reset="startPasswordReset"
        @cancel-password-reset="cancelPasswordReset"
        @update-password="updateAdministratorPassword"
        @update-admin-password="adminNewPassword = $event"
        @create-administrator="createAdministrator"
      />
      <SchoolModalComponent
        :is-open="modalOpen"
        :mode="modalMode"
        :school="modalSchool"
        :saving="modalSaving"
        :school-portal-url="schoolPortalUrl"
        @close="closeModal"
        @submit="handleModalSubmit"
        @cancel="closeModal"
      />
      <AddUserModal
        :is-open="addUserModalOpen"
        :school="addUserModalSchool"
        @close="closeAddUserModal"
      />
      <footer class="content-footer">© {{ currentYear }} Hubi-Infotech. All rights reserved.</footer>
    </main>
  </div>
</template>