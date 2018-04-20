import config from 'config'

const knex = {}

knex.client = 'mysql'
knex.connection = {
  host: config.maria.host || 'localhost',
  port: config.maria.port || 3306,
  user: config.maria.user || 'root',
  password: config.maria.password || 'toor',
  database: config.maria.database || 'openbadges'
}

export default knex
