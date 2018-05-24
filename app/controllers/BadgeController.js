const api = require('../api')
const moment = require('moment')
const cfg = require('config')

exports.badges = (req, res) => {
  api.req({ method: 'GET', url: `/event/:clientId?email=${req.query.email}&order_by=desc` }, async (error, response, body) => {
    if (error || response.statusCode != 200) res.json({ status: 'error', data: body })

    const events = body.trim().split('\r\n').map(v => JSON.parse(v))

    try { 
      const badgeIds = Array.from(new Set(events.map(v => v.badge_id)))
      const badges = await getBadges(badgeIds)

      res.json({ status: 'success', data: badges })
    } catch(err) {
      console.log(err)
    }
  })
}

function getBadges(badgeIds) {
  return new Promise((resolve, reject) => {
    api.req({ method: 'GET', url: `/badge/:clientId?id=${badgeIds.join('|')}` }, (error, response, body) => {
      if (error) reject(error)

      resolve(body.trim().split('\r\n').map(v => JSON.parse(v)))
    })
  })
}

exports.emit = (req, res) => {
  const badgeId = req.body.badgeId
  const email = req.body.recipient.email
  const name = req.body.recipient.name

  const errors = []
  if (badgeId == undefined || badgeId.length == 0) {
    errors.push("INVALID_BADGE_ID")
  }

  const regexEmail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  if (email == undefined || email.length == 0 || !regexEmail.test(email)) {
    errors.push("INVALID_EMAIL_ADDRESS")
  }

  if (name == undefined || name.length == 0) {
    errors.push("INVALID_RECIPIENT_NAME")
  }

  if (errors.length > 0) {
    res.status(400)
    res.json({ status: "error", data: errors })
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
      if (error || response.statusCode != 201) res.json({ status: 'error', data: body.error })
  
      res.json({ status: 'success', data: "Badge emitted" })
    })
  }
}