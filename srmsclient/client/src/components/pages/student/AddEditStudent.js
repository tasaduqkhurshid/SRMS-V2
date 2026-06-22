// AddEditStudent.js
import template from "./AddEditStudentTemplate.js";
import { api } from "../../../Services/api.js";
const { ref, onMounted, computed, nextTick } = Vue;

export default {
  name: "AddEditStudent",
  template,
  props: {
    open: Boolean,
    mode: { type: String, default: "create" },
    studentId: { type: [Number, null], default: null }
  },
  emits: ["close", "saved"],

  setup(props, { emit }) {
    const saving = ref(false);
    const courses = ref([]);
    const academicYears = ref([]);
    // ---------- student details (now includes image field) ----------
    const student = ref({
      roll_number: "",
      name: "",
      father_name: "",
      mother_name: "",
      address: "",
      pincode: "",
      class: "",
      section: "",
      gender: "",
      dob: "",
      admission_number: "",
      academic_year_id: null,
      image: "" // single image field (url)
    });

    // ---------- file preview ----------
    const selectedFile = ref(null);
    const previewUrl = ref("");
    const fileInputRef = ref(null);
    const uploading = ref(false);
    const placeholderImg = "/assets/placeholder-student.png";

    const hasFile = computed(() => !!selectedFile.value);
    
    // Get current academic year name
    const currentYearName = computed(() => {
      if (!student.value.academic_year_id) {
        const currentYear = academicYears.value[0];
        return currentYear?.name || 'Current Year';
      }
      const selected = academicYears.value.find(y => y.id === student.value.academic_year_id);
      return selected?.name || 'Current Year';
    });

    // ---------- Reset form ----------
    const resetAll = () => {
      student.value = {
        roll_number: "",
        name: "",
        father_name: "",
        mother_name: "",
        address: "",
        pincode: "",
        class: "",
        section: "",
        gender: "",
        dob: "",
        admission_number: "",
        academic_year_id: null,
        image: ""
      };

      selectedFile.value = null;
      previewUrl.value = "";
      uploading.value = false;

      if (fileInputRef.value) fileInputRef.value.value = "";
    };

    // ---------- Load student + image ----------
    const getStudentDetails = async () => {
    // Loading student ID (debug log removed)
      if (!props.studentId) return;

      saving.value = true;
      try {
        const res = await api.get(`/students/${props.studentId}/details`);
        if (res.data && res.data.status === "success") {
          const { studentData, imageData } = res.data.data || {};

          student.value = {
            roll_number: studentData?.roll_number || "",
            name: studentData?.name || "",
            father_name: studentData?.father_name || "",
            mother_name: studentData?.mother_name || "",
            address: studentData?.address || "",
            pincode: studentData?.pincode || "",
            class: studentData?.class ? Number(studentData.class) : "",
            section: studentData?.section || "",
            gender: studentData?.gender || "",
            dob: studentData?.dob ? studentData.dob.slice(0, 10) : "",
            admission_number: studentData?.admission_number || "",
            academic_year_id: studentData?.academic_year_id ? Number(studentData.academic_year_id) : null,
            image: (imageData?.url || imageData?.image || imageData?.image_url) || studentData?.imageUrl || studentData?.image || ""
          };

          // show existing image in preview if present
          previewUrl.value = student.value.image || "";
        } else {
          toast.error(res.data?.message || "Failed to load student");
        }
      } catch (err) {
        toast.error("Failed to load student");
      } finally {
        saving.value = false;
      }
    };

    const loadAcademicYears = async () => {
      try {
        const res = await api.get('/options/academic-years/all');
        if (res.data && Array.isArray(res.data.data)) {
          academicYears.value = res.data.data;
          // Sort by most recent first
          academicYears.value.sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""));
        }
      } catch (err) {
        // ignore
      }
    };

    const loadCourses = async () => {
      try {
        const res = await api.get('/courses', { params: { limit: 200 } });
        if (res.data && (res.data.status === 'success' || res.data.success === true)) {
          const data = res.data.data || {};
          courses.value = data.courses || [];
        }
      } catch (err) {
        // ignore
      }
    };

    // ---------- Init on mount ----------
    onMounted(() => {
      // Component mounted (debug log removed)
      loadCourses();
      loadAcademicYears();
      if (props.mode === "edit" && props.studentId) {
        getStudentDetails();
      } else {
        resetAll();
      }
    });

    // ---------- Choose Image ----------
    const onFileChange = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      selectedFile.value = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl.value = e.target.result; // base64 preview
      };
      reader.readAsDataURL(file);
    };

    // ---------- Clear Image ----------
    const clearFile = () => {
      selectedFile.value = null;
      previewUrl.value = student.value.image || "";
      if (fileInputRef.value) fileInputRef.value.value = "";
    };

    // ---------- Upload Photo Now ----------
    // Template calls uploadPhotoNow on button — we keep button but reuse save flow
    const uploadPhotoNow = async () => {
      // If there is no file, short-circuit to show message
      if (!selectedFile.value) return toast.error("Select a file first");
      // If editing and no studentId, require parent to save first (server may expect id)
      if (props.mode === "edit" && !props.studentId) return toast.error("Missing student ID");
      // Delegate to saveStudentDetails — it handles FormData when a file is present
      await saveStudentDetails();
    };

// convert File -> base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const saveStudentDetails = async () => {
  saving.value = true;
  uploading.value = !!selectedFile.value;
  
  try {
    const url = `/students/save`;
    
    // Build payload
    const payload = { ...student.value };
    if (props.studentId) {
      payload.studentId = props.studentId;
    }

    // If user selected an image → convert to base64
    if (selectedFile.value) {
      payload.image = await fileToBase64(selectedFile.value);
    }

    // Make request
    const res = await api.post(url, payload);

    if (res.data?.status === "success") {
      toast.success(props.mode === "edit" ? "Updated" : "Created");

      // Notify parent (list refresh)
      emit("saved", res.data.data);

      // Close modal immediately
      close();
    } else {
      toast.error(res.data?.message || "Save failed");
    }

  } catch (err) {
    toast.error(err.message || "Save failed");
  } finally {
    saving.value = false;
    uploading.value = false;
  }
};


    // ---------- Close ----------
    const close = () => {
      resetAll();
      emit("close");
    };

    return {
      saving,
      student,
      courses,
      academicYears,
      currentYearName,
      selectedFile,
      previewUrl,
      uploading,
      placeholderImg,
      hasFile,
      fileInputRef,

      getStudentDetails,
      onFileChange,
      clearFile,
      uploadPhotoNow,
      saveStudentDetails,
      close
    };
  }
};
