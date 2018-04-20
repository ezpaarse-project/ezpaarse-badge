
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('assertions', (table) => {
			table.uuid('id').primary()
			table.uuid('badge_id').references('id').inTable('badges').notNull()
			table.string('earner').notNull()
			table.timestamp('issuedOn').notNull()
			table.timestamp('expires'),
			table.uuid('evidence_id').references('id').inTable('evidences')
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('assertions')
	])
}
