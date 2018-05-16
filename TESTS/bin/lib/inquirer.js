const inquirer = require('inquirer')

module.exports = {
  obf: () => {
    const questions = [
      {
        name: 'apiKey',
        type: 'input',
        message: 'Enter your API key:',
        validate: (value) => {
          if (value.length) {
            return true
          } else {
            return 'Please enter your API Key.'
          }
        }
      }
    ]
    return inquirer.prompt(questions)
  }
}