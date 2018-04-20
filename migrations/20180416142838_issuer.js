
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('issuers', (table) => {
			table.uuid('id').primary()
			table.string('name').notNull()
			table.string('descr')
			table.string('img')
			table.string('email').notNull()
			table.string('url').notNull()
			// table.string('revocation')
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('tags')
	])
}
