module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'Badges',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Badges plateform' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  plugins: [
    '~/plugins/vuetify.js'
  ],
  loading: { color: '#FFFFFF' },
  loadingIndicator: {
    name: 'folding-cube',
    color: '#E10D1A'
  },
  /*
  ** Global CSS
  */
  css: [
    '~/assets/css/main.css',
    'mdi/css/materialdesignicons.min.css',
    'vuetify/dist/vuetify.min.css'
  ],
  /*
  ** Mode
  */
  mode: 'spa',
  /*
  ** Add axios globally
  */
  build: {
    vendor: [
      'axios',
      'vuetify'
    ],
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
