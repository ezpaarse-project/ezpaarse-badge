const cfg = require('config');
const { CronJob } = require('cron');
const logger = require('./logger');
const { getBadges } = require('../controllers/badges/badges');

const cache = {
  badges: [],
};

async function onTick() {
  try {
    cache.badges = await getBadges();
    logger.info('Cache is updated');
  } catch (error) {
    logger.error(error);
  }
}

const job = new CronJob({
  cronTime: cfg.cronCache || '0 0 0 * * *',
  onTick,
  runOnInit: true,
});

exports.start = () => {
  if (!cfg.continuousIntegration) {
    logger.info(`Cache is running (${cfg.cronCache})`);
    job.start();
  }
};

exports.get = () => cache;
