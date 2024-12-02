ALTER TABLE market_products
ADD COLUMN productUnitId int unsigned not null;

ALTER TABLE market_products
ADD CONSTRAINT market_products_7
FOREIGN KEY (productUnitId)
REFERENCES product_units(id);