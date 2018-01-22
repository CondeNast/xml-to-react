module.exports = {
  extends: [
    'airbnb'
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    jest: true,
  },
  plugins: [
    'jsdoc'
  ],
  rules: {
    /**
     * All available rules are enabled to 'error' by default to encourage more
     * thorough and accurate documentation
     * @see https://github.com/gajus/eslint-plugin-jsdoc#eslint-plugin-jsdoc-rules
     */
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/check-types': 'error',
    'jsdoc/newline-after-description': 'error',

    /**
     * At present, we are not imposing the "description-complete-sentence" rule
     * as it will result in a very large number of warnings across all repos.
     * @see https://github.com/gajus/eslint-plugin-jsdoc#eslint-plugin-jsdoc-rules-require-description-complete-sentence
     */
    'jsdoc/require-description-complete-sentence': 'off',
    'jsdoc/require-hyphen-before-param-description': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/require-returns-type': 'error'
  },
  settings: {
    jsdoc: {
      tagNamePreference: {
        augments: 'extends',
        return: 'returns'
      }
    }
  }
};
