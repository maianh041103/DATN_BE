ALTER TABLE market_orders
ADD COLUMN phone nvarchar(20);

ALTER TABLE market_products
ADD COLUMN thumbnail integer unsigned null;