const { ref, computed, onMounted } = Vue;
import template from './AssignSubjectModalTemplate.js';
import { api } from '../../Services/api.js';

export default {
  name: 'AssignSubjectModal',
  template,
  props: {
    open: Boolean,
    entityType: { type: String, default: 'course' }, // 'course' or 'student'
    entityId: { type: [String, Number], default: null },
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const loading = ref(false);
    const saving = ref(false);
    const subjects = ref([]);
    const selectedIds = ref([]);
    const filter = ref('');
    const openDropdown = ref(false);
    const highlightedIndex = ref(-1);

    const filteredSubjects = computed(() => {
      const q = (filter.value || '').toLowerCase().trim();
      const base = subjects.value || [];
      // exclude already selected subjects from dropdown options
      const candidates = base.filter(s => !selectedIds.value.map(String).includes(String(s._id)));
      if (!q) return candidates;
      return candidates.filter(s => {
        const idStr = String(s._id || '');
        return idStr.includes(q) || (s.subject_name || '').toLowerCase().includes(q) || (s.subject_code || '').toLowerCase().includes(q);
      });
    });

    const selectedSubjects = computed(() => {
      return selectedIds.value.map(id => subjects.value.find(s => String(s._id) === String(id))).filter(Boolean);
    });

    const addSubject = (id) => {
      if (!id) return;
      const strId = String(id);
      if (!selectedIds.value.map(String).includes(strId)) {
        selectedIds.value.push(strId);
      }
      filter.value = '';
      openDropdown.value = false;
      highlightedIndex.value = -1;
    };

    const removeSubject = (id) => {
      if (!id) return;
      const strId = String(id);
      selectedIds.value = selectedIds.value.filter(x => String(x) !== strId);
    };

    const highlightNext = () => {
      if (!filteredSubjects.value.length) return;
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredSubjects.value.length - 1);
    };

    const highlightPrev = () => {
      if (!filteredSubjects.value.length) return;
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
    };

    const selectHighlighted = () => {
      if (highlightedIndex.value >= 0 && filteredSubjects.value[highlightedIndex.value]) {
        addSubject(filteredSubjects.value[highlightedIndex.value]._id);
      }
    };

    const getAllSubjects = async () => {
      try {
        const response = await api.get('/subjects', { params: { limit: 1000 } });
        if (response?.data?.status === 'success') {
          subjects.value = response.data.data?.subjects || response.data.subjects || [];
        } else {
          subjects.value = [];
        }
      } catch (err) {
        toast?.error?.('Failed to load subjects: ' + (err?.message || err));
      }
    };


    const getAssignedSubjects = async () => {
      if (!props.entityId) return;
      try {
        const endpoint = props.entityType === 'student' ? `/students/${props.entityId}/subjects` : `/courses/${props.entityId}/subjects`;
        const response = await api.get(endpoint);
        if (response?.data?.status === 'success') {
          const rows = response.data.data || [];
          const ids = rows.map(row => {
            if (row.subject?._id) return String(row.subject._id);
            if (row.subject_id) return String(row.subject_id);
            return row._id ? String(row._id) : null;
          });
          selectedIds.value = ids.filter(Boolean);
        } else {
          selectedIds.value = [];
        }
      } catch (e) {
        selectedIds.value = [];
      }
    };  

    const close = () => {
      emit('close');
      filter.value = '';
      selectedIds.value = [];
      highlightedIndex.value = -1;
    };

    const save = async () => {
      if (!props.entityId) return toast?.error?.('Missing entity id');
      saving.value = true;
      try {
        const endpoint = props.entityType === 'student' ? `/students/${props.entityId}/subjects` : `/courses/${props.entityId}/subjects`;
        const payload = props.entityType === 'student' ? { subjects: selectedIds.value } : { subject_ids: selectedIds.value };
        const res = await api.post(endpoint, payload);
        if (res?.data?.status === 'success') {
          toast?.success?.('Assigned');
          emit('saved');
          close();
        } else {
          toast?.error?.(res?.data?.message || 'Save failed');
        }
      } catch (err) {
        toast?.error?.('Save failed: ' + (err?.message || err));
      } finally {
        saving.value = false;
      }
    };

    onMounted(async () => {
      if (props.open && props.entityId) {
        loading.value = true;
        try {
          await Promise.all([getAllSubjects(), getAssignedSubjects()]);
        } finally {
          loading.value = false;
        }
      }
    });

    return {
      loading,
      saving,
      subjects,
      selectedIds,
      filter,
      filteredSubjects,
      close,
      save,
      openDropdown,
      highlightedIndex,
      addSubject,
      removeSubject,
      selectedSubjects,
      highlightNext,
      highlightPrev,
      selectHighlighted,
    };
  },
}
