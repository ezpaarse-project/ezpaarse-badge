const api = require('../api')

exports.metrics = (req, res) => {
  api.req({ method: 'GET', url: `/event/:clientId` }, (error, response, body) => {
    if (error || response.statusCode != 200) res.json({ status: 'error', data: body })

    const badges = body.trim().split('\r\n')
    badges.map((badge, k) => {
      badges[k] = JSON.parse(badge)
    })

		res.json({ status: 'success', data: badges })
	})
}