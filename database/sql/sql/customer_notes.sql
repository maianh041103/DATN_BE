use mephar;
create table customer_notes(
	id int unsigned auto_increment
		primary key,
	note varchar(255) not null,
	customerId int unsigned not null,
	constraint fk_customer_notes_1
		foreign key (customerId) references customers(id),
    userId int unsigned not null,
	constraint fk_customer_notes_2
		foreign key (userId) references users(id),
	createdTime timestamp default CURRENT_TIMESTAMP not null
)
charset=utf8mb3;
create index customerId
	on customer_notes (customerId);
create index userId
	on customer_notes (userId);