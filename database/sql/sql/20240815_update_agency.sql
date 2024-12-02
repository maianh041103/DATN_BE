ALTER TABLE request_agency
DROP FOREIGN KEY request_agency_1;

ALTER TABLE request_agency
DROP FOREIGN KEY request_agency_2;

ALTER TABLE request_agency
CHANGE storeId branchId int unsigned not null;

ALTER TABLE request_agency
ADD CONSTRAINT request_agency_1
FOREIGN KEY (branchId)
REFERENCES branches(id);

ALTER TABLE request_agency
ADD CONSTRAINT request_agency_2
FOREIGN KEY (agencyId)
REFERENCES branches(id);

ALTER TABLE group_agency
DROP FOREIGN KEY group_agency_1;

ALTER TABLE group_agency
CHANGE storeId branchId int unsigned not null;

ALTER TABLE group_agency
ADD CONSTRAINT group_agency_1
FOREIGN KEY (branchId)
REFERENCES branches(id);

ALTER TABLE addresses
ADD COLUMN fullName nvarchar(255);

ALTER TABLE market_orders
ADD COLUMN fullName nvarchar(255);