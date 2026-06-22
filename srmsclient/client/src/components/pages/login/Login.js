
import template from "./LoginTemplate.js";
import appConfig from "../../../config/app-config.js";
import { api } from "../../../Services/api.js";


const { ref } = Vue;
const { useRouter } = VueRouter;

export default {
  name: "LoginPage",
  template,
  setup() {
    const router = useRouter();

    // App info
    const app = ref({ ...appConfig });
    const year = new Date().getFullYear();

    // Tab state
    const isRegisterMode = ref(false);

    // Login Form state
    const email = ref("");
    const password = ref("");
    const isPinLogin = ref(true);
    const showPin = ref(false);
    const showPassword = ref(false);
    const remember = ref(false);

    // Register Form state
    const schoolName = ref("");
    const schoolCode = ref("");
    const schoolEmail = ref("");
    const schoolPhone = ref("");
    const schoolAddress = ref("");
    const schoolCity = ref("");
    const schoolState = ref("");
    const schoolPincode = ref("");
    const adminUsername = ref("");
    const adminEmail = ref("");
    const adminPassword = ref("");
    const adminConfirmPassword = ref("");
    const adminPin = ref("");
    const agreeTerms = ref(false);
    const showRegisterPassword = ref(false);
    const showRegisterConfirmPassword = ref(false);

    const loading = ref(false);
    const pin = ref("");

    const storage = () => (remember.value ? localStorage : sessionStorage);

    const switchToPassword = () => {
      isPinLogin.value = false;
      showPassword.value = false;
    };

    const switchToPin = () => {
      isPinLogin.value = true;
      showPin.value = false;
    };

    // Mask PIN whenever input loses focus
    const handlePinBlur = () => {
      showPin.value = false;
    };

const handleLogin = async () => {
  // Basic validation
  if (!email.value?.trim()) {
    toast.error("Please enter email.");
    return;
  }

  if (isPinLogin.value) {
    pin.value = (pin.value || "").replace(/\D/g, "").slice(0, 4);
    if (pin.value.length !== 4) {
      toast.error("PIN must be exactly 4 digits.");
      return;
    }
  } else if (!password.value) {
    toast.error("Please enter your password.");
    return;
  }

  const url = isPinLogin.value ? "/auth/login-pin" : "/auth/login";
  const payload = isPinLogin.value
    ? { email: email.value.trim(), pin: pin.value }
    : { username: email.value.trim(), password: password.value };

  loading.value = true;

  try {
  const response = await api.post(url, payload);

    // ✅ success condition: HTTP 200 and backend status success
    if (response.status === 200 && response.data?.status === "success") {
      const data = JSON.parse(JSON.stringify(response.data?.data|| response.data));
      const token = data.token || "";
      const user = data.user || {};
      toast.success("Login successful");

      // ✅ use correct storage (local/session)
      const store = localStorage;
      store.setItem("token", token);
      store.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          username: user.username,
          role: user.role,
          school: user.School,
        })
      );

      // set auth header
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // redirect
      router.push({ path: "/dashboard" });
    } else {
      const msg =
        response?.data?.message ||
        response?.data?.error ||
        "Login failed. Please try again.";
      toast.error(msg);
      router.push("/");
    }
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Login failed. Please try again.";
    toast.error(msg);
  }

  loading.value = false;
};

const handleRegister = async () => {
  // Validation
  if (!schoolName.value?.trim()) {
    toast.error("School name is required");
    return;
  }
  if (!schoolCode.value?.trim()) {
    toast.error("School code is required");
    return;
  }
  if (!schoolEmail.value?.trim()) {
    toast.error("School email is required");
    return;
  }
  if (!adminUsername.value?.trim()) {
    toast.error("Admin username is required");
    return;
  }
  if (adminUsername.value.length < 3) {
    toast.error("Username must be at least 3 characters");
    return;
  }
  if (!adminEmail.value?.trim()) {
    toast.error("Admin email is required");
    return;
  }
  if (!adminPassword.value?.trim()) {
    toast.error("Password is required");
    return;
  }
  if (adminPassword.value.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }
  if (adminPassword.value !== adminConfirmPassword.value) {
    toast.error("Passwords do not match");
    return;
  }
  if (!agreeTerms.value) {
    toast.error("Please agree to terms and conditions");
    return;
  }

  loading.value = true;

  try {
    const payload = {
      school: {
        school_name: schoolName.value,
        school_code: schoolCode.value,
        email: schoolEmail.value,
        contact_number: schoolPhone.value || null,
        address: schoolAddress.value || null,
        city: schoolCity.value || null,
        state: schoolState.value || null,
        pincode: schoolPincode.value || null,
      },
      admin: {
        username: adminUsername.value,
        email: adminEmail.value,
        password: adminPassword.value,
        pin: adminPin.value || null,
      },
    };

    const response = await api.post("/school/register", payload);

    if (response.data.ok || response.status === 200) {
      toast.success("Registration successful! Logging you in...");
      
      // Clear register form
      isRegisterMode.value = false;
      schoolName.value = "";
      schoolCode.value = "";
      schoolEmail.value = "";
      schoolPhone.value = "";
      schoolAddress.value = "";
      schoolCity.value = "";
      schoolState.value = "";
      schoolPincode.value = "";
      adminUsername.value = "";
      adminEmail.value = "";
      adminPassword.value = "";
      adminConfirmPassword.value = "";
      adminPin.value = "";
      agreeTerms.value = false;

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      toast.error(response.data.message || "Registration failed");
    }
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || "Registration failed";
    toast.error(msg);
  } finally {
    loading.value = false;
  }
};

    return {
      // app info
      app,
      year,

      // mode toggle
      isRegisterMode,

      // login form fields
      email,
      password,
      isPinLogin,
      showPin,
      showPassword,
      remember,
      pin,

      // register form fields
      schoolName,
      schoolCode,
      schoolEmail,
      schoolPhone,
      schoolAddress,
      schoolCity,
      schoolState,
      schoolPincode,
      adminUsername,
      adminEmail,
      adminPassword,
      adminConfirmPassword,
      adminPin,
      agreeTerms,
      showRegisterPassword,
      showRegisterConfirmPassword,

      // state
      loading,

      // actions
      switchToPassword,
      switchToPin,
      handlePinBlur,
      handleLogin,
      handleRegister,
    };
  },
};
