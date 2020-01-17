const eslintrc = {
  extends: [
    'airbnb-base',
    'plugin:jest/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
    jasmine: true,
    jest: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['markdown', 'jest', '@typescript-eslint'],
  // https://github.com/typescript-eslint/typescript-eslint/issues/46#issuecomment-470486034
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        "camelcase": "off",
        "no-restricted-syntax": "off",
        "prefer-const": "off",
        "no-use-before-define": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "import/extensions": "off",
        "import/prefer-default-export": "off"
      },
    },
  ],
};

module.exports = eslintrc;
