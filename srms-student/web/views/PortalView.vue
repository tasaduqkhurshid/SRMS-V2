<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { portalApi } from '../services/api.js';

const props = defineProps({ section: { type: String, required: true } });
const router = useRouter();
const data = ref(null);
const loading = ref(true);
const error = ref('');
const session = portalApi.getSession();
const school = computed(() => session?.school || {});
const student = computed(() => session?.student || {});
const navigation = [
  ['dashboard', 'Overview'], ['profile', 'Profile'], ['results', 'Results'], ['performance', 'Performance'],
  ['attendance', 'Attendance'], ['fees', 'Fees'], ['lectures', 'Lectures'], ['notes', 'Notes'], ['notifications', 'Notifications'],
];
const title = computed(() => props.section[0].toUpperCase() + props.section.slice(1));

onMounted(async () => {
  const endpoint = props.section === 'dashboard' ? '/api/student/dashboard' : `/api/student/${props.section}`;
  try { data.value = await portalApi.request(endpoint); }
  catch (cause) {
    error.value = cause.message;
    if (cause.message.toLowerCase().includes('authentication')) { portalApi.logout(); router.replace('/login'); }
  } finally { loading.value = false; }
});

function logout() { portalApi.logout(); router.replace('/login'); }
function displayValue(value) { return value === null || value === undefined || value === '' ? '—' : value; }
</script>

<template>
  <div class="portal-layout">
    <aside class="portal-sidebar"><a class="portal-brand" href="/dashboard"><span>{{ school.abbreviation || 'SR' }}</span><b>{{ school.name || 'Student Portal' }}<small>Student Portal</small></b></a><nav><RouterLink v-for="item in navigation" :key="item[0]" :to="`/${item[0]}`" :class="{ active: item[0] === section }">{{ item[1] }}</RouterLink></nav><button class="logout-button" @click="logout">Sign out</button></aside>
    <main class="portal-main"><header class="portal-topbar"><div><small>STUDENT PORTAL</small><h1>{{ title }}</h1></div><div class="student-chip"><span>{{ (student.name || 'Student').slice(0,1) }}</span>{{ student.name || 'Student' }}</div></header>
      <p v-if="error" class="form-error">{{ error }}</p><div v-if="loading" class="portal-card">Loading {{ title.toLowerCase() }}…</div>
      <template v-else-if="!error">
        <section v-if="section === 'dashboard'" class="portal-stats"><article><small>Attendance</small><strong>{{ displayValue(data?.dashboard?.attendance) }}%</strong></article><article><small>Performance</small><strong>{{ displayValue(data?.dashboard?.performance) }}%</strong></article><article><small>Next examination</small><strong>{{ displayValue(data?.dashboard?.nextExam) }}</strong></article><article><small>School</small><strong>{{ school.name || '—' }}</strong></article></section>
        <section class="portal-card"><h2>{{ title }} details</h2>
          <template v-if="section === 'profile'"><p><b>Name</b>{{ displayValue(data?.student?.name || student.name) }}</p><p><b>Student ID</b>{{ displayValue(data?.student?.admissionNumber || student.admissionNumber) }}</p><p><b>Class / section</b>{{ displayValue(data?.student?.className || student.className) }} / {{ displayValue(data?.student?.section || student.section) }}</p><p><b>Academic year</b>{{ displayValue(data?.academicYear?.name || student.academicYear) }}</p></template>
          <div v-else-if="Array.isArray(data) && data.length" class="data-list"><pre v-for="(item,index) in data" :key="item.id || item._id || index">{{ JSON.stringify(item, null, 2) }}</pre></div>
          <div v-else-if="Array.isArray(data?.results) && data.results.length" class="data-list"><pre v-for="(item,index) in data.results" :key="item.id || item._id || index">{{ JSON.stringify(item, null, 2) }}</pre></div>
          <div v-else class="empty-state">No {{ title.toLowerCase() }} information is available yet.</div>
        </section>
      </template>
    </main>
  </div>
</template>