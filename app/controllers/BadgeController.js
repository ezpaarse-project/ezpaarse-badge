const api = require('../api')
const moment = require('moment')
const cfg = require('config')

exports.badges = (req, res) => {
  api.req({ method: 'GET', url: `/event/:clientId?email=${req.body.email}` }, async (error, response, body) => {
    if (error || response.statusCode != 200) res.json({ status: 'error', data: body })

    const badges = body.trim().split('\r\n')

    for (let i = 0; i < badges.length; i++) {
      const badgeId = JSON.parse(badges[i]).badge_id

      badges[i] = await getBadge(badgeId).then((badge) => {
        return { 
          name: badge.name, 
          descr: badge.description, 
          img: badge.image, 
          issued_on: badge.issued_on 
        }
      })
    }
 
		res.json({ status: 'success', data: badges })
	})
}

getBadge = (badgeId) => {
  return new Promise((resolve, reject) => {
    api.req({ method: 'GET', url: `/badge/:clientId/${badgeId}` }, (error, response, body) => {
      if (error) reject(error)

      resolve(JSON.parse(body))
    })
  })
}

exports.emit = (req, res) => {
  const badgeId = req.body.badgeId
  const email = req.body.recipient.email
  const name = req.body.recipient.name

  const errors = []
  if (badgeId == undefined || badgeId.length <= 0) {
    errors.push("INVALID_BADGE_ID")
  }

  const regexEmail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  if (email == undefined || email.length <= 0 || !regexEmail.test(email)) {
    errors.push("INVALID_EMAIL_ADDRESS")
  }

  if (name == undefined || name.length <= 0) {
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