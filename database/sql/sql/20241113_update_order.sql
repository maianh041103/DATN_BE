ALTER TABLE market_orders
ADD COLUMN discountItemId int;

ALTER TABLE market_order_products
ADD COLUMN discountItemId int;