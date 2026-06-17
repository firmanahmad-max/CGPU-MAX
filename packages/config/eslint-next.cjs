/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    require.resolve('./eslint-base.cjs'),
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'next/core-web-vitals',
  ],
  env: { browser: true, node: true, es2022: true },
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',
  },
};
