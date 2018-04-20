import config from './knexfile'
import knex from 'knex'
import bookshelf from 'bookshelf'

knex(config)
bookshelf(knex)

bookshelf.plugin('virtuals')
bookshelf.plugin('visibility')

knex.migrate.latest()

export default bookshelf
