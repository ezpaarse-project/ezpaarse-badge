
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('alignments', (table) => {
			table.uuid('id').primary()
			table.string('name').notNull()
			table.string('descr').notNull()
			table.string('url').notNull()
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('alignments')
	])
}
