const path = require('path') 
const express = require('express')
const xss = require('xss')
const ExpensesService = require('./expenses-service')

const expensesRouter = express.Router()
const jsonParser = express.json()

const serializeExpense = expense => ({
    id: expense.id,
    name: xss(expense.name),
    amount: xss(expense.amount),
    date: expense.date,
    budgetId: expenses.budgetId,
    category: expenses.category,
})
expensesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ExpensesService.getAllExpenses(knexInstance)
            .then(expenses => {
                res.json(expenses)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { id, name, amount, date, budgetId, category } = req.body
        const newExpense = { id, name, amount, budgetId, category }

        for(const [key, value] of Object.entries(newExpense))
            if(value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

                newExpense.date = date

                ExpensesService.insertExpense(
                    req.app.get('db'),
                    newExpense
                )
                .then(expense => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${expense.id}`))
                        .json(serializeExpense(expense))
                })
                .catch(next)
    })

    expensesRouter
        .route('/:expenseId')
        .all((req, res, next) => {
            ExpensesService.getById(
                req.app.get('db'),
                req.params.expenseId
            )
            .then(expense => {
                if (!expense) {
                    return res.status(404).json({
                        error: { message: `Expense doesn't exist` }
                    })
                }
                res.expense = expense
                next()
            })
            .catch(next)
        })
        .get((req, res, next) => {
            res.json(serializeExpense(res.expense))
        })
        .delete((req, res, next) => {
            ExpensesService.deleteExpense(
                req.app.get('db'),
                req.params.expenseId
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
        })
        .patch(jsonParser, (req, res, next) => {
            const { name, amount, category } = req.body
            const expenseToUpdate = { name, amount, category }

            const numberOfValues = Object.values(expenseToUpdate).filter(Boolean).length
            if (numberOfValues === 0)
                return res.status(400).json({
                    error: { message: `Request body must contain either 'name', 'amount', 'category'` }
                })
                ExpensesService.updateExpense(
                    req.app.get('db'),
                    req.params.expenseId,
                    expenseToUpdate
                )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        })

        module.exports = expensesRouter



