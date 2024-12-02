ALTER TABLE `mephar`.`inventories_checking` 
DROP FOREIGN KEY `inventories_checking_ibfk_1`;
ALTER TABLE `mephar`.`inventories_checking` 
DROP COLUMN `difference`,
DROP COLUMN `realQuantity`,
DROP COLUMN `productUnitId`,
DROP INDEX `productUnitId` ;
;

create table inventories_checking_product(
	id int unsigned auto_increment
		primary key,
	inventoryCheckingId int unsigned not null,
	productUnitId int unsigned not null,
	realQuantity int null,
	difference int null,
	constraint inventories_checking_product_ibfk_1
		foreign key (productUnitId) references product_units(id),
	constraint inventories_checking_product_ibfk_2
		foreign key (inventoryCheckingId) references inventories_checking(id)	
)charset=utf8mb3;


ALTER TABLE `mephar`.`inventories_checking_batch` 
DROP FOREIGN KEY `inventories_checking_batch_ibfk_1`;

ALTER TABLE inventories_checking_batch RENAME COLUMN inventoryCheckingId TO inventoryCheckingProductId;

ALTER TABLE inventories_checking_batch
ADD CONSTRAINT inventories_checking_batch_ibfk_1 FOREIGN KEY (inventoryCheckingProductId) REFERENCES inventories_checking_product (id);
