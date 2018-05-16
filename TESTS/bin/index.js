const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const path = require('path')
const fs = require('fs')
const request = require('request')
const forge = require('node-forge')
const pem = require('pem')
const inquirer = require('./lib/inquirer')

const urlApi = 'https://openbadgefactory.com/v1'

path.basename(path.dirname(fs.realpathSync(__filename)))

if (!fs.existsSync('./certs')){
  fs.mkdirSync('./certs')
}

clear()

console.log(
  chalk.yellow(
    figlet.textSync('OBF Config', { 
      horizontalLayout: 'fitted',
      verticalLayout: 'fitted'
    })
  )
)

const run = async () => {
  const res = await inquirer.obf()
  
  request(`${urlApi}/client/OBF.rsa.pub`, (error, response, body) => {
    if (error) console.log(chalk.red(error))

		const publicKey = forge.pki.publicKeyFromPem(body)
		const apiKeyDecoded = forge.util.decode64(res.apiKey)

		const decrypt = JSON.parse(forge.pki.rsa.decrypt(apiKeyDecoded, publicKey, true))

    pem.createCertificate({ days: 1095, selfSigned: true, subject: decrypt.subject }, (err, keys) => {
      if (err) console.log(chalk.red(err))

      fs.writeFileSync('./certs/obf.csr', keys.csr, { encoding: 'utf8', flag: 'w' })
      fs.writeFileSync('./certs/obf.key', keys.serviceKey, { encoding: 'utf8', flag: 'w' })

      request({
        method: 'POST',
        url: `${urlApi}/client/${decrypt.id}/sign_request`,
        json: {
          signature: res.apiKey,
          request: fs.readFileSync('./certs/obf.csr').toString()
        }
      }, (error, response, body) => {
        if (error || body.error) console.log(chalk.red(error || body.error))

        if (!body.error) fs.writeFileSync('./certs/certificate.pem', body)

        console.log(chalk.yellow("Configuration ended"))
      })
    })
  })
}

run()
