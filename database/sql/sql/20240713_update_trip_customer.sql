ALTER TABLE trip_customer
ADD COLUMN visitedAt datetime null;

ALTER TABLE trip_customer
ADD COLUMN deletedAt datetime null;

ALTER TABLE trip_customer
ADD COLUMN createdAt datetime null;

ALTER TABLE trip_customer
ADD COLUMN updatedAt datetime null;