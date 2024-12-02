CREATE TABLE user_logs(
	id int unsigned not null primary key auto_increment,
    userId int unsigned not null,
    constraint fk_user_logs_1
		foreign key (userId) references users(id),
    code nvarchar(255) not null,
    type enum('order','sale_return', 'inbound', 'purchase_return', 'inventory_checking','move'),
    amount int null,
    branchId int unsigned not null,
    constraint fk_user_logs_2
		foreign key (branchId) references branches(id),
    createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
);