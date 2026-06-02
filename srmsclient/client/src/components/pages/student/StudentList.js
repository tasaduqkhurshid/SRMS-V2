import template from "./StudentListTemplate.js";
import { api } from "../../../Services/api.js";
const { ref, onMounted } = Vue;

export default {
  name: "StudentList",
  template,
  emits: ["edit","view","assign"],

  setup(_, { emit }) {
    const loading = ref(false);
    const students = ref([]);
    const total = ref(0);

    // clearer variable names
    const searchTerm = ref("");
    const classId = ref("");
     const section = ref("");

    const page = ref(1);
    const pageSize = ref(20);

    const buildParams = () => {
      return {
        page: page.value,
        limit: pageSize.value,
        ...(searchTerm.value && { q: searchTerm.value }),
        ...(classId.value && { class: classId.value }),
        ...(section.value && { section: section.value }),
      };
    };

    const parseResponse = (response) => {
      // support multiple possible shapes
      const payload = response?.data?.data ?? response?.data ?? {};
      const studentsList = payload.students ?? payload.results ?? payload.items ?? [];
      const totalCount = payload.meta?.total ?? payload.total ?? payload.count ?? 0;
      return { studentsList, totalCount };
    };

    const getStudentList = async () => {
      loading.value = true;
      try {
        const params = buildParams();
        const response = await api.get("/students", { params });

        const { studentsList, totalCount } = parseResponse(response);

        students.value = Array.isArray(studentsList) ? studentsList : [];
        total.value = Number(totalCount) || 0;
      } catch (e) {
        // keep message friendly and safe
        toast?.error?.("Failed to load students: " + (e?.message || e));
      } finally {
        loading.value = false;
      }
    };

    const editStudent = (studentId) =>{
      if (!studentId) return;
      emit("edit", studentId);
    };

    const viewStudent = (studentId) => {
      // viewStudent called (debug log removed)
      if (!studentId) return;
      emit("view", studentId);
    };

    const assignStudent = (studentId) => {
      if (!studentId) return;
      emit('assign', studentId);
    };

    const deleteStudent = async (id) => {
      if (!confirm("Delete this student?")) return;
      try {
        await api.delete(`/students/${id}`);
        // refetch current page (keeps pagination stable)
        await getStudentList();
      } catch (e) {
        toast?.error?.("Delete failed: " + (e?.message || e));
      }
    };

    const prev = () => {
      if (page.value > 1) {
        page.value--;
        getStudentList();
      }
    };

    const next = () => {
      // if current page has enough rows, go to next
      if (students.value.length >= pageSize.value) {
        page.value++;
        getStudentList();
      }
    };

    const changePageSize = (ps) => {
      pageSize.value = Number(ps) || 20;
      page.value = 1;
      getStudentList();
    };

    // Helpers to reset page when search/filter changes
    const applySearch = () => {
      page.value = 1;
      getStudentList();
    };

    const applyFilters = () => {
      page.value = 1;
      getStudentList();
    };

    onMounted(getStudentList);

    // initial load only; parent will refresh via template ref when needed

    return {
      loading,
      students,
      total,
      searchTerm,
      classId,
      section,
      page,
      pageSize,
      getStudentList,
      editStudent,
      viewStudent,
      assignStudent,
      deleteStudent,
      prev,
      next,
      changePageSize,
      applySearch,
      applyFilters,
    };
  },
};
