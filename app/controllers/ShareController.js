const path = require('path')
const fs = require('fs')
const moment = require('moment')
const api = require('../lib/api')
const mongo = require('../lib/mongo')

exports.embed = (req, res) => {
  console.log(req.headers['X-Forwarded-For'])
  render(req, res, 'embed')
}

exports.view = (req, res) => {
  render(req, res, 'view')
}

function render (req, res, view) {
  api.req({ method: 'GET', url: `/badge/_/${req.query.b}.json?v=2.0` }, (error, response, body) => {
    if (error) return res.json({ status: 'error', data: 'BADGE_NOT_FOUND' })

    const data = JSON.parse(body)
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

    const style = {
      css: fs.readFileSync(path.resolve(`public/css/${view}.css`), 'utf-8'),
      img: {
        ang: fs.readFileSync(path.resolve('public/img/ang.png'), 'base64'),
        obf: fs.readFileSync(path.resolve('public/img/obf.png'), 'base64')
      }
    }

    mongo.get('wallet').findOne({ userId: req.query.u, 'badges.id': req.query.b }, { 'badges.$': 1 }, (err, result) => {
      if (err) return res.json({ status: 'error', data: 'NO_BADGES' })

      if (result) {
        badge.issuedOn = moment.unix(result.badges[0].issuedOn).format((!req.query.l || req.query.l === 'fr') ? 'DD/MM/YYYY' : 'YYYY-MM-DD')
      }

      const t = JSON.parse(fs.readFileSync(path.resolve(`app/locales/${(!req.query.l || req.query.l === 'fr') ? 'fr' : req.query.l}.json`), 'utf-8'))
      res.render(`${view}`, { badge, t, link, style })
    })
  })
}
