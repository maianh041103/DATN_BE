-- update table customer_debts
ALTER TABLE customer_debts
DROP FOREIGN KEY customer_debts_ibfk_1;
ALTER TABLE customer_debts
DROP COLUMN transactionId;


-- update table point_history
ALTER TABLE point_history
ADD COLUMN saleReturnId int unsigned null;

ALTER TABLE point_history
ADD CONSTRAINT point_history_ibfk_3
FOREIGN KEY (saleReturnId) REFERENCES sale_returns(id);

ALTER TABLE point_history
ADD COLUMN code nvarchar(255) null;