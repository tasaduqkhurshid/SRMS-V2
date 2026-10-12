import { ref } from 'vue';

export default {
  name: 'AddUserModal',
  props: {
    isOpen: { type: Boolean, default: false },
    school: { type: Object, default: null },
  },
  emits: ['close'],
  setup(props, { emit }) {
    function close() {
      emit('close');
    }

    return {
      close,
    };
  },
  template: `
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="add-user-modal-title">
        <header class="modal-header">
          <div>
            <p class="eyebrow">USER MANAGEMENT</p>
            <h2 id="add-user-modal-title">Add User to {{ school?.school_name || 'School' }}</h2>
            <p class="modal-subtitle">User creation will be implemented in a later task.</p>
          </div>
          <button class="modal-close" type="button" @click="close" aria-label="Close modal">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </header>

        <div class="modal-body">
          <div class="placeholder-content">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #9aa4b2; margin-bottom: 16px;">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            <p style="color: #62728a; font-size: 14px; margin: 0 0 8px;">
              This feature is not yet implemented.
            </p>
            <p style="color: #9aa4b2; font-size: 12px; margin: 0;">
              The "Add User" functionality for <strong>{{ school?.school_name || 'this school' }}</strong> will be available in a future release.
            </p>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="primary" @click="close">Close</button>
        </footer>
      </div>
    </div>
  `,
};