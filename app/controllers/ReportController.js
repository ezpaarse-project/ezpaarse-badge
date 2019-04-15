const mongo = require('../lib/mongo');
const cache = require('../lib/cache');

function getBadgeInDatabase(badgeId) {
  return mongo.get('wallet').count({ 'badges.id': badgeId });
}

function getContributors() {
  return mongo.get('wallet').count({});
}


exports.metrics = async (req, res) => {
  const metrics = [];

  const { badges } = cache.getCache();

  const contributors = await getContributors().then(result => result).catch(error => error || 0);

  for (let i = 0; i < badges.length; i += 1) {
    metrics[i] = {
      badge: badges[i],
      issues: {
        app: await getBadgeInDatabase(badges[i].id)
          .then(b => b)
          .catch(error => error || 0),
      },
    };
  }

  res.json(({ status: 'success', data: { metrics, contributors } }));
};
