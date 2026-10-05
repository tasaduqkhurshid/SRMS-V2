/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['expo'],
  ignorePatterns: ['node_modules/', 'dist/'],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
