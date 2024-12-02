-- update table payment
ALTER TABLE payments
ADD COLUMN supplierId int unsigned null;

ALTER TABLE payments
ADD COLUMN inboundId int unsigned null;

ALTER TABLE payments
ADD CONSTRAINT fk_payments_supplier FOREIGN KEY (supplierId)
REFERENCES suppliers(id);

ALTER TABLE payments
ADD CONSTRAINT fk_payments_inbound FOREIGN KEY (inboundId)
REFERENCES inbounds(id);