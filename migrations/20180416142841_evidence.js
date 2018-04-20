
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('evidences', (table) => {
			table.uuid('id').primary()
			table.string('name').notNull()
			table.string('data').notNull()
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('evidences')
	])
}
