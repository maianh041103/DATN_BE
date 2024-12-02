ALTER TABLE branches
ADD COLUMN isAgency bool default false;

ALTER TABLE addresses
DROP FOREIGN KEY addresses_1;
ALTER TABLE addresses
MODIFY COLUMN wardId SMALLINT UNSIGNED NULL ;
ALTER TABLE addresses
ADD CONSTRAINT addresses_1
FOREIGN KEY (wardId) REFERENCES wards(id);

ALTER TABLE addresses
DROP FOREIGN KEY addresses_2;
ALTER TABLE addresses
MODIFY COLUMN districtId SMALLINT UNSIGNED NULL ;
ALTER TABLE addresses
ADD CONSTRAINT addresses_2
FOREIGN KEY (districtId) REFERENCES districts(id);

ALTER TABLE addresses
DROP FOREIGN KEY addresses_3;
ALTER TABLE addresses
MODIFY COLUMN provinceId TINYINT unsigned UNSIGNED NULL ;
ALTER TABLE addresses
ADD CONSTRAINT addresses_3
FOREIGN KEY (provinceId) REFERENCES provinces(id);

ALTER TABLE addresses
MODIFY COLUMN address nvarchar(255) NULL ;