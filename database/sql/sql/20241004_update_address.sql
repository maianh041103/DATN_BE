ALTER TABLE addresses
ADD COLUMN customerId int unsigned;

ALTER TABLE market_orders
ADD COLUMN customerId int;