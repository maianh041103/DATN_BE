ALTER TABLE trip_customer
ADD COLUMN lat nvarchar(100) not null;

ALTER TABLE trip_customer
ADD COLUMN lng nvarchar(100) not null;

ALTER TABLE trip_customer
ADD COLUMN stt integer null;

ALTER TABLE trip_customer
MODIFY COLUMN status ENUM('visited','not_visited','skip','waited');

ALTER TABLE trip_customer
ADD COLUMN note LONGTEXT;

ALTER TABLE trips
ADD COLUMN currentAddress int unsigned;

ALTER TABLE trips
ADD COLUMN status enum('pending','done'); 