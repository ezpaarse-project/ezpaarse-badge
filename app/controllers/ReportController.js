const mongo   = require('../lib/mongo')
const cache   = require('../lib/cache')

exports.metrics = async (req, res) => {
  const metrics = []

  const badges = cache.getCache().badges

  const contributors = await getContributors().then((res) => {
    return res
  }).catch((error) => {
    return error || 0
  })

  for (let i = 0; i < badges.length; i++) {
    metrics[i] = {
      badge: badges[i],
      issues: {
        app: await getBadgeInDatabase(badges[i].id).then(b => b).catch(error => { return error || 0 })
      }
    }
  }

  res.json(({ status: 'success', data: { metrics, contributors } }))
}

function getBadgeInDatabase (badgeId) {
  return mongo.get('wallet').count({ 'badges.id': badgeId })
}

function getContributors () {
  return mongo.get('wallet').count({})
}
