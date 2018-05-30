const api = require('../lib/api')
const moment = require('moment')
const cfg = require('config')
const mongo = require('../lib/mongo')

exports.badges = (req, res) => {
  mongo.get('wallet').findOne({ userId: req.query.id }, (err, result) => {
    if (err) res.json({ status: 'error', data: 'NO_BADGES' })

    if (result) {
      const badgesId = result.badges.map(b => b.id).join('|')

      api.req({ method: 'GET', url: `/badge/:clientId?id=${badgesId}` }, (error, response, body) => {
        if (error || response.statusCode !== 200 || response.body.length === 0) res.json({ status: 'error', data: 'NO_BADGES' })

        const badges = body.trim().split('\r\n').map(badge => JSON.parse(badge))

        for (let i = 0; i < result.badges.length; i++) {
          for (let j = 0; j < badges.length; j++) {
            if (result.badges[i].id === badges[j].id) {
              badges[j].issued_on = result.badges[i].issuedOn
            }
          }
        }

        res.json({ status: 'success', data: badges })
      })
    } else {
      res.json({ status: 'success', data: 'NO_BADGES' })
    }
  })
}

exports.emit = (req, res) => {
  const badgeId = req.body.badgeId
  const email = req.body.recipient.email
  const name = req.body.recipient.name

  const errors = []
  if (badgeId === undefined || badgeId.length === 0) {
    errors.push('INVALID_BADGE_ID')
  }

  const regexEmail = '/^(([^<>()[].,;:@"]+(.[^<>()[].,;:@"]+)*)|(".+"))@(([^<>()[].,;:@"]+.)+[^<>()[].,;:@"]{2,})$/i'
  if (email === undefined || email.length === 0 || !regexEmail.test(email)) {
    errors.push('INVALID_EMAIL_ADDRESS')
  }

  if (name === undefined || name.length === 0) {
    errors.push('INVALID_RECIPIENT_NAME')
  }

  if (errors.length > 0) {
    res.status(400)
    res.json({ status: 'error', data: errors })
  } else {
    api.req({
      method: 'POST',
      url: `/badge/:clientId/${badgeId}`,
      data: {
        recipient: [ email ],
        issued_on: moment().unix(),
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

      res.json({ status: 'success', data: 'BADGE_EMITTED' })
    })
  }
}
