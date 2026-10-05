export default `
<div class="school-profile-container">
  <!-- Header -->
  <div class="page-header mb-4">
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h1 class="mb-1">
          <i class="fa-solid fa-landmark me-2"></i>School Profile
        </h1>
        <p class="text-muted mb-0">Manage your school details and information</p>
      </div>
      <button 
        v-if="!loading"
        class="btn"
        :class="editMode ? 'btn-warning' : 'btn-primary'"
        @click="toggleEditMode"
        :disabled="saving"
      >
        <i :class="editMode ? 'fa-solid fa-times me-2' : 'fa-solid fa-pen-to-square me-2'"></i>
        {{ editMode ? 'Cancel' : 'Edit Profile' }}
      </button>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- Success Message -->
  <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
    <i class="fa-solid fa-check-circle me-2"></i>
    <strong>Success!</strong> {{ successMessage }}
    <button type="button" class="btn-close" @click="successMessage = ''"></button>
  </div>

  <!-- Error Message -->
  <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
    <i class="fa-solid fa-exclamation-circle me-2"></i>
    <strong>Error!</strong> {{ errorMessage }}
    <button type="button" class="btn-close" @click="errorMessage = ''"></button>
  </div>

  <!-- Profile Content -->
  <div v-if="!loading" class="row">
    <!-- Logo Section -->
    <div class="col-lg-3 mb-4">
      <div class="card sticky-top" style="top: 20px;">
        <div class="card-body text-center">
          <div class="mb-3">
            <i v-if="!form.logo_url" class="fa-solid fa-school fa-5x text-secondary"></i>
            <img v-else :src="form.logo_url" :alt="form.school_name" class="img-fluid" style="max-height: 180px;">
          </div>
          <h5>{{ form.school_name || 'School Name' }}</h5>
          <p class="text-muted small mb-0">{{ form.abbreviation || 'N/A' }}</p>
          <hr>
          <p class="small text-muted mb-0">
            <i class="fa-solid fa-calendar me-2"></i>Established {{ form.year_established || 'N/A' }}
          </p>
          <p class="small text-muted mb-0">
            <i class="fa-solid fa-graduation-cap me-2"></i>{{ form.board || 'N/A' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Form Section -->
    <div class="col-lg-9">
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">
            <i class="fa-solid fa-info-circle me-2"></i>School Information
          </h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="saveSchoolData">
            <!-- Row 1: School Name & Abbreviation -->
            <div class="row mb-3">
              <div class="col-md-8">
                <label class="form-label"><strong>School Name *</strong></label>
                <input 
                  v-model="form.school_name" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="Enter school name"
                  required
                >
              </div>
              <div class="col-md-4">
                <label class="form-label"><strong>Abbreviation</strong></label>
                <input 
                  v-model="form.abbreviation" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="e.g., XYZ"
                  maxlength="10"
                >
              </div>
            </div>

            <!-- Row 2: Email & Phone -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label"><strong>Email</strong></label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="school@example.com"
                >
              </div>
              <div class="col-md-6">
                <label class="form-label"><strong>Phone</strong></label>
                <input 
                  v-model="form.phone" 
                  type="tel" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="+91-XXXXXXXXXX"
                >
              </div>
            </div>

            <!-- Row 3: Address -->
            <div class="mb-3">
              <label class="form-label"><strong>Address</strong></label>
              <textarea 
                v-model="form.address" 
                class="form-control"
                :readonly="!editMode"
                rows="3"
                placeholder="Enter full address"
              ></textarea>
            </div>

            <!-- Row 4: City, State, Pincode -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="form-label"><strong>City</strong></label>
                <input 
                  v-model="form.city" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="City"
                >
              </div>
              <div class="col-md-4">
                <label class="form-label"><strong>State</strong></label>
                <input 
                  v-model="form.state" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="State"
                >
              </div>
              <div class="col-md-4">
                <label class="form-label"><strong>Pincode</strong></label>
                <input 
                  v-model="form.pincode" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="000000"
                >
              </div>
            </div>

            <hr>

            <!-- ACCORDION: Principal Information -->
            <div class="accordion mb-3" id="accordionPrincipal">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePrincipal" aria-expanded="false" aria-controls="collapsePrincipal">
                    <i class="fa-solid fa-user-tie me-2"></i><strong>Principal Information</strong>
                  </button>
                </h2>
                <div id="collapsePrincipal" class="accordion-collapse collapse" data-bs-parent="#accordionPrincipal">
                  <div class="accordion-body pt-3">
                    <!-- Row 5: Principal Name & Email -->
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label"><strong>Principal Name</strong></label>
                        <input 
                          v-model="form.principal_name" 
                          type="text" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="Enter principal's name"
                        >
                      </div>
                      <div class="col-md-6">
                        <label class="form-label"><strong>Principal Email</strong></label>
                        <input 
                          v-model="form.principal_email" 
                          type="email" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="principal@school.com"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ACCORDION: Additional Information -->
            <div class="accordion mb-3" id="accordionAdditional">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAdditional" aria-expanded="false" aria-controls="collapseAdditional">
                    <i class="fa-solid fa-cog me-2"></i><strong>Additional Information</strong>
                  </button>
                </h2>
                <div id="collapseAdditional" class="accordion-collapse collapse" data-bs-parent="#accordionAdditional">
                  <div class="accordion-body pt-3">
                    <!-- Row 6: Website, Board, Year Established -->
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label"><strong>Website</strong></label>
                        <input 
                          v-model="form.website" 
                          type="url" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="https://www.school.com"
                        >
                      </div>
                      <div class="col-md-3">
                        <label class="form-label"><strong>Board</strong></label>
                        <input 
                          v-model="form.board" 
                          type="text" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="CBSE"
                        >
                      </div>
                      <div class="col-md-3">
                        <label class="form-label"><strong>Year Established</strong></label>
                        <input 
                          v-model.number="form.year_established" 
                          type="number" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="YYYY"
                          min="1900"
                          max="2099"
                        >
                      </div>
                    </div>

                    <!-- Row 7: Logo URL -->
                    <div class="mb-0">
                      <label class="form-label"><strong>Logo URL</strong></label>
                      <input 
                        v-model="form.logo_url" 
                        type="url" 
                        class="form-control"
                        :readonly="!editMode"
                        placeholder="https://example.com/logo.png"
                      >
                      <small class="form-text text-muted">Enter the URL of your school logo</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 justify-content-end mt-4" v-if="editMode">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="resetForm"
                :disabled="saving"
              >
                <i class="fa-solid fa-times me-2"></i>Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-success"
                :disabled="saving"
              >
                <span v-if="!saving">
                  <i class="fa-solid fa-save me-2"></i>Save Changes
                </span>
                <span v-else>
                  <i class="fa-solid fa-spinner fa-spin me-2"></i>Saving...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Additional Details Card - Accordion -->
      <div class="card mt-4">
        <div class="accordion" id="accordionQuickInfo">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseQuickInfo" aria-expanded="true" aria-controls="collapseQuickInfo">
                <i class="fa-solid fa-book me-2"></i><h5 class="mb-0">Quick Info</h5>
              </button>
            </h2>
            <div id="collapseQuickInfo" class="accordion-collapse collapse show" data-bs-parent="#accordionQuickInfo">
              <div class="accordion-body">
                <div class="row text-center">
                  <div class="col-md-4 border-end">
                    <p class="text-muted small mb-2">Founded</p>
                    <h5><i class="fa-solid fa-calendar me-2"></i>{{ form.year_established || '-' }}</h5>
                  </div>
                  <div class="col-md-4 border-end">
                    <p class="text-muted small mb-2">Board</p>
                    <h5><i class="fa-solid fa-graduation-cap me-2"></i>{{ form.board || '-' }}</h5>
                  </div>
                  <div class="col-md-4">
                    <p class="text-muted small mb-2">Principal</p>
                    <h5><i class="fa-solid fa-user-tie me-2"></i>{{ form.principal_name || '-' }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</div>

<style scoped>
.school-profile-container {
  padding: 20px 0;
}

.page-header {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 20px;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-radius: 8px;
}

.card-header {
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0;
}

/* Accordion Styling */
.accordion-button {
  font-weight: 500;
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.accordion-button:not(.collapsed) {
  background-color: #e7f3ff;
  color: #495057;
}

.accordion-button:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}

.accordion-button:hover {
  background-color: #f1f3f5;
}

.accordion-item {
  border: 1px solid #dee2e6;
  margin-bottom: 8px;
  border-radius: 6px;
}

.accordion-item:first-child {
  border-radius: 6px;
}

.accordion-item:last-child {
  margin-bottom: 0;
}

.accordion-body {
  padding: 1.5rem;
  background-color: #ffffff;
}

input[readonly], textarea[readonly] {
  background-color: #f8f9fa !important;
  cursor: not-allowed;
}

.form-label {
  color: #495057;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

/* Reduce spacing for compact layout */
.py-2 {
  padding-top: 0.4rem !important;
  padding-bottom: 0.4rem !important;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .col-lg-3, .col-lg-9 {
    width: 100%;
  }

  .sticky-top {
    position: static !important;
  }

  .card-body {
    padding: 1rem;
  }

  .accordion-body {
    padding: 1rem;
  }

  .row.text-center > div {
    border-right: none !important;
    margin-bottom: 1rem;
  }
}

/* Compact form vertical spacing */
.accordion-body .row:not(:last-child) {
  margin-bottom: 1rem;
}

/* Highlight active section */
.accordion .accordion-button:not(.collapsed) {
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.125);
}
</style>
`
