import template from './SchoolListTemplate.js';

export default {
  name: 'SchoolList',
  props: {
    loading: { type: Boolean, default: false },
    schools: { type: Array, required: true },
    paginatedSchools: { type: Array, required: true },
    pageStart: { type: Number, required: true },
    pageEnd: { type: Number, required: true },
    currentPage: { type: Number, required: true },
    pageCount: { type: Number, required: true },
    schoolPortalUrl: { type: Function, required: true },
  },
  emits: ['refresh', 'view', 'toggle', 'previous', 'next'],
  template,
};
