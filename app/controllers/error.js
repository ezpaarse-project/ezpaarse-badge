const path = require('path');
const fs = require('fs-extra');
const locales = require('./locales');

const styleError = fs.readFileSync(path.resolve('public', 'css', 'error.css'), 'utf-8');

module.exports = (req, res, opts) => {
  const { locale } = req.params;
  const url = req.get('angHost');

  const options = {
    url: url || '',
    locale: locale || 'en',
    statusCode: 404,
    message: 'pageNotFound',
    ...opts,
  };

  return res.status(options.statusCode).render('error', {
    locale: options.locale,
    styleError,
    error: options.statusCode,
    message: options.message,
    text: locales[options.locale],
  });
};
