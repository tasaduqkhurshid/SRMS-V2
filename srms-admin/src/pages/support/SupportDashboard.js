import template from './SupportDashboard.template.js';

export default {
  name: 'SupportDashboard',
  props: {
    statistics: { type: Object, required: true },
  },
  template,
};
