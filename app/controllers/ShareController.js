const path    = require('path')
const fs      = require('fs')
const moment  = require('moment')
const mongo   = require('../lib/mongo')
const request = require('request')
const cache   = require('../lib/cache')

exports.embed = async (req, res) => {
  await render(req, res, 'embed')
}

exports.view = async (req, res) => {
  await render(req, res, 'view')
}

async function render (req, res, view) {
  const badges = cache.getCache().badges

  const tmpBadge = badges.find((badge) => {
    return badge.id === req.query.b
  })
  const badge = Object.create(tmpBadge)
  if (badge) badge.issuedOn = 0

  const link = {
    u: req.query.u,
    b: req.query.b,
    l: (!req.query.l || req.query.l === 'fr') ? 'fr' : req.query.l,
    url: req.get('angHost')
  }

  badge.name = (req.query.l === 'fr' || !req.query.l) ? badge.name : (badge.alt_language[req.query.l] ? badge.alt_language[req.query.l].name : badge.name)
  badge.description = (req.query.l === 'fr' || !req.query.l) ? badge.description : (badge.alt_language[req.query.l] ? badge.alt_language[req.query.l].description : badge.description)
  badge.criteria = (req.query.l === 'fr' || !req.query.l) ? badge.criteria : (badge.alt_language[req.query.l] ? badge.alt_language[req.query.l].criteria : badge.criteria)

  const style = {
    css: fs.readFileSync(path.resolve(`public/css/${view}.css`), 'utf-8'),
    img: {
      ang: fs.readFileSync(path.resolve('public/img/ang.png'), 'base64'),
      obf: fs.readFileSync(path.resolve('public/img/obf.png'), 'base64')
    }
  }

  const user = await getTrelloMember(req.query.u).then((result) => {
    const tmp = JSON.parse(result.body)
    return {
      name: tmp.fullName,
      avatar: tmp.avatarUrl ? `<img src="${tmp.avatarUrl}/50.png">` : `<span class="initials">${tmp.initials}</span>`
    }
  }).catch((error) => {
    return error || {
      name: 'N/C',
      avatar: `<span class="initials">N/C</span>`
    }
  })

  mongo.get('wallet').findOne({ userId: req.query.u, 'badges.id': req.query.b }, { 'badges.$': 1 }, (err, result) => {
    if (err) return res.json({ status: 'error', data: 'NO_BADGES' })

    let t = null
    try {
      if (result) {
        badge.issuedOn = moment.unix(result.badges[0].issuedOn).format((!req.query.l || req.query.l === 'fr') ? 'DD/MM/YYYY' : 'YYYY-MM-DD')
      }
      t = JSON.parse(fs.readFileSync(path.resolve(`app/locales/${(!req.query.l || req.query.l === 'fr') ? 'fr' : req.query.l}.json`), 'utf-8'))
    } catch (err) {
      t = JSON.parse(fs.readFileSync(path.resolve(`app/locales/fr.json`), 'utf-8'))
      if (result) {
        badge.issuedOn = moment.unix(result.badges[0].issuedOn).format('DD/MM/YYYY')
      }
    }
    return res.render(`${view}`, { badge, t, link, style, user })
  })
}

function getTrelloMember (userId) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `https://api.trello.com/1/members/${userId}`,
      headers: {
        'User-Agent': 'ezpaarse-badge'
      }
    }
    request(options, (error, responce, body) => {
      if (error) return reject(error)

      return resolve({ responce, body })
    })
  })
}
