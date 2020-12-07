const request = require('request');
const cfg = require('config');
const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

const certificate = path.resolve('app/ssl/certificate.pem');
const privateKey = path.resolve('app/ssl/obf.key');
const client = path.resolve('app/ssl/client');

let clientId;

exports.req = async (options) => {
  if (!clientId) {
    try {
      clientId = await fs.readFile(client, 'utf-8');
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  }

  return new Promise((resolve, reject) => {
    request({
      method: options.method,
      url: `${cfg.urlApi}${options.url.replace(':clientId', clientId)}`,
      json: options.data || null,
      key: fs.readFileSync(privateKey, 'utf-8'),
      cert: fs.readFileSync(certificate, 'utf-8'),
    }, (error, response, body) => {
      if (error) return reject(error);

      return resolve({ response, body });
    });
  });
};
