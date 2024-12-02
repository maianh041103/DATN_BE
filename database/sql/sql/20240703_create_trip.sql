create table trips(
    id int unsigned auto_increment
		primary key,
	code nvarchar(20) null,
    name nvarchar(100) not null,
    lat nvarchar(100) not null,
	lng nvarchar(100) not null,
    time timestamp null,
    createdBy int unsigned not null,
    userId int unsigned null,
    note nvarchar(1000) null,
	storeId int unsigned not null,
	constraint fk_trips_1
		foreign key (createdBy) references users(id),
	constraint fk_trips_2
		foreign key (userId) references users(id),
	constraint fk_trips_3
		foreign key (storeId) references stores(id),
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
)
charset=utf8mb3;

create table trip_customer(
	id int unsigned auto_increment
		primary key,
	customerId int unsigned not null,
    tripId int unsigned not null,
	lat nvarchar(100) not null,
	lng nvarchar(100) not null,
    status enum('skip','visited','not_visited'),
	constraint fk_trip_customer_1
		foreign key (customerId) references customers(id),
	constraint fk_trip_customer_2
		foreign key (tripId) references trips(id)
)charset=utf8mb3;