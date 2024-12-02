ALTER TABLE products
MODIFY COLUMN inventory bigint;

ALTER TABLE inventories
MODIFY COLUMN quantity bigint;

ALTER TABLE batches
MODIFY COLUMN quantity bigint;