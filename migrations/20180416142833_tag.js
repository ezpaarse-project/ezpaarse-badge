
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('tags', (table) => {
			table.uuid('id').primary()
			table.string('text').notNull()
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('tags')
	])
}
