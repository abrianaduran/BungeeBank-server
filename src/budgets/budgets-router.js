const path = require('path')
const express = require('express')
const xss = require('xss')
const BudgetsService = require('./budgets-service')

const budgetsRouter = express.Router()
const jsonParser = express.json()

budgetsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BudgetsService.getAllBudgets(knexInstance)
            .then(budgets => {
                res.json(budgets)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { id, budget_name, date_created, initial_balance } = req.body
        const newBudget = { budget_name, initial_balance }

        for(const [key, value] of Object.entries(newBudget))
            if(value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

                newBudget.date_created = date_created
                newBudget.id = id

                BudgetsService.insertBudget(
                    req.app.get('db'),
                    newBudget
                )
                .then(budget => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${budget.id}`))
                        .json(budget)
                })
                .catch(next)
    })

budgetsRouter
    .route('/:budgetId')
    .all((req, res, next) => {
        BudgetsService.getById(
            req.app.get('db'),
            req.params.budgetId
        )
            .then(budget => {
                if (!budget) {
                    return res.status(404).json({
                        error: { message: `Budget doesn't exist` }
                    })
                }
                res.budget = budget
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.budget.id,
            budget_name: xss(res.budget.budget_name),
            date_created: res.budget.date_created,
            initial_balance: xss(res.budget.initial_balance),
        })
    })
    .delete((req, res, next) => {
        BudgetsService.deleteBudget(
            req.app.get('db'),
            req.params.budgetId
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { budget_name, initial_balance } = req.body
        const budgetToUpdate = { budget_name, initial_balance }
        const numberOfValues = Object.values(budgetToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'budget_name', 'initial_balance'`
                }
            })
        }
        BudgetsService.updateBudget(
            req.app.get('db'),
            req.params.budgetId,
            budgetToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    module.exports = budgetsRouter