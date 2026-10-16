export default `
<div class="subjects-list-card">
  <div class="subjects-search-toolbar">
    <form class="subjects-search-form" @submit.prevent="applySearch">
      <div class="input-group subjects-search-input">
        <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
        <input
          type="search"
          class="form-control"
          v-model="searchTerm"
          placeholder="Search subject name or code..."
          aria-label="Search subject name or code"
        />
      </div>
      <button type="submit" class="btn subjects-search-button" :disabled="loading">
        <i class="fa-solid fa-magnifying-glass me-2"></i>Search
      </button>
    </form>
  </div>

  <div class="table-responsive subjects-table-wrap">
    <table class="table subjects-table align-middle mb-0">
      <thead>
        <tr>
          <th class="subjects-number-column">#</th>
          <th class="subjects-code-column">Code</th>
          <th>Name</th>
          <th class="subjects-flag-column">Theory</th>
          <th class="subjects-flag-column">Lab</th>
          <th class="subjects-actions-column text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(subject, index) in subjects" :key="subject._id">
          <td class="subjects-row-number">{{ (page - 1) * pageSize + index + 1 }}</td>
          <td>{{ subject.subject_code || '—' }}</td>
          <td class="subjects-name">{{ subject.subject_name || '—' }}</td>
          <td><span :class="subject.has_theory ? 'subjects-flag subjects-flag-yes' : 'subjects-flag subjects-flag-no'">{{ subject.has_theory ? 'Yes' : 'No' }}</span></td>
          <td><span :class="subject.has_lab ? 'subjects-flag subjects-flag-yes' : 'subjects-flag subjects-flag-no'">{{ subject.has_lab ? 'Yes' : 'No' }}</span></td>
          <td class="text-center">
            <div class="subjects-row-actions">
              <button class="btn subjects-action-edit" type="button" title="Edit subject" aria-label="Edit subject" @click="editSubject(subject._id)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn subjects-action-delete" type="button" title="Delete subject" aria-label="Delete subject" @click="deleteSubject(subject._id)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="loading">
          <td colspan="6" class="subjects-empty-state">
            <span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Loading subjects...
          </td>
        </tr>
        <tr v-else-if="!subjects.length">
          <td colspan="6" class="subjects-empty-state">No subjects found</td>
        </tr>
      </tbody>
    </table>
  </div>

  <footer class="subjects-pagination">
    <div class="subjects-pagination-summary">{{ showingRange }}</div>
    <nav class="subjects-pagination-controls" aria-label="Subject list pagination">
      <button type="button" class="btn subjects-page-button" :disabled="page <= 1" @click="prev" aria-label="Previous page">
        <i class="fa-solid fa-chevron-left me-2"></i>Previous
      </button>
      <span class="subjects-page-count">Page {{ page }} of {{ pages }}</span>
      <button type="button" class="btn subjects-page-button" :disabled="page >= pages" @click="next" aria-label="Next page">
        Next<i class="fa-solid fa-chevron-right ms-2"></i>
      </button>
      <select class="form-select subjects-page-size" :value="pageSize" @change="changePageSize($event.target.value)" aria-label="Rows per page">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </nav>
  </footer>
</div>
`;
