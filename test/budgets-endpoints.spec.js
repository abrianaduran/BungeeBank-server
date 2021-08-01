const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeBudgetsArray } = require('./budgets.fixtures')
const { makeExpensesArray } = require('./expenses.fixtures')
const expensesRouter = require('../src/expenses/expenses-router')

describe('Budgets Endpoints', function() {
    let db 

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE budgets, expenses RESTART IDENTITY CASCADE'))

    this.afterEach('cleanup', () => db.raw('TRUNCATE budgets, expenses RESTART IDENTITY CASCADE'))

    describe(`GET /api/budgets`, () => {
        context(`Given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                .get('api/budgets')
                .expect(200, [])
            })
        })

        context('Given there are articles in the database', () => {
            const testExpenses = makeExpensesArray();
            const testBudgets = makeBudgetsArray();

            this.beforeEach('insert Budgets', () => {
                return db
                    .into('budgets')
                    .insert(testBudgets)
                    .then(() => {
                        return db 
                            .into('expenses')
                            .insert(testExpenses)
                    })
            })

            it('responds with 200 and all budgets', () => {
                return supertest(app)
                    .get('api/budgets')
                    .expect(200, testBudgets)
            })
        })
    })
})

describe(`GET /api/budgets/:budgetId`, () => {
    context(`Given no budgets`, () => {
        it(`responds with 404`, () => {
            const budgetId = 12345 
            return supertest(app)
                .get(`/api/budgets/${budgetId}`)
                .expect(404, { error: { message: `Budget doesn't exist` } })
        })
    })

    context('Given there are budgets in the database', () => {
        const testExpenses = makeExpensesArray();
        const testBudgets = makeBudgetsArray(); 

        beforeEach('insert budgets', () => {
            return db 
                .into('budgets')
                .insert(testBudgets)
                .then(() => {
                    return db 
                        .into('expenses')
                        .insert(testExpenses)
                })
        })

        it('responds with 200 and the specified budget', () => {
            const budgetId = 3 
            const expectedBudget = testBudgets[id - 1]
            return supertest(app)
                .get(`api/budgets/${budgetId}`)
                .expect(200, expectedBudget)
        })
    })

    describe(`DELETE /api/budgets/:budgetId`, () => {
        context(`Given no budgets`, () => {
            it(`responds with 404`, () => {
                const budgetId = 12345
                return supertest(app)
                    .delete(`/api/budgets/${budgetId}`)
                    .expect(404, { error: { message: `Budget doesn't exist` } })
            })
        })

        context(`Given there are budgets in the database`, () => {
            const testBudgets = makeBudgetsArray();
            const testExpenses = makeExpensesArray();

            beforeEach('insert budgets', () => {
                return db
                    .into('budgets')
                    .insert(testBudgets)
                    .then(() => {
                        return db
                            .into('expenses')
                            .insert(testExpenses)
                    })
            })

            it('responds with 204 and removes the budget', () => {
                const idToRemove = 3
                const expectedBudgets = testBudgets.filter(budget => budget.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/budgets/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/budgets`)
                        .expect(expectedBudgets)
                        )
            })
        })
    })

    describe(`PATCH /api/budgets/:budgetId`, () => {
        context(`Given no budgets`, () => {
            it(`responds with 404`, () => {
                const budgetId = 12345
                return supertest(app)
                    .delete(`/api/budgets/${budgetId}`)
                    .expect(404, { error: { message: `Budget doesn't exist` } })
            })
        })

        context('Given there are budgets in the database', () => {
            const testBudgets = makeBudgetsArray();
            const testExpenses = makeExpensesArray(); 

            beforeEach('insert budgets', () => {
                return db 
                    .into('budgets')
                    .insert(testBudgets)
                    .then(() => {
                        return db 
                            .into('expenses')
                            .insert(testExpenses)
                    })
            })

            it('responds with 204 and updates the budget', () => {
                const idToUpdate = 3
                const updateBudget = {
                    "id": "1",
                    "name": "Budget-Updated",
                    "date": "2018-2-1",
                    "initbalance": "1234",
                }
                const expectedBudget = {
                    ...testBudgets[idToUpdate - 1],
                    ...updateBudget
                }
                return supertest(app)
                    .patch(`/api/budgets/${idToUpdate}`)
                    .send(updateBudget)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/budgets/${idToUpdate}`)
                        .expect(expectedBudget)
                        )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 3
                return supertest(app)
                    .patch(`/api/budgets/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'id', 'name', 'date', 'initbalance'`
                        }
                    })
            })
        })
    })
})
