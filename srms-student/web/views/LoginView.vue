<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { portalApi } from '../services/api.js';

const props = defineProps({ school: { type: Object, default: null } });
const router = useRouter();
const studentId = ref(localStorage.getItem('srms_remembered_student_id') || '');
const password = ref('');
const rememberMe = ref(Boolean(studentId.value));
const loading = ref(false);
const error = ref('');
const schoolBrand = ref(null);
const features = [
  ['▥', 'Results', 'green'], ['▦', 'Attendance', 'blue'], ['◉', 'Fees', 'orange'], ['▷', 'Lessons', 'purple'],
  ['▤', 'Notes', 'pink'], ['↗', 'Performance', 'cyan'], ['♧', 'Notices', 'yellow'], ['●', 'Profile', 'blue'],
];

onMounted(async () => {
  try { schoolBrand.value = await portalApi.getSchoolBrand(); } catch (cause) { error.value = cause.message; }
});

async function submit() {
  error.value = '';
  if (!studentId.value.trim() || !password.value) { error.value = 'Enter your student ID and password.'; return; }
  loading.value = true;
  try {
    await portalApi.login(studentId.value.trim(), password.value, rememberMe.value);
    await router.replace('/dashboard');
  } catch (cause) { error.value = cause.message; }
  finally { loading.value = false; }
}
</script>

<template>
  <main class="login-page">
    <div class="login-book">
      <section class="welcome-panel" :style="schoolBrand?.campusImageUrl ? { backgroundImage: `linear-gradient(90deg,rgba(245,250,255,.94),rgba(245,250,255,.55)),url('${schoolBrand.campusImageUrl}')` } : {}">
        <div class="school-brand"><img v-if="schoolBrand?.logoUrl" :src="schoolBrand.logoUrl" alt="School logo"><span v-else class="brand-cap">◆</span><div><b>SRMS</b><small>Student Portal</small></div></div>
        <div class="welcome-copy"><i></i><p>WELCOME TO</p><h1>{{ schoolBrand?.name || 'Your School' }}</h1><strong>Learn&nbsp; · &nbsp;Grow&nbsp; · &nbsp;Achieve</strong><p class="welcome-text">Your results, attendance, fees, lessons and school updates — all in one place.</p></div>
        <div class="feature-grid"><div v-for="item in features" :key="item[1]" class="feature"><span :class="item[2]">{{ item[0] }}</span><small>{{ item[1] }}</small></div></div>
        <p class="motto">Education today for a brighter tomorrow.</p>
      </section>
      <section class="login-panel">
        <div class="login-heading"><div class="login-cap">◆</div><h2>SRMS Student Portal</h2><p>Secure access for students</p></div>
        <form class="login-form" @submit.prevent="submit">
          <label>Student ID<div class="input-row"><span>♙</span><input v-model="studentId" autocomplete="username" placeholder="Enter your student ID" required></div></label>
          <label>Password<div class="input-row"><span>▣</span><input v-model="password" type="password" autocomplete="current-password" placeholder="Enter your password" required></div></label>
          <div class="remember-row"><label class="check-label"><input v-model="rememberMe" type="checkbox"><span>Remember me</span></label><a href="#" @click.prevent="error = 'Contact your school administrator to reset your password.'">Forgot password?</a></div>
          <p v-if="error" class="form-error" role="alert">{{ error }}</p>
          <button class="login-button" type="submit" :disabled="loading">{{ loading ? 'Signing in…' : '↪　Login' }}</button>
          <p class="credentials-hint">Use the student ID and password provided by your school.</p>
        </form>
        <div class="divider"><span></span>OR<span></span></div>
        <div class="school-note">⌂　{{ schoolBrand?.name || 'School details are loaded securely from this school hostname.' }}</div>
      </section>
    </div>
  </main>
</template>