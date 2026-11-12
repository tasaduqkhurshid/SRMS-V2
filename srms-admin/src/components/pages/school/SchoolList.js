import { ref, onMounted } from 'vue';
import { copyToClipboard, openInNewTab } from '../../../utils/portalUrls.js';
import template from './SchoolListTemplate.js';
import { useRouter } from 'vue-router';
import SchoolModalComponent from './SchoolModalComponent.js';
import AddUserModal from './AddUserModal.js';
import SchoolDetails from './SchoolDetails.js';
import SchoolGateways from './SchoolGateways.js';

export default {
  name: 'SchoolList',
  components: { SchoolModalComponent, AddUserModal, SchoolDetails, SchoolGateways },
  template,
  setup() {
    const router = useRouter();
    const token = ref(localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token') || '');
    const schools = ref([]);
    const loading = ref(false);
    const error = ref('');
    const expandedSchoolId = ref(null);
    const schoolAdmins = ref({});
    const loadingAdmins = ref({});
    const copyingUrl = ref(null);
    const copySuccess = ref(null);
    const currentPage = ref(1);
    const pageSize = 10;

    const pageCount = ref(0);
    const paginatedSchools = ref([]);
    const pageStart = ref(0);
    const pageEnd = ref(0);

    // Modal state
    const editModalOpen = ref(false);
    const createModalOpen = ref(false);
    const addUserModalOpen = ref(false);
    const editingSchool = ref(null);
    const addUserSchool = ref(null);

    // View state (inline, replaces list)
    const viewSchool = ref(null);
    const isViewing = ref(false);
    const activeTab = ref('details');
    const saveError = ref('');

    // Gateways modal state
    const gatewaysModalOpen = ref(false);
    const gatewaysSchool = ref(null);
    const gatewaysList = ref([]);
    const gatewaysSaving = ref('');

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
      loading.value = true; error.value = '';
      try {
        const data = await api('/schools');
        schools.value = data.schools || [];
        currentPage.value = 1;
        updatePagination();
      } catch (cause) {
        error.value = cause.message;
      } finally {
        loading.value = false;
      }
    };

    const updatePagination = () => {
      pageCount.value = Math.max(1, Math.ceil(schools.value.length / pageSize));
      const start = (currentPage.value - 1) * pageSize;
      paginatedSchools.value = schools.value.slice(start, start + pageSize);
      pageStart.value = schools.value.length ? start + 1 : 0;
      pageEnd.value = Math.min(currentPage.value * pageSize, schools.value.length);
    };

    const loadSchoolAdmins = async (schoolId) => {
      if (schoolAdmins.value[schoolId] || loadingAdmins.value[schoolId]) return;
      loadingAdmins.value[schoolId] = true;
      try {
        const administrators = await api(`/schools/${schoolId}/admins`);
        schoolAdmins.value[schoolId] = administrators;
      } catch (cause) {
        console.error('Failed to load school administrators:', cause);
        schoolAdmins.value[schoolId] = [];
      } finally {
        loadingAdmins.value[schoolId] = false;
      }
    };

    const toggleExpand = (school) => {
      if (expandedSchoolId.value === school._id) {
        expandedSchoolId.value = null;
      } else {
        expandedSchoolId.value = school._id;
        loadSchoolAdmins(school._id);
      }
    };

    const isExpanded = (school) => expandedSchoolId.value === school._id;

    const getAdmins = (school) => schoolAdmins.value[school._id] || [];
    const isLoadingAdmins = (school) => loadingAdmins.value[school._id];

    const handleCopyUrl = async (school, type) => {
      const url = type === 'admin' ? schoolPortalUrl(school) : studentPortalUrl(school);
      if (!url) return;
      copyingUrl.value = school._id;
      try {
        await copyToClipboard(url);
        copySuccess.value = school._id;
        setTimeout(() => { copySuccess.value = null; }, 2000);
      } catch (cause) {
        console.error('Failed to copy URL:', cause);
      } finally {
        copyingUrl.value = null;
      }
    };

    const handleOpenUrl = (school, type) => {
      const url = type === 'admin' ? schoolPortalUrl(school) : studentPortalUrl(school);
      if (url) openInNewTab(url);
    };

    const schoolPortalUrl = (school, path = '/admin/') => {
      const version = path.endsWith('/logo') ? school?.branding?.logoKey : path.endsWith('/welcome-image') ? school?.branding?.welcomeImageKey : '';
      const base = `https://${school.slug}.${window.location.hostname.replace(/^admin\./, '')}`;
      if (!version) return base + path;
      return `${base + path}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}`;
    };

    const studentPortalUrl = (school, path = '/') => `https://${school.slug}.${window.location.hostname.replace(/^admin\./, '')}${path}`;

    const getSchoolAdminUrl = (school) => schoolPortalUrl(school);
    const getStudentPortalUrl = (school) => studentPortalUrl(school);
    const isCopying = (school, type) => copyingUrl.value === school._id;
    const isCopySuccess = (school, type) => copySuccess.value === school._id;

    const handleEditAdmin = (school, admin) => {
      router.push(`/schools/${school._id}`);
    };
    const handleDeleteAdmin = async (school, admin) => {
      if (!window.confirm(`Delete administrator "${admin.username}" from ${school.school_name}?`)) return;
      try {
        await api(`/schools/${school._id}/admins/${admin._id}`, { method: 'DELETE' });
        loadSchoolAdmins(school._id);
      } catch (cause) {
        error.value = cause.message;
      }
    };

    const handleView = async (school) => {
      viewSchool.value = school;
      isViewing.value = true;
      activeTab.value = 'details';
      await loadSchoolAdmins(school._id);
    };
    const handleGateways = async (school) => {
      if (!school) return;
      gatewaysSchool.value = school;
      gatewaysList.value = [];
      try {
        gatewaysList.value = await api(`/schools/${school._id}/payment-gateways`);
      } catch (cause) {
        gatewaysList.value = [];
        error.value = cause.message || 'Could not load gateways.';
      }
      activeTab.value = 'gateways';
    };
    const handleGatewaySave = async ({ code, form, enableAfterSave }) => {
      try {
        await api(`/schools/${gatewaysSchool.value._id}/payment-gateways/${code}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...form, enableAfterSave }),
        });
        gatewaysList.value = gatewaysList.value.map((g) => (g.code === code ? { ...g, ...form } : g));
      } catch (cause) {
        error.value = cause.message || 'Failed to save gateway.';
      }
    };
    const handleGatewayToggle = async ({ code, enabled }) => {
      try {
        await api(`/schools/${gatewaysSchool.value._id}/payment-gateways/${code}/enabled`, {
          method: 'PATCH',
          body: JSON.stringify({ enabled }),
        });
        await handleGateways(gatewaysSchool.value);
      } catch (cause) {
        error.value = cause.message || 'Failed to update gateway.';
      }
    };
    const handleEdit = (school) => { editingSchool.value = school; editModalOpen.value = true; saveError.value = ''; };
    const handleToggle = async (school) => {
      const status = school.status === 'inactive' ? 'active' : 'inactive';
      if (!window.confirm(`${status === 'active' ? 'Activate' : 'Deactivate'} ${school.school_name}?`)) return;
      try {
        await api(`/schools/${school._id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
        loadSchools();
      } catch (cause) {
        error.value = cause.message;
      }
    };
    const handleAddUser = (school) => { addUserSchool.value = school; addUserModalOpen.value = true; };
    const handleAdd = () => { editingSchool.value = null; createModalOpen.value = true; saveError.value = ''; };

    const handleSchoolSubmit = async (payload) => {
      try {
        const isEdit = editingSchool.value && editingSchool.value._id;
        if (isEdit) {
          await api(`/schools/${editingSchool.value._id}`, { method: 'PATCH', body: JSON.stringify(payload) });
          editModalOpen.value = false;
          editingSchool.value = null;
        } else {
          await api('/schools', { method: 'POST', body: JSON.stringify(payload) });
          createModalOpen.value = false;
        }
        saveError.value = '';
        await loadSchools();
      } catch (cause) {
        saveError.value = cause.message || 'Failed to save school.';
      }
    };

    const handleAddUserCreated = async () => {
      addUserModalOpen.value = false;
      addUserSchool.value = null;
      await loadSchools();
    };

    const handleRefresh = () => loadSchools();
    const handlePrevious = () => { if (currentPage.value > 1) { currentPage.value--; updatePagination(); } };
    const handleNext = () => { if (currentPage.value < pageCount.value) { currentPage.value++; updatePagination(); } };

    onMounted(() => {
      if (token.value) loadSchools();
    });

    return {
      schools, loading, error, saveError, expandedSchoolId, schoolAdmins, loadingAdmins,
      copyingUrl, copySuccess, currentPage, pageSize, pageCount, paginatedSchools,
      pageStart, pageEnd, api, loadSchools, loadSchoolAdmins, toggleExpand,
      isExpanded, getAdmins, isLoadingAdmins, handleCopyUrl, handleOpenUrl,
      handleEditAdmin, handleDeleteAdmin, schoolPortalUrl, studentPortalUrl,
      getSchoolAdminUrl, getStudentPortalUrl,
      isCopying, isCopySuccess,
      handleView, handleEdit, handleToggle, handleAddUser, handleAdd,
      handleSchoolSubmit, handleAddUserCreated,
      handleGateways, handleGatewaySave, handleGatewayToggle,
      editModalOpen, createModalOpen, addUserModalOpen, isViewing,
      editingSchool, addUserSchool, viewSchool,
      gatewaysSchool, gatewaysList, gatewaysSaving, activeTab,
      handleRefresh, handlePrevious, handleNext,
    };
  },
};
