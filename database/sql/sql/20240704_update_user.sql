ALTER TABLE users
ADD COLUMN isAdmin boolean null default false;

ALTER TABLE customer_notes
MODIFY COLUMN note LONGTEXT;

UPDATE users
SET isAdmin = true
WHERE branchId IS NULL;