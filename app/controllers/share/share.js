const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');
const request = require('request');
const mongo = require('../../lib/mongo');
const cache = require('../../lib/cache');
const errorHandler = require('../error');
const locales = require('../locales');

function getTrelloMember(userId) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `https://api.trello.com/1/members/${userId}`,
      headers: {
        'User-Agent': 'ezpaarse-badge',
      },
    };
    request(options, (error, responce, body) => {
      if (error) return reject(error);

      return resolve({ responce, body });
    });
  });
}

async function render(req, res, view) {
  const { badges } = cache.get();

  const { uuid } = req.params;
  let { locale } = req.params;
  if (locale !== 'fr' && locale !== 'en') {
    locale = 'fr';
  }

  if (!uuid) {
    return errorHandler(req, res, { message: 'noUUID' });
  }

  let data = null;
  try {
    data = await mongo.get('wallet').findOne({ 'badges.uuid': uuid }, { userId: 1, 'badges.$': 1 });
  } catch (e) {
    return errorHandler(req, res, { message: 'noDataFound' });
  }

  if (!data || !data.badges) {
    return errorHandler(req, res, { message: 'noDataFound' });
  }

  const tmpBadge = badges.find(badge => badge.id === data.badges[0].id);
  let badge = Object.create(tmpBadge);

  if (!badge) {
    return errorHandler(req, res, { message: 'noDataFound' });
  }

  if (locale !== 'fr') {
    const { image } = badge;
    badge = badge.alt_language.en;
    badge.image = image;
  }
  badge.issuedOn = moment.unix(data.badges[0].issuedOn).format((locale === 'fr') ? 'DD/MM/YYYY' : 'YYYY-MM-DD');

  let user = null;
  try {
    const { body } = await getTrelloMember(data.userId);
    user = JSON.parse(body);
  } catch (e) {
    return errorHandler(req, res, { message: 'noUserFound' });
  }

  if (!user) {
    return errorHandler(req, res, { message: 'noUserFound' });
  }

  let css;
  try {
    css = await fs.readFile(path.resolve('public', 'css', `${view}.css`), 'utf-8');
  } catch (err) {
    css = '';
  }

  let ang;
  try {
    ang = await fs.readFile(path.resolve('public', 'img', 'ang.png'), 'base64');
  } catch (err) {
    ang = '';
  }

  let obf;
  try {
    obf = await fs.readFile(path.resolve('public', 'img', 'obf.png'), 'base64');
  } catch (err) {
    obf = '';
  }

  const style = {
    css,
    img: {
      ang,
      obf,
    },
  };

  const url = req.get('angHost') || '';

  return res.render(view, {
    uuid,
    badge,
    locale,
    url,
    user: {
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      initials: user.initials,
    },
    style,
    text: locales[locale],
  });
}

exports.share = (req, res) => {
  const { type } = req.params;
  return render(req, res, type);
};
