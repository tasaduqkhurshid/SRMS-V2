export default `<div v-if="isOpen" class="modal-overlay">
  <div class="modal-container" role="dialog" aria-modal="true" :aria-labelledby="mode === 'create' ? 'modal-title-create' : 'modal-title-edit'">
    <header class="modal-header">
      <div>
        <p class="eyebrow" id="modal-title-create" v-if="mode === 'create'">SCHOOL DIRECTORY</p>
        <p class="eyebrow" id="modal-title-edit" v-else>SCHOOL DIRECTORY</p>
        <h2 v-if="mode === 'create'">Add School</h2>
        <h2 v-else>Edit School</h2>
        <p class="modal-subtitle" v-if="mode === 'create'">Create a new school entry with branding</p>
        <p class="modal-subtitle" v-else>Update school details and branding</p>
      </div>
      <button class="modal-close" type="button" @click="$emit('close')" aria-label="Close modal">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    </header>

    <div class="modal-body" :class="{ 'has-errors': errorMessage }">
      <form class="school-form-modal" @submit.prevent="handleSubmit">
        <div class="modal-grid">
          <!-- Left Column: School Information -->
          <div class="modal-col">
            <fieldset class="form-section">
              <legend>School Information</legend>
              <div class="form-fields">
                <div class="form-field full-width">
                  <span class="form-label">School name <span class="required">*</span></span>
                  <input v-model.trim="form.school_name" :disabled="submitting" required autocomplete="off" placeholder="School name" class="form-input" />
                </div>
                <div class="form-field">
                  <span class="form-label">School code <span class="required">*</span></span>
                  <input v-model.trim="form.school_code" :disabled="submitting || mode === 'edit'" required pattern="[A-Z0-9]+" placeholder="HFS" autocomplete="off" class="form-input" />
                  <small class="field-hint" v-if="mode === 'create'">Uppercase letters and numbers only</small>
                  <small class="field-hint" v-else>School code cannot be changed after creation</small>
                </div>
                <div class="form-field" v-if="mode === 'create'">
                  <span class="form-label">Hostname slug <span class="required">*</span></span>
                  <input v-model.trim="form.slug" :disabled="submitting" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="hanfia" autocomplete="off" class="form-input" />
                  <small class="field-hint">Lowercase letters, numbers, and hyphens only</small>
                </div>
                <div class="form-field" v-else>
                  <span class="form-label">Hostname slug</span>
                  <code class="slug-display">{{ form.slug }}</code>
                  <small class="field-hint">Slug cannot be changed after creation</small>
                </div>
                <div class="form-field">
                  <span class="form-label">Email</span>
                  <input v-model.trim="form.email" type="email" :disabled="submitting" placeholder="office@school.edu" autocomplete="email" class="form-input" />
                </div>
                <div class="form-field" v-if="mode === 'edit'">
                  <span class="form-label">Status</span>
                  <select v-model="form.status" :disabled="submitting" class="form-select">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div class="form-field full-width">
                  <span class="form-label">Welcome tagline <span class="required">*</span></span>
                  <textarea v-model.trim="form.tagline" :disabled="submitting" maxlength="120" rows="3" :placeholder="mode === 'create' ? 'A place to learn, grow, and succeed.' : ''" class="form-textarea"></textarea>
                  <small class="field-hint">Maximum 120 characters</small>
                </div>
              </div>
            </fieldset>
          </div>

          <!-- Right Column: School Branding -->
          <div class="modal-col">
            <fieldset class="form-section">
              <legend>School Branding</legend>
              <p class="muted branding-hint">JPEG, PNG, or WebP up to 5 MB. Images load privately through the school portal.</p>

              <!-- School Logo Upload -->
              <div class="image-upload-section">
                <div class="upload-header">
                  <h4>School Logo</h4>
                  <span class="upload-status-badge" :class="logoUploadState" v-if="logoUploadState !== 'empty'">
                    {{ logoUploadStateLabel }}
                  </span>
                </div>
                <div class="upload-preview-area">
                  <!-- Preview for existing logo -->
                  <div v-if="logoPreviewUrl && logoUploadState !== 'selected'" class="image-preview existing">
                    <img :src="logoPreviewUrl" alt="Current school logo" />
                    <div class="preview-actions">
                      <button type="button" class="secondary small" @click="removeLogoSelection" v-if="logoUploadState === 'existing'">Remove</button>
                      <button type="button" class="secondary small" @click="replaceLogo" v-if="logoUploadState === 'existing'">Replace</button>
                      <button type="button" class="secondary small" @click="retryLogoUpload" v-if="logoUploadState === 'error'">Retry</button>
                    </div>
                    <span class="preview-label" v-if="logoUploadState === 'existing'">Current logo</span>
                    <span class="preview-label uploading" v-if="logoUploadState === 'uploading'">Uploading…</span>
                    <span class="preview-label uploaded" v-if="logoUploadState === 'uploaded'">Uploaded</span>
                    <span class="preview-label error" v-if="logoUploadState === 'error'">Upload failed</span>
                  </div>

                  <!-- Preview for newly selected logo -->
                  <div v-else-if="logoPreviewUrl && logoUploadState === 'selected'" class="image-preview selected">
                    <img :src="logoPreviewUrl" alt="Selected logo preview" />
                    <div class="preview-actions">
                      <button type="button" class="secondary small" @click="removeLogoSelection">Remove</button>
                      <button type="button" class="primary small" @click="uploadLogo" :disabled="logoUploadState === 'uploading'">
                        <span v-if="logoUploadState === 'uploading'">Uploading…</span>
                        <span v-else>Upload</span>
                      </button>
                    </div>
                    <span class="preview-label">Ready to upload</span>
                  </div>

                  <!-- Empty state / file picker -->
                  <div v-else class="image-preview empty" @click="$refs.logoInput?.click()">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" /><path d="M17 11l-5 5-5-5" /><path d="M12 2v12" /></svg>
                    <span>Click to select logo</span>
                    <small>JPEG, PNG, or WebP · Max 5 MB</small>
                    <input ref="logoInput" type="file" accept="image/jpeg,image/png,image/webp" @change="onLogoSelect" class="file-input" :disabled="logoUploadState === 'uploading'" />
                  </div>
                </div>
                <p v-if="logoUploadState === 'error' && logoUploadError" class="upload-error">{{ logoUploadError }}</p>
              </div>

              <!-- Welcome Image Upload -->
              <div class="image-upload-section">
                <div class="upload-header">
                  <h4>Welcome Page Image</h4>
                  <span class="upload-status-badge" :class="welcomeUploadState" v-if="welcomeUploadState !== 'empty'">
                    {{ welcomeUploadStateLabel }}
                  </span>
                </div>
                <div class="upload-preview-area">
                  <!-- Preview for existing welcome image -->
                  <div v-if="welcomePreviewUrl && welcomeUploadState !== 'selected'" class="image-preview existing">
                    <img :src="welcomePreviewUrl" alt="Current welcome image" />
                    <div class="preview-actions">
                      <button type="button" class="secondary small" @click="removeWelcomeSelection" v-if="welcomeUploadState === 'existing'">Remove</button>
                      <button type="button" class="secondary small" @click="replaceWelcome" v-if="welcomeUploadState === 'existing'">Replace</button>
                      <button type="button" class="secondary small" @click="retryWelcomeUpload" v-if="welcomeUploadState === 'error'">Retry</button>
                    </div>
                    <span class="preview-label" v-if="welcomeUploadState === 'existing'">Current welcome image</span>
                    <span class="preview-label uploading" v-if="welcomeUploadState === 'uploading'">Uploading…</span>
                    <span class="preview-label uploaded" v-if="welcomeUploadState === 'uploaded'">Uploaded</span>
                    <span class="preview-label error" v-if="welcomeUploadState === 'error'">Upload failed</span>
                  </div>

                  <!-- Preview for newly selected welcome image -->
                  <div v-else-if="welcomePreviewUrl && welcomeUploadState === 'selected'" class="image-preview selected">
                    <img :src="welcomePreviewUrl" alt="Selected welcome image preview" />
                    <div class="preview-actions">
                      <button type="button" class="secondary small" @click="removeWelcomeSelection">Remove</button>
                      <button type="button" class="primary small" @click="uploadWelcome" :disabled="welcomeUploadState === 'uploading'">
                        <span v-if="welcomeUploadState === 'uploading'">Uploading…</span>
                        <span v-else>Upload</span>
                      </button>
                    </div>
                    <span class="preview-label">Ready to upload</span>
                  </div>

                  <!-- Empty state / file picker -->
                  <div v-else class="image-preview empty" @click="$refs.welcomeInput?.click()">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" /><path d="M17 11l-5 5-5-5" /><path d="M12 2v12" /></svg>
                    <span>Click to select welcome image</span>
                    <small>JPEG, PNG, or WebP · Max 5 MB · Recommended 1920×600</small>
                    <input ref="welcomeInput" type="file" accept="image/jpeg,image/png,image/webp" @change="onWelcomeSelect" class="file-input" :disabled="welcomeUploadState === 'uploading'" />
                  </div>
                </div>
                <p v-if="welcomeUploadState === 'error' && welcomeUploadError" class="upload-error">{{ welcomeUploadError }}</p>
              </div>

              <!-- School Address -->
              <div class="form-field full-width">
                <span class="form-label">Address</span>
                <input v-model.trim="form.address" :disabled="submitting" placeholder="School address" autocomplete="street-address" class="form-input" />
              </div>
            </fieldset>
          </div>
        </div>

        <!-- Welcome Description - Full Width -->
        <fieldset class="form-section full-width">
          <legend>Welcome Description</legend>
          <div class="form-field full-width">
            <span class="form-label">Welcome description <span class="required">*</span></span>
            <textarea v-model.trim="form.description" :disabled="submitting" maxlength="500" rows="4" placeholder="A welcoming place to support learning, academic progress, and student success." class="form-textarea"></textarea>
            <small class="field-hint">Maximum 500 characters</small>
          </div>
        </fieldset>

        <!-- Validation/Blocking Messages -->
        <div v-if="showUploadBlockingMessage" class="blocking-message">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
          <span>{{ blockingMessage }}</span>
        </div>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="secondary" @click="$emit('cancel')" :disabled="submitting">Cancel</button>
          <button type="submit" class="primary" :disabled="submitDisabled">
            <span v-if="submitting">{{ mode === 'create' ? 'Creating…' : 'Saving…' }}</span>
            <span v-else>{{ mode === 'create' ? 'Create School' : 'Update School' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</div>`;