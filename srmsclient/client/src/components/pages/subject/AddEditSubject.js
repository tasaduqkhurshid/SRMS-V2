import template from "./AddEditSubjectTemplate.js";
import { api } from "../../../Services/api.js";

const { ref, onMounted } = Vue;

export default {
  name: "AddEditSubject",
  template,
  props: {
    open: Boolean,
    mode: { type: String, default: "create" },
    subjectId: { type: [String, Number], default: null },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const saving = ref(false);
    const subject = ref({ subject_name: "", subject_code: "", has_theory: true, has_lab: false, has_attendance: false, has_activity: false });

    const load = async () => {
      if (!props.subjectId) return;
      try {
        const res = await api.get(`/subjects/${props.subjectId}/details`);
        if (res?.data?.status === "success") {
          subject.value = res.data.data || subject.value;
        } else {
          toast.error(res?.data?.message || "Failed to load subject");
        }
      } catch (err) {
        toast.error("Failed to load subject: " + (err?.message || err));
      }
    };

    onMounted(() => {
      if (props.mode === "edit" && props.subjectId) load();
    });

    const close = () => emit("close");

    const saveSubject = async () => {
      saving.value = true;
      try {
        const payload = { ...subject.value };
        if (props.mode === "edit" && props.subjectId) payload.subjectId = props.subjectId;

        const res = await api.post("/subjects/save", payload);
        if (res?.data?.status === "success") {
          toast.success("Saved");
          emit("saved");
        } else {
          toast.error(res?.data?.message || "Save failed");
        }
      } catch (err) {
        toast.error("Save failed: " + (err?.message || err));
      } finally {
        saving.value = false;
      }
    };

    return { saving, subject, close, saveSubject };
  }
};
