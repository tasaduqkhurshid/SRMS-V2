import template from "./StudentProfileTemplate.js";
// StudentProfile.js
// Component logic (no template). Use this as the `script` part or import into a component file.
const { ref,  onUnmounted, onMounted } = Vue;
import { api } from "../../../Services/api.js"; // adjust path if needed

export default {
  name: "StudentProfile",
  template,
  props: {
     open: Boolean,
    studentId: {
      type: [Number, String],
      required: false,
      default: null,
    },
  },
  emits: ["edit", "close"],
  setup(props, { emit }) {
    // state
    const loading = ref(false);
    const student = ref(null);
    const isFetched = ref(false);
  const previewUrl = ref("");
    const assignedSubjects = ref([]);
    const placeholderImg = "https://source.unsplash.com/600x300/?student";

    // internal tracker for object URL (so we can revoke it)
    let currentObjectUrl = null;

    // Helper: revoke current object URL if any
    const revokeCurrentObjectUrl = () => {
      if (currentObjectUrl) {
        try {
          URL.revokeObjectURL(currentObjectUrl);
        } catch (e) {
          // ignore
        }
        currentObjectUrl = null;
      }
    };

    // Helper: normalize imageData and set previewUrl
    // imageData may be string url, { url }, { image } (base64), { image_url }, or null
    const applyImageData = async (imageData, fallbackStudentImage) => {
      revokeCurrentObjectUrl();

      try {
        if (!imageData) {
          // fallback to whatever student.image (string) might contain
          previewUrl.value = fallbackStudentImage || "";
          return;
        }

        // if it's a plain string -> assume it's a URL or data URI
        if (typeof imageData === "string") {
          previewUrl.value = imageData;
          return;
        }

        // object shapes
        if (imageData.url) {
          previewUrl.value = imageData.url;
          return;
        }
        if (imageData.image_url) {
          previewUrl.value = imageData.image_url;
          return;
        }
        if (imageData.image && typeof imageData.image === "string") {
          const img = imageData.image;
          previewUrl.value = img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`;
          return;
        }

        // If server somehow included a blob (rare in JSON), handle it:
        if (imageData.blob instanceof Blob) {
          currentObjectUrl = URL.createObjectURL(imageData.blob);
          previewUrl.value = currentObjectUrl;
          return;
        }

        // unknown format - fall back
        previewUrl.value = fallbackStudentImage || "";
      } catch (err) {
  // applyImageData error (removed debug log)
        previewUrl.value = fallbackStudentImage || "";
      }
    };

    // Load both student data and image (server endpoint: GET /students/:id/details)
    const getStudentDetails = async () => {
      if (!props.studentId) return;
  // Loading student ID (debug log removed)

      loading.value = true;
      try {
        // Expect server response: { status: "success", data: { studentData, imageData } }
        const res = await api.get(`/students/${props.studentId}/details`);

        if (res?.data?.status === "success") {
          const { studentData = {}, imageData = null } = res.data.data || {};

          // normalize student fields
          student.value = {
            _id: studentData._id || props.studentId || null,
            roll_number: studentData.roll_number || "",
            name: studentData.name || "",
            father_name: studentData.father_name || "",
            mother_name: studentData.mother_name || "",
            address: studentData.address || "",
            pincode: studentData.pincode || "",
            class: studentData.class || "",
            section: studentData.section || "",
            gender: studentData.gender || "",
            dob: studentData.dob ? String(studentData.dob).slice(0, 10) : "",
            admission_number: studentData.admission_number || "",
            image: studentData.imageUrl || studentData.image || "" // raw image field fallback
          };

          // set preview from imageData or fallback to student.image
          await applyImageData(imageData, student.value.image);

          // load assigned subjects for this student
          try {
            const subRes = await api.get(`/students/${props.studentId}/subjects`);
            if (subRes?.data?.status === "success") {
              assignedSubjects.value = subRes.data.data || [];
            } else {
              assignedSubjects.value = [];
            }
          } catch (e) {
            assignedSubjects.value = [];
          }
          isFetched.value = true;
        } else {
          const msg = res?.data?.message || "Failed to load student";
          // getStudentDetails failed (removed debug log)
          // assume global toast is available
          if (typeof toast !== "undefined" && toast?.error) toast.error(msg);
        }
      } catch (err) {
  // getStudentDetails error (removed debug log)
        if (typeof toast !== "undefined" && toast?.error) toast.error("Failed to load student: " + (err?.message || err));
      } finally {
        loading.value = false;
      }
    };

    // If a studentId was provided initially, load it immediately
    if (props.studentId) {
      // don't await here; let it run and set loading internally
      getStudentDetails();
    }

    // manual reload
    const reload = () => getStudentDetails();

    // emit edit event (parent can open edit modal/route)
    const editStudent= (studentId) => {
      emit("edit", studentId);
    };

    onMounted(() => {
      if (props.open && props.studentId) {
         getStudentDetails();
      } 
    });

    // expose to template / parent
    return {
      loading,
      student,
      previewUrl,
      // Template expects `photoUrl` so expose it as alias to previewUrl
      photoUrl: previewUrl,
      placeholderImg,
      assignedSubjects,
      isFetched,
      getStudentDetails,
      reload,
      editStudent,
      applyImageData, // exported in case parent wants to update image preview manually
    };
    
  },
};
