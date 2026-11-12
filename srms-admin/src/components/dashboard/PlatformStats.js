import template from './PlatformStats.template.js';

export default {
  name: 'PlatformStats',
  props: { statistics: { type: Object, required: true } },
  template,
};
