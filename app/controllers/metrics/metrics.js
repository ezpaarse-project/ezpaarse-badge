const mongo = require('../../lib/mongo');
const cache = require('../../lib/cache');
const logger = require('../../lib/logger');

function getBadgeCount() {
  return mongo.get('wallet').aggregate([
    {
      $unwind: '$badges',
    },
    {
      $group: {
        _id: '$badges.id',
        sum: {
          $sum: 1,
        },
      },
    },
  ]).toArray();
}

function getContributors() {
  return mongo.get('wallet').countDocuments({});
}

exports.metrics = async (req, res) => {
  const { badges } = cache.get();

  let contributors = 0;
  try {
    contributors = await getContributors();
  } catch (err) {
    logger.error(err);
  }

  let aggregationSum = [];
  try {
    aggregationSum = await getBadgeCount();
  } catch (error) {
    logger.error(error);
  }

  const metrics = badges.map((badge) => {
    // eslint-disable-next-line no-underscore-dangle
    const cursor = aggregationSum.find(c => c._id === badge.id);
    return {
      badge,
      issues: {
        app: cursor ? cursor.sum : 0,
      },
    };
  });

  return res.json(({ status: 'success', data: { metrics, contributors } }));
};


exports.metricsCount = async (req, res) => {
  let aggregationSum = [];
  try {
    aggregationSum = await getBadgeCount();
  } catch (error) {
    logger.error(error);
  }

  let count = 0;
  if (aggregationSum.length) {
    count = aggregationSum.reduce((prev, cur) => prev + cur.sum, 0);
  }

  return res.send(`${count}`);
};
