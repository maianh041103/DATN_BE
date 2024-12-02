ALTER TABLE market_orders
MODIFY COLUMN status ENUM('pending','confirm','processing','send','done','cancel','closed');

ALTER TABLE history_purchase
MODIFY COLUMN status ENUM('pending','confirm','processing','send','done','cancel','closed');

ALTER TABLE history_purchase
ADD COLUMN createdBy int unsigned;

CREATE TABLE delivery(
	id int unsigned not null,
    code nvarchar(20),
    price int unsigned,
    name nvarchar(200),
    startDate datetime,
    endDate datetime
);

ALTER TABLE market_orders
ADD COLUMN note longtext;

ALTER TABLE market_orders
ADD COLUMN wardId int unsigned not null;

ALTER TABLE market_orders
ADD COLUMN districtId int unsigned not null;

ALTER TABLE market_orders
ADD COLUMN provinceId int unsigned not null;