const api = require('../lib/api')
const moment = require('moment')
const cfg = require('config')
const shortid = require('shortid')
const mongo = require('../lib/mongo')

exports.badges = (req, res) => {
  api.req({ method: 'GET', url: `/badge/:clientId` }, (error, response, body) => {
    if (error || response.statusCode !== 200 || !body) return res.json({ status: 'error', data: 'NO_BADGES' })

    const badges = body.trim().split('\r\n').map(badge => {
      try {
        return JSON.parse(badge)
      } catch (e) {
        return null
      }
    }).filter(badge => badge)

    mongo.get('wallet').findOne({ userId: req.query.id }, async (err, result) => {
      if (err) return res.json({ status: 'error', data: 'NO_BADGES' })

      if (result && result.badges) {
        for (let i = 0; i < result.badges.length; i++) {
          for (let j = 0; j < badges.length; j++) {
            if (result.badges[i].id === badges[j].id) {
              badges[j].issued_on = result.badges[i].issuedOn
              badges[j].licence = result.badges[i].licence
            }
          }
        }
      }

      for (let i = 0; i < badges.length; i++) {
        const badgeInfos = await getBagdeInfos(badges[i].id).then(badgeInfos => {
          return badgeInfos
        })
        badges[i].alt_language = badgeInfos.alt_language
        badges[i].criteria = badgeInfos.criteria
      }

      res.json({ status: 'success', data: badges })
    })
  })
}

function getBagdeInfos (badgeId) {
  return new Promise((resolve, reject) => {
    api.req({ method: 'GET', url: `/badge/_/${badgeId}.json?v=2.0` }, (error, response, body) => {
      if (error) return reject(error)

      resolve((body.length > 0) ? JSON.parse(body) : null)
    })
  })
}

exports.emit = (req, res) => {
  const badgeId = req.body.badgeId
  const userId = req.body.recipient.id
  const email = req.body.recipient.email
  const name = req.body.recipient.name

  const errors = []
  if (!badgeId) {
    errors.push('INVALID_BADGE_ID')
  }

  if (!userId) {
    errors.push('INVALID_USER_ID')
  }

  if (!email) {
    errors.push('INVALID_EMAIL_ADDRESS')
  }

  if (!name) {
    errors.push('INVALID_RECIPIENT_NAME')
  }

  if (errors.length > 0) {
    res.status(400)
    res.json({ status: 'error', data: errors })
  }

  mongo.get('wallet').findOne({ userId }, (err, result) => {
    if (err) return res.json({ status: 'success', data: 'ERROR' })

    const hasBadge = result && result.badges && result.badges.some(badge => badge.id === badgeId)

    if (hasBadge) return res.json({ status: 'success', data: 'BADGE_OWNED' })

    const issuedOn = moment().unix()
    const licence = `${cfg.BADGE_AUTHORITY || 'ANG'}-${shortid.generate()}`.toUpperCase()
    api.req({
      method: 'POST',
      url: `/badge/:clientId/${badgeId}`,
      data: {
        recipient: [ email ],
        issued_on: issuedOn,
        email_subject: cfg.email.subject,
        email_body: cfg.email.body.replace(':recipientName', name),
        email_link_text: cfg.email.button,
        email_footer: cfg.email.footer,
        log_entry: {
          client: cfg.logEntry.client,
          issuer: cfg.logEntry.issuer
        }
      }
    }, (error, response, body) => {
      if (error || response.statusCode !== 201) return res.json({ status: 'error', data: body.error })

      mongo.get('wallet').findOneAndUpdate(
        { userId },
        {
          $push: { badges: { id: badgeId, issuedOn, licence } },
          $set: { lastModified: new Date() }
        },
        { upsert: true },
        (err, result) => {
          if (err) return res.status(500).json({ status: 'error' })

          res.json({ status: 'success', data: 'BADGE_EMITTED' })
        }
      )
    })
  })
}
