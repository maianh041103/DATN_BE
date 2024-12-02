ALTER TABLE orders
ADD COLUMN marketOrderId int;

ALTER TABLE order_products
ADD COLUMN marketOrderProductId int;