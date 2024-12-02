ALTER TABLE request_agency
RENAME COLUMN branchId TO storeId;

ALTER TABLE request_agency
DROP CONSTRAINT request_agency_1;

ALTER TABLE request_agency
DROP CONSTRAINT request_agency_2;

ALTER TABLE request_agency
ADD CONSTRAINT request_agency_1 FOREIGN KEY (storeId) REFERENCES stores(id);

ALTER TABLE request_agency
ADD CONSTRAINT request_agency_2 FOREIGN KEY (agencyId) REFERENCES stores(id);

ALTER TABLE group_agency
RENAME COLUMN branchId TO storeId;

ALTER TABLE group_agency
DROP CONSTRAINT group_agency_1;

ALTER TABLE group_agency
ADD CONSTRAINT group_agency_1 FOREIGN KEY (storeId) REFERENCES stores(id);

ALTER TABLE market_products
DROP CONSTRAINT market_products_6;

ALTER TABLE market_products
DROP COLUMN branchId;

ALTER TABLE branches
DROP COLUMN isAgency;

ALTER TABLE stores
ADD COLUMN isAgency boolean default 0;

ALTER TABLE addresses
RENAME COLUMN branchId TO storeId;

ALTER TABLE carts
RENAME COLUMN branchId TO storeId;

ALTER TABLE carts
ADD CONSTRAINT carts_1 FOREIGN KEY (storeId) REFERENCES stores(id);

ALTER TABLE customers
ADD COLUMN customerStoreId int unsigned null;

ALTER TABLE market_orders
RENAME COLUMN branchId TO storeId;

ALTER TABLE market_orders
RENAME COLUMN toBranchId TO toStoreId;

ALTER TABLE market_orders
ADD COLUMN toBranchId int unsigned null;

ALTER TABLE seri
RENAME COLUMN branchId TO storeId;