const BudgetsService = {
    getAllBudgets(knex) {
        return knex.select('*').from('budgets')
    },
    insertBudget(knex, newBudget) {
        return knex
            .insert(newBudget)
            .into('budgets')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('budgets').select('*').where('id', id).first()
    },
    deleteBudget(knex, id) {
        return knex('budgets')
            .where({ id })
            .delete()
    },
    updateBudgets(knex, id, newBudgetFields) {
        return knex('budgets')
            .where({ id })
            .update(newBudgetFields)
    },
}

module.exports = BudgetsService