CREATE TABLE budgets(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    budget_name TEXT NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL,
    initial_balance INTEGER NOT NULL);


CREATE TYPE category AS ENUM (
    'fixed', 
    'health', 
    'transportation', 
    'debt', 
    'food', 
    'personal', 
    'entertainment', 
    'dependents', 
    'savings'
);

CREATE TABLE expenses (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    expense_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL);


--alter notes table to add foreign key
ALTER TABLE expenses
ADD COLUMN 
    expense_category category;
ALTER TABLE expenses
ADD COLUMN
    budget_id INTEGER 
        REFERENCES budgets(id) ON DELETE CASCADE NOT NULL;