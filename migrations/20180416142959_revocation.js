
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('revocations', (table) => {
			table.uuid('id').primary()
			table.string('assertion_id').references('id').inTable('assertions').notNull()
			table.string('reason').notNull()
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('revocations')
	])
}
