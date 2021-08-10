const path = require('path') 
const express = require('express')
const xss = require('xss')
const ExpensesService = require('./expenses-service')

const expensesRouter = express.Router()
const jsonParser = express.json()

const serializeExpense = expense => ({
    id: expense.id,
    expense_name: xss(expense.expense_name),
    amount: xss(expense.amount),
    date_created: expense.date_created,
    budget_id: expense.budget_id,
    expense_category: expense.expense_category,
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
        const { id, expense_name, amount, date_created, budget_id, expense_category } = req.body
        const newExpense = { id, expense_name, amount, budget_id, expense_category }

        for(const [key, value] of Object.entries(newExpense))
            if(value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

                newExpense.date_created = date_created

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
            const { expense_name, amount, expense_category } = req.body
            const expenseToUpdate = { expense_name, amount, expense_category }

            const numberOfValues = Object.values(expenseToUpdate).filter(Boolean).length
            if (numberOfValues === 0)
                return res.status(400).json({
                    error: { message: `Request body must contain either 'expense_name', 'amount', 'expense_category'` }
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



