import template from './SMSBrandTemplate.js';

export default {
  name: 'SMSBrand',
  props: {
    layout: { type: String, default: 'horizontal' },
    variant: { type: String, default: 'dark' },
    label: { type: String, default: 'SMS School Management System' },
  },
  template,
};
