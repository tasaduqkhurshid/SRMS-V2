const template = `
<div v-if="visible" class="srms-modal-backdrop">
  <div class="srms-modal">
    <div class="srms-modal-header">Confirm</div>
    <div class="srms-modal-body">
      <div v-html="message"></div>
    </div>
    <div class="srms-modal-footer">
      <button class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
      <button class="btn btn-primary" @click="$emit('confirm')">Confirm</button>
    </div>
  </div>
</div>
`

export default {
  name: 'ModalConfirm',
  template,
  props: {
    message: { type: String, default: 'Are you sure?' },
    visible: { type: Boolean, default: false }
  },
  emits: ['confirm','cancel'],
  setup(props, { emit }) {
    // no special logic — parent controls visibility
    return {}
  }
}
