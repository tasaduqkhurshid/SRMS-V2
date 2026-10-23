import template from "./StudentListTemplate.js";
import { api } from "../../../Services/api.js";
const { ref, onMounted, onUnmounted, watch, computed } = Vue;
const { useRoute } = VueRouter;

export default {
  name: "StudentList",
  template,
  emits: ["edit","view","assign", "add"],

  setup(_, { emit }) {
    const route = useRoute();
    const loading = ref(false);
    const students = ref([]);
    const selectedStudents = ref([]);
    const total = ref(0);
    const meta = ref({ page: 1, limit: 20, total: 0, pages: 1 });
    const courses = ref([]);
    const photoObjectUrls = new Map();

    const clearPhotoUrls = () => {
      photoObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      photoObjectUrls.clear();
    };

    const loadStudentPhotos = async (rows) => {
      clearPhotoUrls();
      await Promise.all((rows || []).filter((student) => student.has_profile_image).map(async (student) => {
        try {
          const response = await api.get(`/students/${student._id}/image`, { responseType: "blob" });
          const url = URL.createObjectURL(response.data);
          photoObjectUrls.set(String(student._id), url);
          student.avatarUrl = url;
        } catch (_) {
          student.avatarUrl = "";
        }
      }));
    };

    // clearer variable names
    const searchTerm = ref("");
    const classId = ref("");
    const section = ref("");
    const sortKey = ref("");
    const sortDirection = ref("asc");

    const page = ref(1);
    const pageSize = ref(20);

    // Load courses for class filter dropdown
    const loadCourses = async () => {
      try {
        const response = await api.get("/options/courses/all");
        if (response.data && Array.isArray(response.data.data)) {
          courses.value = response.data.data;
        }
      } catch (e) {
        // ignore - courses are optional for filtering
        console.warn("Could not load courses for filter:", e?.message || e);
      }
    };

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
      const pages = payload.meta?.pages ?? Math.ceil(totalCount / pageSize.value) ?? 1;
      return { studentsList, totalCount, pages };
    };

    const getStudentList = async () => {
      loading.value = true;
      try {
        const params = buildParams();
        const response = await api.get("/students", { params });

        const { studentsList, totalCount, pages } = parseResponse(response);

        students.value = Array.isArray(studentsList) ? studentsList : [];
        await loadStudentPhotos(students.value);
        total.value = Number(totalCount) || 0;
        meta.value = {
          page: page.value,
          limit: pageSize.value,
          total: Number(totalCount) || 0,
          pages: Math.max(1, pages),
        };
      } catch (e) {
        toast?.error?.("Failed to load students: " + (e?.message || e));
        students.value = [];
        total.value = 0;
        meta.value = { page: 1, limit: pageSize.value, total: 0, pages: 1 };
      } finally {
        loading.value = false;
      }
    };

    const editStudent = (studentId) => {
      if (!studentId) return;
      emit("edit", studentId);
    };

    const viewStudent = (studentId) => {
      if (!studentId) return;
      emit("view", studentId);
    };

    const assignStudent = (studentId) => {
      if (!studentId) return;
      emit("assign", studentId);
    };

    const deleteStudent = async (id) => {
      if (!confirm("Delete this student?")) return;
      try {
        await api.delete(`/students/${id}`);
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
      if (page.value < meta.value.pages) {
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

    const clearFilters = () => {
      searchTerm.value = "";
      classId.value = "";
      section.value = "";
      page.value = 1;
      getStudentList();
    };

    const handleAddStudent = () => {
      emit("add");
    };

    // Computed: check if any filters are active
    const hasActiveFilters = computed(() => 
      searchTerm.value.trim() || classId.value || section.value
    );

    const allStudentsSelected = computed(() =>
      students.value.length > 0 && students.value.every((student) => selectedStudents.value.includes(student._id))
    );

    const toggleAllStudents = (checked) => {
      const visibleIds = students.value.map((student) => student._id);
      selectedStudents.value = checked
        ? [...new Set([...selectedStudents.value, ...visibleIds])]
        : selectedStudents.value.filter((id) => !visibleIds.includes(id));
    };

    const toggleSort = (key) => {
      if (sortKey.value === key) {
        sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
        return;
      }
      sortKey.value = key;
      sortDirection.value = "asc";
    };

    const sortIndicator = (key) => {
      if (sortKey.value !== key) return "fa-sort";
      return sortDirection.value === "asc" ? "fa-sort-up" : "fa-sort-down";
    };

    const sortedStudents = computed(() => {
      if (!sortKey.value) return students.value;
      const direction = sortDirection.value === "asc" ? 1 : -1;
      return [...students.value].sort((first, second) => {
        const firstValue = first?.[sortKey.value] ?? "";
        const secondValue = second?.[sortKey.value] ?? "";
        return String(firstValue).localeCompare(String(secondValue), undefined, {
          numeric: true,
          sensitivity: "base",
        }) * direction;
      });
    });

    // Computed: showing range text (e.g., "Showing 1–20 of 45 students")
    const showingRange = computed(() => {
      const { page: currentPage, limit, total: totalCount } = meta.value;
      if (totalCount === 0) return "Showing 0 of 0 students";
      const start = (currentPage - 1) * limit + 1;
      const end = Math.min(currentPage * limit, totalCount);
      return `Showing ${start}–${end} of ${totalCount} student${totalCount !== 1 ? "s" : ""}`;
    });

    // Computed: get student initials for avatar fallback
    const getInitials = (name) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Computed: get avatar color based on student ID for consistent coloring
    const getAvatarColor = (id) => {
      const colors = [
        "#4F46E5", // indigo
        "#10B981", // emerald
        "#F59E0B", // amber
        "#EF4444", // red
        "#3B82F6", // blue
        "#8B5CF6", // violet
        "#EC4899", // pink
        "#06B6D4", // cyan
      ];
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    // Computed: gender badge variant class
    const genderBadgeClass = (gender) => {
      const g = String(gender || "").toLowerCase();
      if (g === "male") return "badge-male";
      if (g === "female") return "badge-female";
      return "badge-other";
    };

    onMounted(() => {
      loadCourses();
      // support arriving here from the global header search
      const q = route.query.q;
      if (typeof q === "string" && q.trim()) {
        searchTerm.value = q.trim();
      }
      getStudentList();
    });

    onUnmounted(clearPhotoUrls);

    // keep the list in sync when the header search updates the query
    watch(() => route.query.q, (q) => {
      if (typeof q === "string") {
        searchTerm.value = q.trim();
        getStudentList();
      }
    });

    // initial load only; parent will refresh via template ref when needed

    return {
      loading,
      students,
      sortedStudents,
      selectedStudents,
      allStudentsSelected,
      toggleAllStudents,
      sortKey,
      sortDirection,
      toggleSort,
      sortIndicator,
      total,
      meta,
      courses,
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
      clearFilters,
      handleAddStudent,
      showingRange,
      hasActiveFilters,
      getInitials,
      getAvatarColor,
      genderBadgeClass,
    };
  },
};
