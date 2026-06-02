import template from './CourseListTemplate.js';
import { api } from '../../../Services/api.js';
const { ref, reactive, onMounted } = Vue;

export default {
  name: 'CourseList',
  template,
  props: [],
  setup(props, { emit }) {
    const searchTerm = ref('');
    const loading = ref(false);
    const courses = ref([]);
    const expandedRows = reactive({});
    const loadingSubjects = reactive({});

    const getCourseList = async () => {
      loading.value = true;
      try {
        const res = await api.get('/courses', { params: { q: searchTerm.value, limit: 100 } });
        if (res.data && res.data.status === 'success') {
          const data = res.data.data || {};
          courses.value = data.courses || [];
          // initialize subjects array placeholder
          for (const c of courses.value) {
            c.subjects = c.subjects || [];
            expandedRows[c.id] = expandedRows[c.id] || false;
            loadingSubjects[c.id] = false;
          }
        } else {
          toast.error(res.data?.message || 'Failed to load courses');
        }
      } catch (err) {
        toast.error('Failed to load courses');
      } finally {
        loading.value = false;
      }
    };

    const toggleRow = async (courseId) => {
      expandedRows[courseId] = !expandedRows[courseId];
      if (expandedRows[courseId]) {
        await loadSubjects(courseId);
      }
    };

    const loadSubjects = async (courseId) => {
      loadingSubjects[courseId] = true;
      try {
        const res = await api.get(`/courses/${courseId}/subjects`);
        if (res.data && res.data.status === 'success') {
          const idx = courses.value.findIndex(c => c.id == courseId);
          if (idx >= 0) courses.value[idx].subjects = res.data.data || [];
        }
      } catch (err) {
        toast.error('Failed to load course subjects');
      } finally {
        loadingSubjects[courseId] = false;
      }
    };

    const removeSubject = async (courseId, subjectId) => {
      try {
        // fetch current subject ids and remove the one
        const course = courses.value.find(c => c.id == courseId);
        const ids = (course.subjects || []).map(s => s.subject.id).filter(Boolean).filter(id => id != subjectId);
        const res = await api.post(`/courses/${courseId}/subjects`, { subject_ids: ids });
        if (res.data && res.data.status === 'success') {
          toast.success('Subject removed');
          await loadSubjects(courseId);
        }
      } catch (err) { toast.error('Failed to remove subject') }
    };

    const openAssign = (course) => {
      emit('openAssignModal', course.id);
    };

    const deleteCourse = async (id) => {
      if (!confirm('Delete course?')) return;
      try {
        const res = await api.delete(`/courses/${id}`);
        if (res.data && res.data.status === 'success') {
          toast.success('Deleted');
          getCourseList();
        }
      } catch (err) { toast.error('Delete failed') }
    };

    onMounted(() => { getCourseList();
      // listen to global openAssignModal event
      window.addEventListener('openAssignModal', (e) => {
        const modal = document.querySelector('assign-subject-modal');
        try { if (modal && modal.__vue__ && typeof modal.__vue__.open === 'function') modal.__vue__.open(e.detail.courseId, e.detail.onSaved); } catch(e) {}
      });
    });

    return { searchTerm, loading, courses, expandedRows, loadingSubjects, getCourseList, toggleRow, loadSubjects, removeSubject, openAssign, deleteCourse };
  }
};
