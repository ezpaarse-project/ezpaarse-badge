const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const path = require('path')
const fs = require('fs')
const request = require('request')
const forge = require('node-forge')
const exec = require('child_process').exec

const urlApi = 'https://openbadgefactory.com/v1'

path.basename(path.dirname(fs.realpathSync(__filename)))

if (!fs.existsSync('./app/ssl')){
  fs.mkdirSync('./app/ssl')
}

clear()

console.log(
  chalk.yellow(
    figlet.textSync('ezPAARSE-Badge Config', { 
      horizontalLayout: 'fitted',
      verticalLayout: 'fitted'
    })
  )
)

const run = async () => {  
  const apiKey = fs.readFileSync('./cert.token', 'utf-8')

  if (apiKey.length > 0) {
    request(`${urlApi}/client/OBF.rsa.pub`, (error, response, body) => {
      if (error) console.log(chalk.red(error))
  
      const publicKey = forge.pki.publicKeyFromPem(body)
      const apiKeyDecoded = forge.util.decode64(apiKey)
  
      const decrypt = JSON.parse(forge.pki.rsa.decrypt(apiKeyDecoded, publicKey, true))
  
      exec(`openssl req -new -nodes -batch -days 1095 -newkey rsa:2048 -keyout ./app/ssl/obf.key -subj '/CN=${decrypt.id}' > ./app/ssl/obf.csr`, (err, stdout, stderr) => {
        if (err) console.log("Error: " + stderr)
  
        request({
          method: 'POST',
          url: `${urlApi}/client/${decrypt.id}/sign_request`,
          json: {
            signature: apiKey,
            request: fs.readFileSync('./app/ssl/obf.csr').toString()
          } 
        }, (error, response, body) => {
          if (error || body.error) console.log(chalk.red(error || body.error))
  
          if (!body.error) fs.writeFileSync('./app/ssl/certificate.pem', body)
  
          request({
            method: 'GET',
            url: `${urlApi}/ping/${decrypt.id}` 
          }, (error, response, body) => {
            if (error || body.error) console.log(chalk.red(error || body.error))
  
            const configFile = fs.readFileSync('./config/default.json', 'utf-8')
            const json = JSON.parse(configFile)
            json.clientId = decrypt.id
            fs.writeFileSync('./config/default.json', JSON.stringify(json, null, 2))
  
            console.log(chalk.yellow("Configuration ended"))
          })
        })
      })
    })
  } else {
    console.log(chalk.red("Please add your certificate signing request token in cert.tokens file !"))
  }
}

run()
