ALTER TABLE transactions
ADD COLUMN isPaymentOrder boolean null default false;

-- Thêm cột transactionId là khóa ngoại vào bảng payment
ALTER TABLE payments
ADD COLUMN transactionId int unsigned null;

ALTER TABLE payments
ADD CONSTRAINT fk_transaction_payment
FOREIGN KEY (transactionId)
REFERENCES transactions(id);
