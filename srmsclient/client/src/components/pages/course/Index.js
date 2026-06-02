import template from './IndexTemplate.js';
import CourseList from './CourseList.js';
import AddEditCourse from './AddEditCourse.js';
import AssignSubjectModal from '../../modals/AssignSubjectModalComponent.js';

const { ref } = Vue;

export default {
  name: 'CoursesIndex',
  template,
  components: { CourseList, AddEditCourse, AssignSubjectModal },

  setup() {
    const isEdit = ref(false);
    const mode = ref('create');
    const selectedCourseId = ref(null);
    const courseList = ref(null);
    const showAssignModal = ref(false);
    const selectedEntityId = ref(null);
    const selectedEntityType = ref('course');

    const addCourse = () => {
      mode.value = 'create';
      selectedCourseId.value = null;
      isEdit.value = true;
    };

    const handleEdit = (id) => {
      mode.value = 'edit';
      selectedCourseId.value = id;
      isEdit.value = true;
    };

    const closeCourse = () => { isEdit.value = false };
    const onSaved = () => {
      isEdit.value = false;
      try { if (courseList.value && typeof courseList.value.getCourseList === 'function') courseList.value.getCourseList(); } catch(e) {}
    };

    const openAssignModal = (courseId) => {
      selectedEntityId.value = courseId;
      selectedEntityType.value = 'course';
      showAssignModal.value = true;
    };

    const onAssignModalSaved = () => {
      showAssignModal.value = false;
      try { if (courseList.value && typeof courseList.value.getCourseList === 'function') courseList.value.getCourseList(); } catch(e) {}
    };

    return { 
      isEdit, mode, selectedCourseId, courseList, 
      addCourse, handleEdit, closeCourse, onSaved,
      showAssignModal, selectedEntityId, selectedEntityType,
      openAssignModal, onAssignModalSaved
    };
  }
};
