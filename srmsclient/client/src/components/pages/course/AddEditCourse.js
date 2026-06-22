import template from './AddEditCourseTemplate.js';
import { api } from '../../../Services/api.js';
const { ref, onMounted } = Vue;

export default {
  name: 'AddEditCourse',
  template,
  props: { open: Boolean, mode: { type: String, default: 'create' }, courseId: { type: [Number, null], default: null } },
  emits: ['close','saved'],
  setup(props, { emit }) {
    const saving = ref(false);
    const course = ref({ course_name: '', course_code: '', description: '' });

    const getCourse = async () => {
      if (!props.courseId) return;
      saving.value = true;
      try {
        const res = await api.get(`/courses/${props.courseId}`);
        if (res.data && res.data.status === 'success') course.value = res.data.data || course.value;
      } catch (err) { toast.error('Failed to load course'); }
      finally { saving.value = false; }
    };

    const save = async () => {
      saving.value = true;
      try {
        const payload = { ...course.value };
        if (props.mode === 'edit') payload.id = props.courseId;
        const res = await api.post('/courses/save', payload);
        if (res.data && res.data.status === 'success') {
          toast.success('Saved');
          emit('saved');
        } else toast.error('Save failed');
      } catch (err) { toast.error('Save failed'); }
      finally { saving.value = false; }
    };

    onMounted(() => { if (props.mode === 'edit' && props.courseId) getCourse(); });

    const close = () => { emit('close'); };
    return { saving, course, getCourse, save, close };
  }
};
