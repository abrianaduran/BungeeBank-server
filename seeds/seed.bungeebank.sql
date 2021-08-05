INSERT INTO budgets (id, budget_name, date_created, initial_balance)
VALUES 
('1', 'School Supplies', '08/02/2020', '199.99'),
('2', 'Groceries', '01/10/2021', '400.02'),
('3', 'Clothes', '12/18/2020', '411.12');

INSERT INTO expenses (id, expense_name, amount, date_created, category, budget_id)
VALUES
('1', 'pens', '2.30', '08/02/2020', 'personal', '1'),
('2', 'pencils', '4.99', '08/03/2020', 'personal', '1'),
('3', 'paper', '6.99', '08/02/2020', 'personal', '1'),
('4', 'apples', '7.50', '01/10/2021', 'food', '2'),
('5', 'watermelon', '5.00', '01/10/2021', 'food', '2'),
('6', 'onions', '8.52', '01/10/2021', 'food', '2'),
('7', 'toothbrush', '3.99', '01/10/2021', 'personal', '2'),
('8', 't-shirt', '18.89', '12/19/2020', 'personal', '3'),
('9', 'shorts', '16.78', '12/17/2020', 'personal', '3'), 
('10', 'pants', '29.99', '12/20/2020', 'personal', '3'),
('11', 'shoes', '35.75', '12/22/2020', 'personal', '3');