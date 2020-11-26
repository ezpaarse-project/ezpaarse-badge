const moment = require('moment');
const cfg = require('config');
const shortid = require('shortid');
const api = require('../../lib/api');
const mongo = require('../../lib/mongo');
const cache = require('../../lib/cache');
const logger = require('../../lib/logger');

exports.badges = (req, res) => {
  const { id } = req.query;

  mongo.get('wallet').findOne({ userId: id }, (err, result) => {
    if (err) {
      return res.json({ status: 'error', data: 'NO_BADGES' });
    }

    const { badges } = cache.get();

    if (result && result.badges) {
      // eslint-disable-next-line no-restricted-syntax
      for (const userBadges of result.badges) {
        let badge = badges.find(({ id: badgeId }) => badgeId === userBadges.id);

        if (badge) {
          badge = {
            ...badge,
            issued_on: userBadges.issued_on,
            licence: userBadges.licence,
            uuid: userBadges.uuid,
          };
        }
      }
    }

    const data = { badges };
    if (result) {
      data.visibility = !!(result && result.visibility) || result.visibility;
    }

    return res.json({ status: 'success', data });
  });
};

function getBagdeInfos(badgeId) {
  return new Promise(async (resolve, reject) => {
    let result;
    try {
      const { body } = await api.req({ method: 'GET', url: `/badge/_/${badgeId}.json?v=2.0` });
      result = JSON.parse(body);
    } catch (err) {
      return reject(err);
    }

    return resolve(result);
  });
}

exports.getBadges = () => new Promise(async (resolve, reject) => {
  let result;
  try {
    result = await api.req({ method: 'GET', url: '/badge/:clientId' });
  } catch (err) {
    logger.error(err);
    return reject(err);
  }

  if (!result) {
    return reject(new Error('No result found'));
  }

  const badges = result.body.trim().split('\r\n').map((badge) => {
    try {
      return JSON.parse(badge);
    } catch (e) {
      return null;
    }
  }).filter(badge => badge);

  for (let i = 0; i < badges.length; i += 1) {
    try {
      const { alt_language: altLanguage, criteria } = await getBagdeInfos(badges[i].id);
      badges[i].alt_language = altLanguage;
      badges[i].criteria = criteria;
    } catch (err) {
      logger.error(err);
    }
  }

  return resolve(badges);
});

exports.emit = (req, res) => {
  const { badgeId, recipient } = req.body;
  const { id: userId, email, name } = recipient;

  mongo.get('wallet').findOne({ userId }, (err, result) => {
    if (err) {
      return res.json({ status: 'success', data: 'ERROR' });
    }

    const hasBadge = result && result.badges && result.badges.some(badge => badge.id === badgeId);

    if (hasBadge) {
      return res.json({ status: 'success', data: 'BADGE_OWNED' });
    }

    const issuedOn = moment().unix();
    const licence = `${cfg.authority || 'ANG'}-${shortid.generate()}`.toUpperCase();
    const uuid = shortid.generate().toLowerCase();
    return api.req({
      method: 'POST',
      url: `/badge/:clientId/${badgeId}`,
      data: {
        recipient: [email],
        issued_on: issuedOn,
        email_subject: cfg.email.subject,
        email_body: cfg.email.body.replace(':recipientName', name),
        email_link_text: cfg.email.button,
        email_footer: cfg.email.footer,
        log_entry: {
          client: cfg.logEntry.client,
          issuer: cfg.logEntry.issuer,
        },
      },
    }).then(() => {
      mongo.get('wallet').findOneAndUpdate(
        { userId },
        {
          $push: {
            badges: {
              id: badgeId, issuedOn, licence, uuid,
            },
          },
          $set: { lastModified: new Date() },
        },
        { upsert: true },
        (error) => {
          if (error) return res.status(500).json({ status: 'error' });

          return res.json({ status: 'success', data: 'BADGE_EMITTED' });
        },
      );
    }).catch(error => res.json({ status: 'error', data: error }));
  });
};

exports.users = (req, res) => {
  const { id } = req.query;

  mongo.get('wallet').find({ visibility: true, 'badges.id': id }).toArray((err, result) => {
    if (err || !result) {
      return res.json({ status: 'error', data: 'NO_USERS' });
    }

    const users = [];
    for (let i = 0; i < result.length; i += 1) {
      const { issuedOn } = result[i].badges.find(b => b.id === id);
      users.push({ userId: result[i].userId, issuedOn });
    }

    return res.json({ status: 'success', data: users });
  });
};

exports.visibility = (req, res) => {
  const { userId, visibility } = req.body;

  mongo.get('wallet').findOneAndUpdate(
    { userId },
    {
      $set: { visibility, lastModified: new Date() },
    },
    { upsert: true },
    (err) => {
      if (err) return res.status(500).json({ status: 'error' });

      return res.json({ status: 'success', data: 'VISIBILITY_SET' });
    },
  );
};
