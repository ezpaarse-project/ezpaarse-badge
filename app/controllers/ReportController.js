const api = require('../lib/api')

exports.metrics = (req, res) => {
  api.req({ method: 'GET', url: `/badge/:clientId` }, async (error, response, body) => {
    if (error || response.statusCode != 200) res.json({ status: 'error', data: body })

    const badges = body.trim().split('\r\n')
    const metrics = []
    
    for (let i = 0; i < badges.length; i++) {
      const badge = JSON.parse(badges[i])
      
      const issues = await getBadge(badge.id).then((b) => {
        if (b == null) {
          return 0
        } else {
          const badgeEvents = b.trim().split('\r\n')

          let count = 0;
          for (var i = 0; i < badgeEvents.length; i++) {
            count = (count + JSON.parse(badgeEvents[i]).recipient.length)
          }

          return count
        }
      })

      metrics[i] = { id: badge.id, name: badge.name, issues, descr: badge.description, img: badge.image }
    }

    const issues = metrics.reduce((acc, m) => {
    	return (((acc.issues != undefined) ? parseInt(acc.issues) : acc) + parseInt(m.issues))
    })

    res.json(({ status: 'success', data: { metrics, issues } }))
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