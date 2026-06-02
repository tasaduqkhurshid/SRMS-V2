import template from "./SubjectListTemplate.js";
import { api } from "../../../Services/api.js";

const { ref, onMounted } = Vue;

export default {
  name: "SubjectList",
  template,
  emits: ["edit"],
  setup(props, { emit }) {
    const loading = ref(false);
    const subjects = ref([]);
    const page = ref(1);
    const pageSize = ref(20);
    const total = ref(0);
    const searchTerm = ref("");

    const getSubjectList = async () => {
      loading.value = true;
      try {
        const res = await api.get("/subjects", { params: { page: page.value, limit: pageSize.value, q: searchTerm.value } });
        if (res?.data?.status === "success") {
          subjects.value = res.data.data.subjects || [];
          total.value = res.data.data.meta?.total || 0;
        } else {
          if (typeof toast !== "undefined" && toast?.error) toast.error(res?.data?.message || "Failed to load subjects");
        }
      } catch (err) {
        if (typeof toast !== "undefined" && toast?.error) toast.error("Failed to load subjects: " + (err?.message || err));
      } finally {
        loading.value = false;
      }
    };

    const editSubject = (id) => emit("edit", id);

    const deleteSubject = async (id) => {
      if (!confirm("Delete subject?")) return;
      try {
        const res = await api.delete(`/subjects/${id}`);
        if (res?.data?.status === "success") {
          getSubjectList();
          toast.success("Subject deleted");
        } else {
          toast.error(res?.data?.message || "Delete failed");
        }
      } catch (err) {
        toast.error("Delete failed: " + (err?.message || err));
      }
    };

    const prev = () => { if (page.value > 1) { page.value--; getSubjectList(); } };
    const next = () => { page.value++; getSubjectList(); };
    const changePageSize = (val) => { pageSize.value = Number(val || 20); page.value = 1; getSubjectList(); };

    onMounted(() => {
      getSubjectList();
      // initial load only; parent will call getSubjectList() when needed via template ref
    });

    return { loading, subjects, page, pageSize, total, searchTerm, getSubjectList, editSubject, deleteSubject, prev, next, changePageSize };
  }
};
