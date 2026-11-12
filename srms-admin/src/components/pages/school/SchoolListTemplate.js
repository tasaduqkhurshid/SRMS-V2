export default `<div>
  <section class="panel" v-if="!isViewing">
    <div class="section-heading">
      <div><p class="eyebrow">TENANT MANAGEMENT</p><h2>Schools</h2></div>
      <div class="section-actions">
        <button class="secondary icon-btn" @click="handleRefresh" aria-label="Refresh" title="Refresh">
          <i class="fa-solid fa-rotate-right" style="font-size: 16px;"></i>
        </button>
        <button class="primary btn-add" @click="handleAdd" aria-label="Add school" title="Add school">
          <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
          <span>Add</span>
        </button>
      </div>
    </div>
    <div v-if="loading" class="empty">Loading schools…</div>
    <div v-else-if="schools.length" class="school-accordion">
      <div v-for="school in paginatedSchools" :key="school._id" class="school-accordion-item">
        <button class="school-accordion-header" @click="toggleExpand(school)" :aria-expanded="isExpanded(school)">
          <div class="school-main-info">
            <div class="school-identity">
              <strong>{{ school.school_name }}</strong>
              <code>{{ school.slug }}</code>
            </div>
            <div class="school-meta-row">
              <span v-if="school.email" class="school-email">{{ school.email }}</span>
              <span :class="['status', school.status === 'inactive' ? 'off' : 'on']">{{ school.status || 'active' }}</span>
              <span class="school-date">{{ school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '—' }}</span>
            </div>
          </div>
          <div class="school-portals">
            <div class="portal-group">
              <a v-if="getSchoolAdminUrl(school)" :href="getSchoolAdminUrl(school)" target="_blank" rel="noopener noreferrer" class="portal-link" @click.stop title="Open School Portal">
                <i class="fa-solid fa-school" style="font-size: 14px;"></i>
                <span>School</span>
                <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 12px; margin-left: 4px;"></i>
              </a>
              <button class="icon-btn portal-copy-btn" @click.stop="handleCopyUrl(school, 'admin')" :disabled="isCopying(school, 'admin')" :title="isCopying(school, 'admin') ? 'Copying...' : 'Copy to clipboard'" aria-label="Copy School Portal URL">
                <i v-if="!isCopying(school, 'admin') && !isCopySuccess(school, 'admin')" class="fa-regular fa-copy" style="font-size: 14px;"></i>
                <i v-if="isCopying(school, 'admin')" class="fa-solid fa-spinner fa-spin" style="font-size: 14px;"></i>
                <i v-if="isCopySuccess(school, 'admin')" class="fa-solid fa-check" style="font-size: 14px; color: var(--success-color, #10b981);"></i>
              </button>
            </div>
            <div class="portal-group">
              <a v-if="getStudentPortalUrl(school)" :href="getStudentPortalUrl(school)" target="_blank" rel="noopener noreferrer" class="portal-link" @click.stop title="Open Student Portal">
                <i class="fa-solid fa-graduation-cap" style="font-size: 14px;"></i>
                <span>Students</span>
                <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 12px; margin-left: 4px;"></i>
              </a>
              <button class="icon-btn portal-copy-btn" @click.stop="handleCopyUrl(school, 'student')" :disabled="isCopying(school, 'student')" :title="isCopying(school, 'student') ? 'Copying...' : 'Copy to clipboard'" aria-label="Copy Student Portal URL">
                <i v-if="!isCopying(school, 'student') && !isCopySuccess(school, 'student')" class="fa-regular fa-copy" style="font-size: 14px;"></i>
                <i v-if="isCopying(school, 'student')" class="fa-solid fa-spinner fa-spin" style="font-size: 14px;"></i>
                <i v-if="isCopySuccess(school, 'student')" class="fa-solid fa-check" style="font-size: 14px; color: var(--success-color, #10b981);"></i>
              </button>
            </div>
          </div>
          <div class="school-actions">
            <button class="icon-btn" @click.stop="handleView(school)" aria-label="View school details" title="View details">
              <i class="fa-solid fa-eye" style="font-size: 16px;"></i>
            </button>
            <button class="icon-btn" @click.stop="handleEdit(school)" aria-label="Edit school" title="Edit school">
              <i class="fa-solid fa-pen-to-square" style="font-size: 16px;"></i>
            </button>
            <button class="icon-btn" @click.stop="handleAddUser(school)" aria-label="Add user to {{ school.school_name }}" title="Add administrator">
              <i class="fa-solid fa-user-plus" style="font-size: 16px;"></i>
            </button>
            <button class="icon-btn" :class="school.status === 'inactive' ? 'activate' : 'deactivate'" @click.stop="handleToggle(school)" :aria-label="school.status === 'inactive' ? 'Activate school' : 'Deactivate school'" :title="school.status === 'inactive' ? 'Activate' : 'Deactivate'">
              <i v-if="school.status === 'inactive'" class="fa-solid fa-power-off" style="font-size: 16px;"></i>
              <i v-else class="fa-solid fa-circle-xmark" style="font-size: 16px;"></i>
            </button>
            <i class="fa-solid fa-chevron-down accordion-chevron" :class="{ rotated: isExpanded(school) }" style="font-size: 16px;"></i>
          </div>
        </button>
        <div v-if="isExpanded(school)" class="school-accordion-content" style="display: block;">
          <div v-if="isLoadingAdmins(school)" class="accordion-loading">Loading administrators…</div>
          <div v-else class="accordion-users">
            <div class="user-group">
              <h5>Administrators <span class="count">{{ getAdmins(school).length }}</span></h5>
              <ul v-if="getAdmins(school).length" class="admin-list">
                <li v-for="admin in getAdmins(school)" :key="admin._id" class="admin-row">
                  <div class="admin-info">
                    <div class="admin-identity">
                      <span class="admin-name">{{ admin.username }}</span>
                      <span class="admin-role-badge">{{ admin.role }}</span>
                    </div>
                    <span class="admin-email">{{ admin.email || 'No email' }}</span>
                  </div>
                  <div class="admin-actions">
                    <button class="icon-btn edit-admin" @click.stop="handleEditAdmin(school, admin)" aria-label="Edit administrator" title="Edit">
                      <i class="fa-solid fa-pen-to-square" style="font-size: 14px;"></i>
                    </button>
                    <button class="icon-btn delete-admin" @click.stop="handleDeleteAdmin(school, admin)" aria-label="Delete administrator" title="Delete">
                      <i class="fa-solid fa-trash" style="font-size: 14px;"></i>
                    </button>
                  </div>
                </li>
              </ul>
              <p v-else class="no-users">No administrators</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty">No schools found yet.</div>
    <div v-if="schools.length" class="pagination-bar">
      <span>Showing {{ pageStart }}–{{ pageEnd }} of {{ schools.length }} schools</span>
      <div class="pagination-controls">
        <button class="secondary" type="button" :disabled="currentPage <= 1" @click="handlePrevious">Previous</button>
        <span>Page {{ currentPage }} of {{ pageCount }}</span>
        <button class="secondary" type="button" :disabled="currentPage >= pageCount" @click="handleNext">Next</button>
      </div>
    </div>
  </section>

  <!-- View School (inline tabs, replaces list) -->
  <div v-if="isViewing" class="school-view-tabs">
    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">Details</button>
      <button class="tab-btn" :class="{ active: activeTab === 'gateways' }" @click="activeTab = 'gateways'; handleGateways(viewSchool)">Gateways</button>
    </div>

    <div v-if="activeTab === 'details'">
      <SchoolDetails
        :school="viewSchool"
        :administrators="getAdmins(viewSchool) || []"
        :admin-form="{ username: '', email: '', password: '' }"
        :saving="false"
        :school-portal-url="schoolPortalUrl"
        :payment-settings="null"
        :payment-settings-saving="false"
        :gateway-configs="[]"
        @back="isViewing = false; viewSchool = null; activeTab = 'details'"
        @edit="(school) => { editingSchool.value = school; isViewing = false; viewSchool = null; editModalOpen = true; activeTab = 'details' }"
        @upload-branding="null"
        @start-password-reset="null"
        @cancel-password-reset="null"
        @update-password="null"
        @update-admin-password="null"
        @create-administrator="null"
        @toggle-online-payments="null"
      />
    </div>
    <div v-else-if="activeTab === 'gateways'">
      <SchoolGateways
        :school="viewSchool"
        :gateways="gatewaysList"
        :saving-code="gatewaysSaving"
        @back="activeTab = 'details'"
        @save="handleGatewaySave"
        @toggle-enabled="handleGatewayToggle"
        @validate="null"
      />
    </div>
  </div>

  <!-- Edit / Create School Modal -->
  <SchoolModalComponent
    v-if="editModalOpen || createModalOpen"
    :is-open="editModalOpen || createModalOpen"
    :mode="editingSchool ? 'edit' : 'create'"
    :school="editingSchool || null"
    :school-portal-url="schoolPortalUrl"
    @close="editModalOpen = false; createModalOpen = false; editingSchool = null; saveError = ''"
    @submit="handleSchoolSubmit"
  />
  <div v-if="saveError" class="empty" style="color: var(--danger-color, #dc2626); margin-top: 10px;">{{ saveError }}</div>

  <!-- Add User Modal -->
  <AddUserModal
    v-if="addUserModalOpen"
    :is-open="addUserModalOpen"
    :school="addUserSchool || null"
    @close="addUserModalOpen = false; addUserSchool = null"
    @created="handleAddUserCreated"
  />
</div>`;
