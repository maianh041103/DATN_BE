ALTER TABLE user_logs
MODIFY COLUMN type ENUM('order','sale_return', 'inbound', 'purchase_return', 'inventory_checking','move','receive')