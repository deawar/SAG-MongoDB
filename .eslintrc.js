module.exports = {
  env: {
    browser: true,
    es2021: true,  // This replaces 'modules: true' and includes ES module support
    node: true,    // Added for Node.js environment
    jquery: true,  // Kept for jQuery support
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,    // Updated to match your needs
    sourceType: 'module', // Added to explicitly support ES modules
  },
  rules: {
    // You can add custom rules here
    'import/extensions': ['error', 'ignorePackages'], // Added to help with ES modules
  },
};
