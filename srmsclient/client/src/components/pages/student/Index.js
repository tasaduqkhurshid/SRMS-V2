import template from "./IndexTemplate.js";
import AddEditStudent from "./AddEditStudent.js";
import StudentList from "./StudentList.js";
import StudentProfile from "./StudentProfile.js";
import AssignSubjectModal from "../../modals/AssignSubjectModalComponent.js";

const { ref } = Vue;

export default {
  name: "StudentsIndex",
  template,
  components: { AddEditStudent, StudentList, StudentProfile, AssignSubjectModal, StudentSubjectsModal: AssignSubjectModal },

  setup() {
    const isEdit  = ref(false);
    const isView = ref(false);
    const mode = ref("create");          // "create" | "edit"
    const selectedStudentId = ref(null);
    const studentList = ref(null);
  const showSubjectsModal = ref(false);
  const studentForSubjects = ref(null);

    // This is passed to modal; modal creates a reactive copy on mount.
    const student = ref({
      roll_number: "",
      name: "",
      class: "",
      section: "",
      gender: "",
      dob: "",
      admission_number: "",
      image: ""
    });

    // Add student
    const addStudent = () => {
      mode.value = "create";
      selectedStudentId.value = null;

      // reset student fields for fresh form
      student.value = {
        roll_number: "",
        name: "",
        class: "",
        section: "",
        gender: "",
        dob: "",
        admission_number: "",
        image: ""
      };

      isEdit.value = true;
    };

    // Edit student
    const handleEdit = (studentId) => {
      // Editing student ID (debug log removed)
      mode.value = "edit";
      selectedStudentId.value = studentId;
      isEdit.value = true;
      isView.value = false;
    };

    const handleView = (studentId) => {
      // Viewing student ID (debug log removed)
      mode.value = "view";
      selectedStudentId.value = studentId;
      isView.value = true;
    };

    const closeStudent = () => {
      isEdit.value = false;
      isView.value = false;
    };

    // After modal saves successfully
    const onSaved = () => {
      isEdit.value = false;
      isView.value = false;

      // Refresh the student list via template ref (parent -> child method)
      try {
        if (studentList.value && typeof studentList.value.getStudentList === "function") {
          studentList.value.getStudentList();
        }
      } catch (e) {}
    };

    const handleAssign = (studentId) => {
      studentForSubjects.value = studentId;
      showSubjectsModal.value = true;
    };

    const onSubjectsSaved = () => {
      showSubjectsModal.value = false;
      studentForSubjects.value = null;
      // refresh list/profile
      try {
        if (
          studentList.value &&
          typeof studentList.value.getStudentList === "function"
        )
          studentList.value.getStudentList();
      } catch (e) {}
    };

    return {
      isEdit,
      isView,
      mode,
      selectedStudentId,
      student,
      studentList,
  showSubjectsModal,
  studentForSubjects,

      addStudent,
      handleView,
      handleEdit,
      closeStudent,
      onSaved
      , handleAssign, onSubjectsSaved
    };
  }
};
