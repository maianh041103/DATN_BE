CREATE TABLE seri(
	id int unsigned primary key auto_increment,
    code nvarchar(20),
    marketOrderId int unsigned not null,
    marketProductId int unsigned not null,
    createdBy int unsigned not null,
    constraint fk_seri_1
    foreign key(marketOrderId) references market_orders(id),
	constraint fk_seri_2
    foreign key(marketProductId) references market_products(id),
    constraint fk_seri_3
    foreign key(createdBy) references users(id)
);
