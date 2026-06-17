/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [require.resolve('./eslint-base.cjs')],
  env: { node: true, es2022: true },
  rules: {
    // Service/CLI entrypoints legitimately call process.exit() with explicit
    // exit codes in bootstrap and signal-shutdown handlers.
    'no-process-exit': 'off',
  },
};
