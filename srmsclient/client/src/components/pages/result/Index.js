import template from './IndexTemplate.js';
const { ref } = Vue;

export default {
  name: 'ResultsIndex',
  template,
  setup() {
    // lightweight placeholder page for results management
    const message = ref('Results UI coming soon.');
    return { message };
  }
};
