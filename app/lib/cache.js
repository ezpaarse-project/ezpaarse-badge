const cfg = require('config');

const cache = {};

cache.time = (cfg.cacheTime || 24) * 60 * 60 * 1000;

cache.getCache = () => cache.data;

cache.setCache = (data) => {
  cache.date = Date.now();
  cache.data = data;
};

cache.isValid = () => {
  const currentDate = Date.now();
  if (!cache.date) return false;
  if (currentDate - cache.date >= cache.time) return false;
  return true;
};

module.exports = cache;
