const api = require('../lib/api')
const moment = require('moment')
const cfg = require('config')
const mongo = require('../lib/mongo')

exports.badges = (req, res) => {
  api.req({ method: 'GET', url: `/badge/:clientId` }, (error, response, body) => {
    if (error || response.statusCode !== 200 || response.body.length === 0) res.json({ status: 'error', data: 'NO_BADGES' })

    const badges = body.trim().split('\r\n').map(badge => JSON.parse(badge))

    mongo.get('wallet').findOne({ userId: req.query.id }, (err, result) => {
      if (err) res.json({ status: 'error', data: 'NO_BADGES' })

      if (result) {
        for (let i = 0; i < result.badges.length; i++) {
          for (let j = 0; j < badges.length; j++) {
            if (result.badges[i].id === badges[j].id) {
              badges[j].issued_on = result.badges[i].issuedOn
            }
          }
        }
      }

      res.json({ status: 'success', data: badges })
    })
  })
}

exports.emit = (req, res) => {
  const badgeId = req.body.badgeId
  const userId = req.body.recipient.id
  const email = req.body.recipient.email
  const name = req.body.recipient.name

  const errors = []
  if (badgeId === undefined || badgeId.length === 0) {
    errors.push('INVALID_BADGE_ID')
  }

  if (userId === undefined || userId.length === 0) {
    errors.push('INVALID_USER_ID')
  }

  if (email === undefined || email.length === 0) {
    errors.push('INVALID_EMAIL_ADDRESS')
  }

  if (name === undefined || name.length === 0) {
    errors.push('INVALID_RECIPIENT_NAME')
  }

  if (errors.length > 0) {
    res.status(400)
    res.json({ status: 'error', data: errors })
  } else {
    mongo.get('wallet').findOne({ userId }, (err, result) => {
      if (err) return false

      if (result) {
        const found = result.badges.find((badge) => {
          return badge.id === badgeId
        })

        if (found === undefined) {
          const issuedOn = moment().unix()
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
            if (error || response.statusCode !== 201) res.json({ status: 'error', data: body.error })

            mongo.get('wallet').findOneAndUpdate(
              { userId },
              {
                $push: { badges: { id: badgeId, issuedOn } },
                $set: { lastModified: new Date() }
              },
              { upsert: true },
              (err, result) => {
                if (err) throw err

                res.json({ status: 'success', data: 'BADGE_EMITTED' })
              }
            )
          })
        }
      }
    })
  }
}
