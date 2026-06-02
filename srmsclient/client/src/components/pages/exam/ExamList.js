import template from './ExamListTemplate.js';
import { api } from '../../../Services/api.js';
const { ref, onMounted } = Vue;

export default {
  name: 'ExamList',
  template,
  emits: ['editExam'],
  setup(props, { emit }) {
    const exams = ref([]);
    const loading = ref(false);

    const getExamList = async () => {
      loading.value = true;
      try {
        const res = await api.get('/exams');
        if (res?.data?.success) exams.value = res.data.data.exams || res.data.data || [];
        else exams.value = [];
      } catch (e) {
        exams.value = [];
      } finally { loading.value = false; }
    };

    const editExam = (id) => { emit('editExam', id); };

    onMounted(() => { getExamList(); });

    return { exams, loading, getExamList, editExam };
  }
};
