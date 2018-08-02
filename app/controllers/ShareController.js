const path = require('path')
const fs = require('fs')
const moment = require('moment')
const api = require('../lib/api')
const mongo = require('../lib/mongo')

exports.embed = async (req, res) => {
  await getBadgeInfo(req.query.b).then(data => {
    const badge = {
      name: (req.query.l === 'fr' || !req.query.l) ? data.name : data.alt_language[req.query.l].name,
      img: data.image,
      issuedOn: 'N/A'
    }

    const link = {
      u: req.query.u,
      b: req.query.b,
      l: (!req.query.l || req.query.l === 'fr') ? 'fr' : req.query.l
    }

    mongo.get('wallet').findOne({ userId: req.query.u, 'badges.id': req.query.b }, { 'badges.$': 1 }, (err, result) => {
      if (err) return res.json({ status: 'error', data: 'NO_BADGES' })

      if (result) {
        badge.issuedOn = moment.unix(result.badges[0].issuedOn).format((!req.query.l || req.query.l === 'fr') ? 'DD/MM/YYYY' : 'YYYY-MM-DD')
      }

      const t = JSON.parse(fs.readFileSync(path.resolve(`app/locales/${(!req.query.l || req.query.l === 'fr') ? 'fr' : req.query.l}.json`)).toString())
      res.render('embed', { badge, t, link })
    })
  })
}

exports.share = async (req, res) => {
  await getBadgeInfo(req.query.b).then(data => {
    const badge = {
      id: req.query.b,
      name: (req.query.l === 'fr' || !req.query.l) ? data.name : data.alt_language[req.query.l].name,
      img: data.image,
      issuedOn: 'N/A',
      description: (req.query.l === 'fr' || !req.query.l) ? data.description : data.alt_language[req.query.l].description,
      criteria: (req.query.l === 'fr' || !req.query.l) ? data.criteria : data.alt_language[req.query.l].criteria
    }

    const link = {
      u: req.query.u,
      b: req.query.b,
      l: (!req.query.l || req.query.l === 'fr') ? 'fr' : req.query.l,
      url: `${req.protocol}://${req.headers.host}`
    }

    mongo.get('wallet').findOne({ userId: req.query.u, 'badges.id': req.query.b }, { 'badges.$': 1 }, (err, result) => {
      if (err) return res.json({ status: 'error', data: 'NO_BADGES' })

      if (result) {
        badge.issuedOn = moment.unix(result.badges[0].issuedOn).format((!req.query.l || req.query.l === 'fr') ? 'DD/MM/YYYY' : 'YYYY-MM-DD')
      }

      const t = JSON.parse(fs.readFileSync(path.resolve(`app/locales/${(!req.query.l || req.query.l === 'fr') ? 'fr' : req.query.l}.json`)).toString())
      res.render('view', { badge, t, link })
    })
  })
}

function getBadgeInfo (badgeId) {
  return new Promise((resolve, reject) => {
    api.req({ method: 'GET', url: `/badge/_/${badgeId}.json?v=2.0` }, (error, response, body) => {
      if (error) return reject(error)

      resolve((body.length > 0) ? JSON.parse(body) : null)
    })
  })
}
