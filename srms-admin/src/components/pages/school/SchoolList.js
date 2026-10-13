import { ref } from 'vue';
import { copyToClipboard, openInNewTab } from '../../../utils/portalUrls.js';
import template from './SchoolListTemplate.js';

export default {
  name: 'SchoolList',
  props: {
    loading: { type: Boolean, default: false },
    schools: { type: Array, required: true },
    paginatedSchools: { type: Array, required: true },
    pageStart: { type: Number, required: true },
    pageEnd: { type: Number, required: true },
    currentPage: { type: Number, required: true },
    pageCount: { type: Number, required: true },
    schoolPortalUrl: { type: Function, required: true },
    studentPortalUrl: { type: Function, required: true },
  },
  emits: ['refresh', 'view', 'edit', 'toggle', 'add-user', 'previous', 'next', 'add', 'edit-admin', 'delete-admin'],
  setup(props, { emit }) {
    const expandedSchoolId = ref(null);
    const schoolAdmins = ref({}); // schoolId -> administrators array
    const loadingAdmins = ref({}); // schoolId -> boolean
    const copyingUrl = ref(null); // schoolId -> 'admin' | 'student'
    const copySuccess = ref(null); // schoolId -> 'admin' | 'student'

    const api = async (path, options = {}) => {
      const token = localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token') || '';
      const response = await fetch(`/api/admin${path}`, {
        ...options,
        headers: {
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || `Request failed (${response.status})`);
      return result.data;
    };

    const loadSchoolAdmins = async (schoolId) => {
      if (schoolAdmins.value[schoolId] || loadingAdmins.value[schoolId]) return;
      loadingAdmins.value[schoolId] = true;
      try {
        const administrators = await api(`/schools/${schoolId}/admins`);
        schoolAdmins.value[schoolId] = administrators;
      } catch (error) {
        console.error('Failed to load school administrators:', error);
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
      const url = type === 'admin' ? props.schoolPortalUrl(school) : props.studentPortalUrl(school);
      if (!url) return;

      copyingUrl.value = school._id;
      try {
        await copyToClipboard(url);
        copySuccess.value = school._id;
        setTimeout(() => {
          copySuccess.value = null;
        }, 2000);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      } finally {
        copyingUrl.value = null;
      }
    };

    const handleOpenUrl = (school, type) => {
      const url = type === 'admin' ? props.schoolPortalUrl(school) : props.studentPortalUrl(school);
      if (url) openInNewTab(url);
    };

    const handleEditAdmin = (school, admin) => {
      emit('edit-admin', school, admin);
    };

    const handleDeleteAdmin = (school, admin) => {
      emit('delete-admin', school, admin);
    };

    const isCopying = (school, type) => copyingUrl.value === school._id;
    const isCopySuccess = (school, type) => copySuccess.value === school._id;

    const getSchoolAdminUrl = (school) => props.schoolPortalUrl(school);
    const getStudentPortalUrl = (school) => props.studentPortalUrl(school);

    return {
      expandedSchoolId,
      schoolAdmins,
      loadingAdmins,
      copyingUrl,
      copySuccess,
      toggleExpand,
      isExpanded,
      getAdmins,
      isLoadingAdmins,
      handleCopyUrl,
      handleOpenUrl,
      handleEditAdmin,
      handleDeleteAdmin,
      getSchoolAdminUrl,
      getStudentPortalUrl,
      isCopying,
      isCopySuccess,
      api,
    };
  },
  template,
};