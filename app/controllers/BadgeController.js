const api = require('../api')

exports.badges = (req, res) => {
  api.req({ method: 'GET', url: `/event/:clientId?email=${req.body.email}` }, (error, response, body) => {
    if (error || response.statusCode != 200) res.json({ status: 'error', data: body })

    const badges = []
    body.trim().split('\r\n').map((v, k) => {
      const badgeId = JSON.parse(v).badge_id

      getBadge(badgeId).then((badge) => {
        badges.push({ name: badge.name })
      })
    })

		res.json({ status: 'success', data: badges })
	})
}

getBadge = (badgeId) => {
  return new Promise((resolve, reject) => {
    api.req({ method: 'GET', url: `/badge/:clientId/${badgeId}` }, (error, response, body) => {
      resolve(JSON.parse(body))
    })
  })
}