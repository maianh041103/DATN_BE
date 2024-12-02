use mephar;

CREATE TABLE market_products(
	id int unsigned primary key auto_increment,
    productId int unsigned not null,
    constraint product_markets_1 
    foreign key (productId) references products(id),
    marketType enum('common','private') not null,
    price int unsigned not null default 0,
    discountPrice int unsigned not null default 0,
    quantity int unsigned not null default 0,
    quantitySold int unsigned null default 0,
    status enum('active','inactive') null default 'active',
    storeId int unsigned not null,
    constraint product_markets_3
    foreign key (storeId) references stores(id),
    description longtext null,
    images text null,
    isDefaultPrice boolean null default true,
    createdAt datetime null,
    createdBy int unsigned null,
    constraint product_markets_4
    foreign key (createdBy) references users(id),
    updatedAt datetime null,
    updatedBy int unsigned null,
    constraint product_markets_5
    foreign key (updatedBy) references users(id),
	deletedAt datetime null
);

CREATE TABLE market_product_batches(
	id int unsigned primary key auto_increment,
    marketProductId int unsigned not null,
    constraint market_product_batches_1
    foreign key (marketProductId) references market_products(id),
    batchId int unsigned not null,
    constraint market_product_batches_2
    foreign key (batchId) references batches(id),
    quantity int unsigned not null,
    quantitySold int unsigned default 0,
    storeId int unsigned not null,
    constraint market_product_batches_3
    foreign key (storeId) references stores(id),
    createdAt datetime null,
    updatedAt datetime null,
    deletedAt datetime null
);

CREATE TABLE addresses(
	id int unsigned primary key auto_increment,
    phone nvarchar(15) null,
    wardId SMALLINT unsigned not null,
    constraint addresses_1
    foreign key (wardId) references wards(id),
    districtId SMALLINT unsigned not null,
    constraint addresses_2
    foreign key (districtId) references districts(id),
    provinceId TINYINT unsigned not null,
    constraint addresses_3
    foreign key (provinceId) references provinces(id),
    address text not null,
    branchId int unsigned not null,
    constraint addresses_4
    foreign key (branchId) references branches(id),
    isDefaultAddress boolean null default false,
    createdAt datetime null,
    updatedAt datetime null,
    deletedAt datetime null
);

CREATE TABLE group_agency(
	id int unsigned primary key auto_increment,
    storeId int unsigned not null,
    constraint group_agency_1
    foreign key(storeId) references stores(id),
    name nvarchar(255) null,
    description text null,
    createdBy int unsigned null,
    foreign key(createdBy) references users(id),
    updatedBy int unsigned null,
    foreign key(updatedBy) references users(id),
    createdAt datetime null,
    updatedAt datetime null,
    deletedAt datetime null
);

CREATE TABLE request_agency(
	id int unsigned primary key auto_increment,
    storeId int unsigned not null,
    constraint request_agency_1
    foreign key(storeId) references stores(id),
    agencyId int unsigned not null,
    constraint request_agency_2
    foreign key(agencyId) references stores(id),
    status enum('active','cancel','pending') not null default 'pending',
    groupAgencyId int unsigned null,
    constraint request_agency_3
    foreign key(groupAgencyId) references group_agency(id),
    createdAt datetime null,
    updatedAt datetime null,
    deletedAt datetime null
);

CREATE TABLE market_product_agency(
    id int unsigned primary key auto_increment,
    marketProductId int unsigned not null,
    constraint market_product_agency_1
    foreign key(marketProductId) references market_products(id),
    groupAgencyId int unsigned null,
    constraint market_product_agency_2
    foreign key(groupAgencyId) references group_agency(id),
    agencyId int unsigned null,
    constraint market_product_agency_3
    foreign key(agencyId) references request_agency(id),
    price int unsigned not null default 0,
    discountPrice int unsigned not null default 0,
    createdAt datetime null,
    updatedAt datetime null,
    deletedAt datetime null
);

CREATE TABLE market_images(
    id int unsigned primary key auto_increment,
    storeId int unsigned not null,
    constraint market_images_1
    foreign key(storeId) references stores(id),
    imageId int unsigned not null,
    constraint market_images_2
    foreign key(imageId) references images(id),
    position enum('top','bottom','list') not null,
    createdAt datetime null,
    updatedAt datetime null,
    deletedAt datetime null
);

ALTER TABLE market_products
ADD COLUMN branchId integer(10) UNSIGNED;

ALTER TABLE market_products
ADD CONSTRAINT market_products_6 FOREIGN KEY (branchId) REFERENCES branches(id);

CREATE TABLE carts(
	id int unsigned primary key auto_increment,
    branchId int unsigned not null,
    marketProductId int unsigned not null,
    price int unsigned,
    quantity int unsigned,
    createdAt datetime null,
    updatedAt datetime null,
    deletedAt datetime null
);

CREATE TABLE market_orders(
	id int unsigned primary key auto_increment,
    code nvarchar(20) null,
    branchId int unsigned not null,
    constraint market_orders_1
    foreign key(branchId) references branches(id),
    addressId int unsigned not null,
    address nvarchar(100) null,
    constraint market_orders_2
    foreign key(addressId) references addresses(id),
    status enum('pending','processing','send','done','cancel'),
    createdAt datetime null,
    updatedAt datetime null,
    deletedAt datetime null
);

CREATE TABLE market_order_products(
	id int unsigned primary key auto_increment,
    marketOrderId int unsigned not null,
    constraint market_order_products_1
    foreign key (marketOrderId) references market_orders(id),
    marketProductId int unsigned not null,
    constraint market_order_products_2
    foreign key (marketProductId) references market_products(id),
    quantity int unsigned not null,
    price int unsigned not null
);

CREATE TABLE history_purchase(
	id int unsigned primary key auto_increment,
    marketOrderId int unsigned not null,
    constraint history_purchase
    foreign key (marketOrderId) references market_orders(id),
    status enum('pending','processing','send','done','cancel'),
    time datetime null
);