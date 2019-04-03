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

  const uuid = req.params.uuid
  const locale = req.params.locale || 'fr'
  const url = req.get('angHost')
  const text = JSON.parse(fs.readFileSync(path.resolve(`app/locales/${locale}.json`), 'utf-8'))
  const styleError = fs.readFileSync(path.resolve(`public/css/error.css`), 'utf-8')
  const angImage = fs.readFileSync(path.resolve('public/img/ang.png'), 'base64')
  const error = {
    locale,
    url,
    styleError,
    error: 404,
    message: 'error',
    text,
    angImage
  }

  if (!uuid) {
    error.message = 'noUUID'
    return res.status(404).render('error', error)
  }

  try {
    const data = await mongo.get('wallet').findOne({ 'badges.uuid': uuid }, { userId: 1, 'badges.$': 1 })

    if (!data || !data.badges) {
      error.message = 'noDataFound'
      return res.status(404).render('error', error)
    }

    const tmpBadge = badges.find(badge => badge.id === data.badges[0].id)
    let badge = Object.create(tmpBadge)

    if (badge) {
      if (locale !== 'fr') {
        const image = badge.image
        badge = badge.alt_language['en']
        badge.image = image
      }
      badge.issuedOn = moment.unix(data.badges[0].issuedOn).format((locale === 'fr') ? 'DD/MM/YYYY' : 'YYYY-MM-DD')

      const style = {
        css: fs.readFileSync(path.resolve(`public/css/${view}.css`), 'utf-8'),
        img: {
          ang: fs.readFileSync(path.resolve('public/img/ang.png'), 'base64'),
          obf: fs.readFileSync(path.resolve('public/img/obf.png'), 'base64')
        }
      }

      let user = await getTrelloMember(data.userId).then(result => result.body)
      if (!user) {
        error.message = 'noUserFound'
        return res.status(404).render('error', error)
      }
      user = JSON.parse(user)

      return res.render(view, {
        uuid,
        badge,
        locale,
        url,
        styleError,
        user: {
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          styleError,
          initials: user.initials
        },
        style,
        text
      })
    }
  } catch (e) {
    return res.status(404).render('error', error)
  }
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
