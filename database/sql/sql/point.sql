create table points(
    id int unsigned auto_increment
		primary key,
    type enum('order','product') default 'order' not null,
    isConvertDefault bool null default false,
    convertMoneyBuy int not null default 0,
    isPointPayment bool not null default false,
    convertPoint int null default 0,
    convertMoneyPayment int null default 0,
    afterByTime int null default 0,
    isDiscountProduct bool not null default false,
    isDiscountOrder bool not null default false,
    isPointBuy bool not null default false,
    isAllCustomer bool null default false,
	status enum('active','inactive') default 'active' not null,
	storeId int unsigned not null,
	constraint fk_points_stores
		foreign key (storeId) references stores(id),
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
)
charset=utf8mb3;
create index storeId
	on points (storeId);


create table point_customers(
    id int unsigned auto_increment
		primary key,
    pointId int unsigned not null,
	groupCustomerId int unsigned not null,
	constraint pointCustomer_ibfk_1
		foreign key (pointId) references points(id),
	constraint pointGroupCustomer_ibfk_2
		foreign key (groupCustomerId) references group_customers(id)
)
charset=utf8mb3;
create index customerId
	on point_customers (groupCustomerId);
create index pointId
	on point_customers (pointId);

create table point_history(
	id int unsigned auto_increment primary key,
	customerId int unsigned not null,
	orderId int unsigned not null,
	point int,
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null,
	constraint point_history_ibfk_1
		foreign key (customerId) references customers(id),
	constraint point_history_ibfk_2
		foreign key (orderId) references orders(id)
);

create index customerId
	on point_history(id);
create index pointId
	on point_history (id);