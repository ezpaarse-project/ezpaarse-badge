const api = require('../lib/api')
const mongo = require('../lib/mongo')
const cfg = require('config')

exports.metrics = (req, res) => {
  api.req({ method: 'GET', url: `/badge/:clientId` }, async (error, response, body) => {
    if (error || response.statusCode !== 200) return res.json({ status: 'error', data: body })

    const badges = body.trim().split('\r\n')
    const metrics = []

    for (let i = 0; i < badges.length; i++) {
      const badge = JSON.parse(badges[i])

      const issuesOBF = await getBadgeInObf(badge.id).then((b) => {
        if (b == null) return 0

        const badgeEvents = b.trim().split('\r\n')

        let count = 0
        badgeEvents.forEach(event => {
          count = (count + ((JSON.parse(event).log_entry.issuer === cfg.logEntry.issuer) ? JSON.parse(event).recipient.length : 0))
        })
        return count
      })

      metrics[i] = {
        badge: {
          id: badge.id,
          name: badge.name,
          descr: badge.description,
          img: badge.image
        },
        issues: {
          obf: issuesOBF,
          app: await getBadgeInDatabase(badge.id).then(b => b)
        }
      }
    }

    res.json(({ status: 'success', data: { metrics } }))
  })
}

function getBadgeInObf (badgeId) {
  return new Promise((resolve, reject) => {
    api.req({ method: 'GET', url: `/event/:clientId?badge_id=${badgeId}` }, (error, response, body) => {
      if (error) return reject(error)

      resolve((body.length > 0) ? body : null)
    })
  })
}

function getBadgeInDatabase (badgeId) {
  return new Promise((resolve, reject) => {
    mongo.get('wallet').count({ 'badges.id': badgeId }, (err, result) => {
      if (err) reject(err)

      resolve(result)
    })
  })
}
