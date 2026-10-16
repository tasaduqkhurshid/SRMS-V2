import { api } from '../../../Services/api.js';
import template from './CourseWiseResultsTemplate.js';
const { ref, computed, onMounted, watch } = Vue;
const { useRouter } = VueRouter;

export default {
  name: 'CourseWiseResults',
  template,
  setup() {
    const router = useRouter();
    const results = ref([]);
    const courses = ref([]);
    const academicYears = ref([]);
    const exams = ref([]);
    const students = ref([]);
    const filters = ref({ course_id: '', exam_id: '', academic_year_id: '' });
    const search = ref('');
    const loading = ref(false);
    const filtersLoading = ref(false);
    const loaded = ref(false);
    const page = ref(1);
    const pageSize = ref(20);

    const getList = async (url, key) => {
      const response = await api.get(url);
      const payload = response?.data?.data;
      return Array.isArray(payload?.[key]) ? payload[key] : Array.isArray(payload) ? payload : [];
    };
    const fetchOptions = async () => {
      filtersLoading.value = true;
      try {
        [courses.value, academicYears.value, exams.value] = await Promise.all([
          getList('/courses?limit=1000', 'courses'),
          getList('/options/academic-years/all', 'years'),
          getList('/exams?limit=1000', 'exams')
        ]);
      } catch (error) {
        toast?.error?.(error.response?.data?.message || 'Could not load result filters');
      } finally { filtersLoading.value = false; }
    };
    const availableExams = computed(() => {
      if (!filters.value.academic_year_id) return exams.value;
      return exams.value.filter(exam => {
        const yearId = exam.academic_year_id?._id || exam.academic_year_id;
        return !yearId || String(yearId) === String(filters.value.academic_year_id);
      });
    });
    watch(() => filters.value.academic_year_id, () => {
      if (filters.value.exam_id && !availableExams.value.some(exam => String(exam._id) === String(filters.value.exam_id))) filters.value.exam_id = '';
    });

    const applyFilters = async () => {
      if (!filters.value.course_id || !filters.value.exam_id || !filters.value.academic_year_id) {
        toast?.error?.('Select an academic year, course and exam');
        return;
      }
      loading.value = true;
      loaded.value = true;
      try {
        const [studentResponse, resultResponse] = await Promise.all([
          api.get('/students', { params: { course_id: filters.value.course_id, limit: 1000 } }),
          api.get('/results', { params: { course_id: filters.value.course_id, exam_id: filters.value.exam_id, academic_year_id: filters.value.academic_year_id, page: 1, limit: 5000 } })
        ]);
        const studentData = studentResponse?.data?.data;
        const resultData = resultResponse?.data?.data;
        students.value = (studentData?.students || []).filter(student => !student.academic_year_id || String(student.academic_year_id?._id || student.academic_year_id) === String(filters.value.academic_year_id));
        results.value = resultData?.results || [];
      } catch (error) {
        results.value = [];
        students.value = [];
        toast?.error?.(error.response?.data?.message || 'Could not load course results');
      } finally { loading.value = false; }
    };
    const clearFilters = () => {
      filters.value = { course_id: '', exam_id: '', academic_year_id: '' };
      search.value = '';
      results.value = [];
      students.value = [];
      loaded.value = false;
      page.value = 1;
    };
    const rows = computed(() => {
      const byStudent = new Map();
      for (const result of results.value) {
        const student = result.student_id && typeof result.student_id === 'object' ? result.student_id : null;
        const id = String(student?._id || result.student_id || '');
        if (!id) continue;
        if (!byStudent.has(id)) byStudent.set(id, { id, student: student || {}, results: [] });
        byStudent.get(id).results.push(result);
      }
      const merged = students.value.map(student => ({ id: String(student._id), student, results: byStudent.get(String(student._id))?.results || [] }));
      const known = new Set(merged.map(row => row.id));
      for (const [id, row] of byStudent) if (!known.has(id)) merged.push(row);
      const query = search.value.trim().toLowerCase();
      return merged.filter(row => !query || [row.student.name, row.student.roll_number, row.student.student_code].some(value => String(value || '').toLowerCase().includes(query)));
    });
    const totalPages = computed(() => Math.ceil(rows.value.length / pageSize.value));
    const pageRows = computed(() => rows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));
    watch(search, () => { page.value = 1; });
    const changePage = next => { page.value = Math.min(Math.max(1, next), Math.max(1, totalPages.value)); };
    const markLabel = result => result.total_marks === null || result.total_marks === undefined ? '—' : `${result.total_marks} / ${selectedExam.value?.max_marks ?? '—'}`;
    const selectedCourse = computed(() => courses.value.find(course => String(course._id) === String(filters.value.course_id)) || null);
    const selectedExam = computed(() => exams.value.find(exam => String(exam._id) === String(filters.value.exam_id)) || null);
    const openResultBook = () => router.push({ path: '/results/result-book/class-wise', query: { course_id: filters.value.course_id, exam_id: filters.value.exam_id, academic_year_id: filters.value.academic_year_id } });
    onMounted(fetchOptions);

    return { courses, academicYears, exams, availableExams, filters, search, students, results, rows, pageRows, page, pageSize, totalPages, loading, filtersLoading, loaded, applyFilters, clearFilters, changePage, markLabel, selectedCourse, selectedExam, openResultBook };
  }
};
