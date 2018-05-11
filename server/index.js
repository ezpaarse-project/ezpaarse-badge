import express from 'express'
import { Nuxt, Builder } from 'nuxt'

import api from './api'
import obf from './obf'

import cfg from 'config'
import config from '../nuxt.config.js'

process.env.PORT = cfg.port

const app = express()
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

app.set('port', port)

// Import API Routes
app.use('/api', api)
app.use('/obf', obf)

// Import and Set Nuxt.js options
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

// Give nuxt middleware to express
app.use(nuxt.render)

// Listen the server
app.listen(port, host)
console.log(`Server listening on ${host}:${port}`) // eslint-disable-line no-console
