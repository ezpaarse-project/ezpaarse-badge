const { MongoClient } = require('mongodb');

const mongo = {};

mongo.connect = (url, callback) => {
  if (mongo.db) { return callback(null, mongo.db); }

  return MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, (err, client) => {
    if (err) { return callback(err); }

    mongo.db = client.db();
    const wallet = mongo.db.collection('wallet');

    return wallet.createIndex({ userId: 1 }, { unique: true }, error => callback(error, mongo.db));
  });
};

mongo.disconnect = (callback) => {
  if (!mongo.db) { return callback(null); }

  return mongo.db.close((err) => {
    mongo.db = null;
    callback(err);
  });
};

mongo.get = col => (mongo.db ? mongo.db.collection(col) : null);

module.exports = mongo;
