ALTER TABle sale_return_item
MODIFY productUnitId int unsigned;

ALTER TABLE sale_return_item
ADD CONSTRAINT fk_sale_return_item
FOREIGN KEY (productUnitId) REFERENCES product_units(id);