import template from './PlatformSidebarTemplate.js';
import SMSBrand from './SMSBrand.js';

export default {
  name: 'PlatformSidebar',
  components: { SMSBrand },
  props: { currentYear: { type: Number, required: true } },
  emits: ['logout'],
  template,
};
