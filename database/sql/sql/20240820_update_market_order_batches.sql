ALTER TABLE market_order_batches
DROP FOREIGN KEY market_order_batches_2;

ALTER TABLE market_order_batches
DROP COLUMN marketProductId;

ALTER TABLE market_order_batches
ADD COLUMN marketOrderProductId int unsigned not null;

ALTER TABLE market_order_batches
ADD CONSTRAINT market_order_batches_2
FOREIGN KEY (marketOrderProductId)
REFERENCES market_order_products(id);

