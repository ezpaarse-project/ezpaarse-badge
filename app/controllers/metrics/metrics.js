const mongo = require('../../lib/mongo');
const cache = require('../../lib/cache');
const logger = require('../../lib/logger');

function getBadgeInDatabase(badgeId) {
  return mongo.get('wallet').count({ 'badges.id': badgeId });
}

function getContributors() {
  return mongo.get('wallet').count({});
}

exports.metrics = async (req, res) => {
  const metrics = [];

  const { badges } = cache.get();

  let contributors = 0;
  try {
    contributors = await getContributors();
  } catch (err) {
    logger.error(err);
  }

  for (let i = 0; i < badges.length; i += 1) {
    let app = 0;
    try {
      app = await getBadgeInDatabase(badges[i].id);
    } catch (error) {
      logger.error(error);
    }

    metrics[i] = {
      badge: badges[i],
      issues: { app },
    };
  }

  return res.json(({ status: 'success', data: { metrics, contributors } }));
};


exports.metricsCount = async (req, res) => {
  const { badges } = cache.get();

  let count = 0;
  for (let i = 0; i < badges.length; i += 1) {
    try {
      const result = await getBadgeInDatabase(badges[i].id);
      count += result;
    } catch (err) {
      logger.error(err);
    }
  }

  return res.send(`${count}`);
};
