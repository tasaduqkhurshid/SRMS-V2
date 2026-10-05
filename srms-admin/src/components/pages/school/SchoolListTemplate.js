export default `<section class="panel">
    <div class="section-heading"><div><p class="eyebrow">TENANT MANAGEMENT</p><h2>Schools</h2></div><button class="secondary" @click="$emit('refresh')">Refresh</button></div>
    <div v-if="loading" class="empty">Loading schools…</div>
    <div v-else-if="schools.length" class="table-wrap"><table><thead><tr><th>School</th><th>Slug</th><th>Admin portal URL</th><th>Student portal URL</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody><tr v-for="school in paginatedSchools" :key="school._id"><td><strong>{{ school.school_name }}</strong><small>{{ school.email || 'No email' }}</small></td><td><code>{{ school.slug }}</code></td><td><a class="portal-url" :href="schoolPortalUrl(school)" target="_blank" rel="noopener noreferrer">{{ schoolPortalUrl(school) }}</a></td><td><a class="portal-url" :href="schoolPortalUrl(school, '/login')" target="_blank" rel="noopener noreferrer">{{ schoolPortalUrl(school, '/login') }}</a></td><td><span :class="['status', school.status === 'inactive' ? 'off' : 'on']">{{ school.status || 'active' }}</span></td><td>{{ school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '—' }}</td><td class="row-actions"><button class="secondary" @click="$emit('view', school)">View / edit</button><button class="secondary" @click="$emit('toggle', school)">{{ school.status === 'inactive' ? 'Activate' : 'Deactivate' }}</button></td></tr></tbody></table></div>
    <div v-else class="empty">No schools found yet.</div>
    <div v-if="schools.length" class="pagination-bar">
      <span>Showing {{ pageStart }}–{{ pageEnd }} of {{ schools.length }} schools</span>
      <div class="pagination-controls">
        <button class="secondary" type="button" :disabled="currentPage <= 1" @click="$emit('previous')">Previous</button>
        <span>Page {{ currentPage }} of {{ pageCount }}</span>
        <button class="secondary" type="button" :disabled="currentPage >= pageCount" @click="$emit('next')">Next</button>
      </div>
    </div>
  </section>`;
