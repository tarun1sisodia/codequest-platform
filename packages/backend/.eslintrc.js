module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    'temp/',
    'jest.config.js',
    '.eslintrc.js'
  ],
  rules: {
    // Disable some rules that are too strict for tests
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    
    // Allow console.log in development and tests
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // Test-specific rules
    '@typescript-eslint/no-empty-function': ['error', { 'allow': ['constructors'] }],
  },
  overrides: [
    {
      // More lenient rules for test files
      files: ['**/*.test.ts', '**/*.spec.ts', '**/test-utils/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
      }
    }
  ]
};