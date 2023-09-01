/** @type {import('eslint').Config} */
module.exports = {
  root: true,
  plugins: [
    '@programic',
  ],
  extends: [
    'plugin:@programic/typescript',
  ],
  rules: {
    'no-useless-constructor': 'off',
    'unicorn/no-array-push-push': ['error', {
      ignore: ['queue'],
    }],
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
  },
};
