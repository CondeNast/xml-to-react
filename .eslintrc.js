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
    mocha: true,
    browser: true,
    node: true,
    es6: true
  }
};
