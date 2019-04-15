const request = require('request');
const cfg = require('config');
const fs = require('fs');
const path = require('path');

const certificate = path.resolve('app/ssl/certificate.pem');
const privateKey = path.resolve('app/ssl/obf.key');
const client = path.resolve('app/ssl/client');

exports.req = options => new Promise((resolve, reject) => {
  request({
    method: options.method,
    url: `${cfg.urlApi}${options.url.replace(':clientId', fs.readFileSync(client, 'utf-8'))}`,
    json: options.data || null,
    key: fs.readFileSync(privateKey, 'utf-8'),
    cert: fs.readFileSync(certificate, 'utf-8'),
  }, (error, response, body) => {
    if (error) return reject(error);

    return resolve({ response, body });
  });
});
