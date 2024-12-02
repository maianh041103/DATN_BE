CREATE TABLE market_notification(
	id int unsigned primary key auto_increment,
    marketOrderId int unsigned not null,
    constraint market_notification_1
    foreign key (marketOrderId) references market_orders(id),
    createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
);