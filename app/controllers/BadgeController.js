const moment = require('moment');
const cfg = require('config');
const shortid = require('shortid');
const api = require('../lib/api');
const mongo = require('../lib/mongo');
const cache = require('../lib/cache');

exports.badges = (req, res) => {
  mongo.get('wallet').findOne({ userId: req.query.id }, (err, result) => {
    if (err) return res.json({ status: 'error', data: 'NO_BADGES' });

    const cacheBadges = cache.getCache().badges;
    const badges = JSON.parse(JSON.stringify(cacheBadges));

    if (result && result.badges) {
      for (let i = 0; i < result.badges.length; i += 1) {
        for (let j = 0; j < badges.length; j += 1) {
          if (result.badges[i].id === badges[j].id) {
            badges[j].issued_on = result.badges[i].issuedOn;
            badges[j].licence = result.badges[i].licence;
            badges[j].uuid = result.badges[i].uuid;
          }
        }
      }
    }

    const data = { badges };
    if (result) data.visibility = !!(result && result.visibility) || result.visibility;

    return res.json({ status: 'success', data });
  });
};

function getBagdeInfos(badgeId) {
  return api.req({ method: 'GET', url: `/badge/_/${badgeId}.json?v=2.0` });
}

exports.getBadges = (callback) => {
  api.req({ method: 'GET', url: '/badge/:clientId' }).then(async (res) => {
    const badges = res.body.trim().split('\r\n').map((badge) => {
      try {
        return JSON.parse(badge);
      } catch (e) {
        return null;
      }
    }).filter(badge => badge);

    for (let i = 0; i < badges.length; i += 1) {
      const badgeInfos = await getBagdeInfos(badges[i].id)
        .then(result => JSON.parse(result.body))
        .catch(error => error);
      if (badgeInfos) {
        badges[i].alt_language = badgeInfos.alt_language;
        badges[i].criteria = badgeInfos.criteria;
      }
    }

    cache.setCache({ badges });

    return callback();
  }).catch(error => callback(error));
};

exports.emit = (req, res) => {
  const badgeId = req.body.badgeId.trim();
  const userId = req.body.recipient.id.trim();
  const email = req.body.recipient.email.trim();
  const name = req.body.recipient.name.trim();

  const errors = [];
  if (!badgeId) {
    errors.push('INVALID_BADGE_ID');
  }

  if (!userId) {
    errors.push('INVALID_USER_ID');
  }

  if (!email) {
    errors.push('INVALID_EMAIL_ADDRESS');
  }

  if (!name) {
    errors.push('INVALID_RECIPIENT_NAME');
  }

  if (errors.length > 0) {
    res.status(400);
    res.json({ status: 'error', data: errors });
  }

  mongo.get('wallet').findOne({ userId }, (err, result) => {
    if (err) return res.json({ status: 'success', data: 'ERROR' });

    const hasBadge = result && result.badges && result.badges.some(badge => badge.id === badgeId);

    if (hasBadge) return res.json({ status: 'success', data: 'BADGE_OWNED' });

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
  mongo.get('wallet').find({ visibility: true, 'badges.id': req.query.id }).toArray((err, result) => {
    if (err || !result) return res.json({ status: 'error', data: 'NO_USERS' });

    const users = [];
    for (let i = 0; i < result.length; i += 1) {
      const badge = result[i].badges.find(b => b.id === req.query.id);
      users.push({ userId: result[i].userId, issuedOn: badge.issuedOn });
    }

    return res.json({ status: 'success', data: users });
  });
};

exports.visibility = (req, res) => {
  mongo.get('wallet').findOneAndUpdate(
    { userId: req.body.userId },
    {
      $set: { visibility: req.body.visibility, lastModified: new Date() },
    },
    { upsert: true },
    (err) => {
      if (err) return res.status(500).json({ status: 'error' });

      return res.json({ status: 'success', data: 'VISIBILITY_SET' });
    },
  );
};
