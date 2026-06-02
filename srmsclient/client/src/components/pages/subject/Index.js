import template from "./IndexTemplate.js";
import AddEditSubject from "./AddEditSubject.js";
import SubjectList from "./SubjectList.js";

const { ref } = Vue;

export default {
  name: "SubjectsIndex",
  template,
  components: { AddEditSubject, SubjectList },

  setup() {
    const isEdit = ref(false);
    const mode = ref("create");
    const selectedSubjectId = ref(null);

    // template ref for SubjectList component so we can call its methods
    const subjectList = ref(null);

    const subject = ref({ subject_name: "", subject_code: "", has_theory: true, has_lab: false });

    const addSubject = () => {
      mode.value = "create";
      selectedSubjectId.value = null;
      subject.value = { subject_name: "", subject_code: "", has_theory: true, has_lab: false };
      isEdit.value = true;
    };

    const handleEdit = (id) => {
      mode.value = "edit";
      selectedSubjectId.value = id;
      isEdit.value = true;
    };

    const closeSubject = () => {
      isEdit.value = false;
    };

    // Parent handles saved event: close modal and refresh child list via template ref
    const onSaved = () => {
      isEdit.value = false;
      try {
        if (subjectList.value && typeof subjectList.value.getSubjectList === "function") {
          subjectList.value.getSubjectList();
        }
      } catch (err) {
        // fallback: nothing
      }
    };

    return { isEdit, mode, selectedSubjectId, subject, addSubject, handleEdit, closeSubject, onSaved, subjectList };
  },
};
