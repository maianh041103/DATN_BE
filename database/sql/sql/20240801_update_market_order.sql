ALTER TABLE market_orders
ADD COLUMN toBranchId int unsigned not null;

ALTER TABLE history_purchase
ADD COLUMN note text;

ALTER TABLE market_orders
MODIFY COLUMN status enum('pending','processing','send','done','cancel','closed');

ALTER TABLE history_purchase
MODIFY COLUMN status enum('pending','processing','send','done','cancel','closed');