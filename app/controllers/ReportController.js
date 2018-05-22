const api = require('../api')

exports.metrics = (req, res) => {
  api.req({ method: 'GET', url: `/badge/:clientId` }, async (error, response, body) => {
    if (error || response.statusCode != 200) res.json({ status: 'error', data: body })

    const badges = body.trim().split('\r\n')
    const metrics = []
    
    for (let i = 0; i < badges.length; i++) {
      const badge = JSON.parse(badges[i])
      
      const issuers = await getBadge(badge.id).then((b) => {
        if (b == null) {
          return 0
        } else {
          const badgeEvents = b.trim().split('\r\n')

          let issuers = 0;
          for (var i = 0; i < badgeEvents.length; i++) {
            issuers = (issuers + JSON.parse(badgeEvents[i]).recipient.length)
          }

          return issuers
        }
      })

      metrics[i] = { id: badge.id, name: badge.name, issuers, descr: badge.description, img: badge.image }
    }

    res.json(({ status: 'success', data: metrics }))
	})
}

getBadge = (badgeId) => {
  return new Promise((resolve, reject) => {
    api.req({ method: 'GET', url: `/event/:clientId?badge_id=${badgeId}` }, (error, response, body) => {
      if (error) reject(error)

      resolve((body.length > 0) ? body : null)
    })
  })
}