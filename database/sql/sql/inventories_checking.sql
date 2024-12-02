create table inventories_checking(
    id int unsigned auto_increment
		primary key,
	code nvarchar(50) not null,
    productUnitId int unsigned not null,
	realQuantity int null,
    userCreateId int unsigned not null,
    note nvarchar(255) null,
	branchId int unsigned not null,
	difference int,
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null,
	constraint inventories_checking_ibfk_1
		foreign key (productUnitId) references product_units(id),
	constraint inventories_checking_ibfk_2
		foreign key (userCreateId) references users(id),
	constraint inventories_checking_ibfk_3
		foreign key (branchId) references branches(id)
)
charset=utf8mb3;
create index productUnitId
	on inventories_checking (productUnitId);
create index userCreateId
	on inventories_checking (userCreateId);
create index branchId
	on inventories_checking (branchId);


create table inventories_checking_batch(
    id int unsigned auto_increment
		primary key,
	inventoryCheckingId int unsigned not null,
	batchId int unsigned not null,
	realQuantity int not null,
	difference int,
	constraint inventories_checking_batch_ibfk_1
		foreign key (inventoryCheckingId) references inventories_checking(id),
	constraint inventories_checking_batch_ibfk_2
		foreign key (batchId) references batches(id)	
)
charset=utf8mb3;
create index batchId
	on inventories_checking_batch (batchId);