
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('badges', (table) => {
			table.uuid('id').primary()
			table.string('name').notNull()
			table.string('descr').notNull()
			table.string('img').notNull()
			table.string('criteria').notNull()
			table.uuid('alignment_id').references('id').inTable('alignments')
			table.uuid('issuer_id').references('id').inTable('issuers').notNull()
			// tags
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('badges')
	])
}
