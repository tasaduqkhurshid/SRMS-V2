import template from './PlatformStatsTemplate.js';

export default {
  name: 'PlatformStats',
  props: { statistics: { type: Object, required: true } },
  template,
};
