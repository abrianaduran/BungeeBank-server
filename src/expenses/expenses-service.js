const ExpensesService = {
    getAllExpenses(knex) {
        return knex.select('*').from('expenses')
    },
    insertExpense(knex, newExpense) {
        return knex
            .insert(newExpense)
            .into('expenses')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('expenses').select('*').where('id', id).first()
    },
    deleteExpense(knex, id) {
        return knex('expenses')
            .where({ id })
            .delete()
    },
    updateExpense(knex, id, newExpenseFields) {
        return knex('expenses')
            .where({ id })
            .update(newExpenseFields)
    },
}

module.exports = ExpensesService