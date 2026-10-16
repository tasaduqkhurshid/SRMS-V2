import template from "./SubjectListTemplate.js";
import { api } from "../../../Services/api.js";

const { ref, onMounted, computed } = Vue;

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
    const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
    const showingRange = computed(() => {
      if (!total.value) return "Showing 0–0 of 0 subjects";
      const start = (page.value - 1) * pageSize.value + 1;
      const end = Math.min(page.value * pageSize.value, total.value);
      return `Showing ${start}–${end} of ${total.value} subject${total.value === 1 ? "" : "s"}`;
    });

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
          if (subjects.value.length === 1 && page.value > 1) page.value--;
          getSubjectList();
          toast.success("Subject deleted");
        } else {
          toast.error(res?.data?.message || "Delete failed");
        }
      } catch (err) {
        toast.error("Delete failed: " + (err?.message || err));
      }
    };

    const applySearch = () => { page.value = 1; getSubjectList(); };
    const prev = () => { if (page.value > 1) { page.value--; getSubjectList(); } };
    const next = () => { if (page.value < pages.value) { page.value++; getSubjectList(); } };
    const changePageSize = (val) => { pageSize.value = Number(val || 20); page.value = 1; getSubjectList(); };

    onMounted(() => {
      getSubjectList();
      // initial load only; parent will call getSubjectList() when needed via template ref
    });

    return { loading, subjects, page, pageSize, total, pages, showingRange, searchTerm, getSubjectList, applySearch, editSubject, deleteSubject, prev, next, changePageSize };
  }
};
