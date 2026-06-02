import template from './AddEditExamTemplate.js';
import { api } from '../../../Services/api.js';
const { ref, onMounted, watch } = Vue;

export default {
  name: 'AddEditExam',
  template,
  props: { mode: { type: String, default: 'create' }, examId: { type: [String, Number], default: null } },
  emits: ['close','saved'],
  setup(props, { emit }) {
    const loading = ref(false);
    const saving = ref(false);
    const exam = ref({ exam_name: '', max_marks: 100, academic_year_id: null });
    const years = ref([]);

    const load = async () => {
      loading.value = true;
      try {
        // fetch academic years
        const yr = await api.get('/options/academic-years/all');
        if (yr?.data && Array.isArray(yr.data.data)) years.value = yr.data.data;
        else years.value = [];

        if (props.mode === 'edit' && props.examId) {
          const res = await api.get(`/exams/${props.examId}`);
          if (res?.data?.success) exam.value = res.data.data || {};
        }
      } catch (e) {}
      finally { loading.value = false; }
    };

    const save = async () => {
      saving.value = true;
      try {
        const payload = { ...exam.value };
        const res = await api.post('/exams/save', payload);
        if (res?.data?.success) {
          emit('saved');
        } else {
          toast?.error?.(res?.data?.message || 'Save failed');
        }
      } catch (e) {
        toast?.error?.('Save failed');
      } finally { saving.value = false; }
    };

    onMounted(() => { load(); });

    watch(() => props.examId, (v) => { if (props.mode === 'edit') load(); });

    const close = () => emit('close');
    return { loading, saving, exam, years, save, close };
  }
};
