const MongoClient = require('mongodb').MongoClient
const mongo = {}

mongo.connect = (url, callback) => {
  if (mongo.db) { return callback(null, mongo.db) }

  MongoClient.connect(url, (err, database) => {
    if (err) { return callback(err) }

    mongo.db = database
    const wallet = database.collection('wallet')

    wallet.createIndex({ userId: 1 }, { unique: true }, (err) => {
      return callback(err, database)
    })
  })
}

mongo.disconnect = (callback) => {
  if (!mongo.db) { return callback(null) }

  mongo.db.close((err) => {
    mongo.db = null
    callback(err)
  })
}

mongo.get = (col) => {
  return (mongo.db ? mongo.db.collection(col) : null)
}

module.exports = mongo
