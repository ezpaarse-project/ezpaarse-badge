const fs = require('fs-extra');
const path = require('path');
const api = require('../../lib/api');
const pkg = require('../../../package.json');

const sslFolder = path.resolve('app', 'ssl');

exports.app = (req, res) => res.json({ name: pkg.name, version: pkg.version });

exports.ping = async (req, res) => {
  let result;
  try {
    const { body } = await api.req({ method: 'GET', url: '/ping/:clientId' });
    result = body;
  } catch (err) {
    return res.json({ status: 'error', data: err });
  }

  if (!result) {
    return res.status(500).json({ status: 'error', data: 'Cannot get customer ID' });
  }

  let clientId;
  try {
    clientId = await fs.readFile(path.resolve(sslFolder, 'client'), 'utf-8');
  } catch (e) {
    return res.json({ status: 'error', data: e });
  }

  if (result !== clientId) {
    return res.status(500).json({ status: 'error', data: 'Customer IDs do not match' });
  }

  return res.json({ status: 'success', data: 'pong' });
};
