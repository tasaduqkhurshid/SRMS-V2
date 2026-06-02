import template from './IndexTemplate.js';
import AddEditExam from './AddEditExam.js';
import ExamList from './ExamList.js';

const { ref } = Vue;

export default {
  name: 'ExamsIndex',
  template,
  components: { AddEditExam, ExamList },
  setup() {
    const isEdit = ref(false);
    const mode = ref('create');
    const selectedExamId = ref(null);
    const examListRef = ref(null);

    const addExam = () => {
      mode.value = 'create';
      selectedExamId.value = null;
      isEdit.value = true;
    };

    const handleEdit = (examId) => {
      mode.value = 'edit';
      selectedExamId.value = examId;
      isEdit.value = true;
    };

    const close = () => { isEdit.value = false; };

    const onSaved = () => {
      isEdit.value = false;
      try { examListRef.value.getExamList && examListRef.value.getExamList(); } catch (e) {}
    };

    return { isEdit, mode, selectedExamId, examListRef, addExam, handleEdit, close, onSaved };
  }
};
