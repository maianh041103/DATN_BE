CREATE TABLE customer_group_customers(
	id int unsigned primary key auto_increment,
    customerId int unsigned not null,
    groupCustomerId int unsigned not null,
    constraint customer_group_customers_1
    foreign key(customerId) references customers(id),
    constraint customer_group_customers_2
    foreign key(groupCustomerId) references group_customers(id)
)