module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    'no-warning-comments': 1,
    'prefer-const': 2,
    'no-var': 2,
    'prefer-arrow-callback': 2,
    'prefer-template': 1,
    'arrow-parens': 0, // allow paren-less arrow functions
    'no-console': 2, // do not allow console.logs
    'no-multi-spaces': [2, {
    exceptions: {
      VariableDeclarator: true,
      ImportDeclaration: true,
      Property: true
      }
    }]
  },
  globals: {}
}
