CREATE TABLE market_order_batches(
	id int unsigned primary key auto_increment,
    marketOrderId int unsigned not null,
    constraint market_order_batches_1
    foreign key (marketOrderId) references market_orders(id),
    marketProductId int unsigned not null,
    constraint market_order_batches_2
    foreign key (marketProductId) references market_products(id),
    batchId int unsigned not null,
    constraint market_order_batches_3
    foreign key (batchId) references batches(id),
    quantity int unsigned not null
);