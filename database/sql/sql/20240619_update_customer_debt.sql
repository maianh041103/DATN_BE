ALTER TABLE customer_debts
ADD transactionId INT UNSIGNED;

ALTER TABLE customer_debts
ADD FOREIGN KEY (transactionId) REFERENCES transactions(id);

-- Update transaction
ALTER TABLE transactions
ADD userId INT UNSIGNED;

ALTER TABLE transactions
ADD FOREIGN KEY (userId) REFERENCES users(id);

ALTER TABLE transactions
MODIFY COLUMN code VARCHAR(15) NULL ;

-- Update user_transactions
ALTER TABLE user_transactions
MODIFY COLUMN phone nvarchar(20) NOT NULL;
