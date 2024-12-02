create table banners
(
	id int auto_increment
		primary key,
	imageId int null,
	title varchar(255) null,
	alt varchar(255) null,
	displayOrder int default 0 null,
	link varchar(255) null,
	type varchar(255) null,
	description varchar(255) null,
	sponsor varchar(255) null,
	status tinyint default 1 null,
	createdAt datetime null,
	createdBy int null,
	updatedAt datetime null,
	updatedBy int null,
	deletedAt datetime null
)
charset=utf8mb3;

create table batches
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	branchId int unsigned null,
	productId int unsigned null,
	name varchar(512) not null,
	expiryDate date not null,
	quantity int unsigned not null,
	isUsed tinyint null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	productUnitId int unsigned null
)
charset=utf8mb3;

create index batches_productUnitId_index
	on batches (productUnitId);

create index branchId
	on batches (branchId);

create index productId
	on batches (productId);

create index storeId
	on batches (storeId);

create table behavior_logs
(
	id int unsigned auto_increment
		primary key,
	accountId int null,
	type int null,
	objectId int null,
	action varchar(255) null,
	data longtext null,
	isProcess tinyint default 0 null,
	createdAt datetime null
)
charset=utf8mb3;

create table codes
(
	id int auto_increment
		primary key,
	storeId int unsigned null,
	value bigint null,
	type int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	constraint unique_storeId_type
		unique (storeId, type)
);

create index codes_type_index
	on codes (type);

create table configurations
(
	id int unsigned auto_increment
		primary key,
	`key` varchar(255) null,
	value longtext null,
	type int null,
	displayOrder int default 0 null,
	status tinyint default 1 null,
	createdAt datetime null,
	createdBy int null,
	updatedAt datetime null,
	updatedBy int null,
	deletedAt datetime null
)
charset=utf8mb3;

create table customer_debts
(
	id int auto_increment
		primary key,
	totalAmount int null,
	customerId int null,
	orderId int null,
	debtAmount bigint null,
	type varchar(255) null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
);

create index debts_customerId_index
	on customer_debts (customerId);

create index debts_orderId_index
	on customer_debts (orderId);

create table discount_programs
(
	id int auto_increment
		primary key,
	title varchar(255) null,
	alt varchar(255) null,
	imageId int not null,
	productId int not null,
	discountPrice float default 0 not null,
	link varchar(255) null,
	description varchar(255) null,
	sponsor varchar(255) null,
	startTime datetime not null,
	endTime datetime not null,
	status tinyint default 1 null,
	createdAt datetime null,
	createdBy int null,
	updatedAt datetime null,
	updatedBy int null,
	deletedAt datetime null
)
charset=utf8mb3;

create table districts
(
	id smallint unsigned auto_increment
		primary key,
	provinceId tinyint unsigned null,
	vemisProvince varchar(5) null,
	vemisId varchar(5) null,
	vemisName varchar(50) null,
	name varchar(100) null,
	name2 varchar(100) null,
	displayOrder smallint null,
	keyword varchar(250) null,
	name3 varchar(100) null,
	deletedAt datetime null
)
charset=utf8mb3 row_format = DYNAMIC;

create index provinceId
	on districts (provinceId);

create table images
(
	id int unsigned auto_increment
		primary key,
	originalName varchar(255) null,
	path varchar(255) not null,
	fileName varchar(255) not null,
	extension varchar(255) null,
	mimetype varchar(255) null,
	createdAt datetime not null,
	createdBy int unsigned null,
	updatedAt datetime not null,
	updatedBy int unsigned null,
	deletedAt datetime null
)
charset=utf8mb3;

create table inbound_product_batch
(
	id int unsigned auto_increment
		primary key,
	inboundProductId int unsigned null,
	batchId int unsigned null,
	quantity int unsigned null,
	createdAt datetime not null,
	updatedAt datetime not null,
	deletedAt datetime null
);

create index inbound_product_batch_batchId_index
	on inbound_product_batch (batchId);

create index inbound_product_batch_inboundProductId_index
	on inbound_product_batch (inboundProductId);

create table introductions
(
	id int auto_increment
		primary key,
	content longtext not null,
	description varchar(2000) null,
	prioritize tinyint(1) default 0 null,
	status tinyint(1) default 1 null,
	createdBy int null,
	updatedBy int null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
)
charset=utf8mb3;

create table inventories
(
	id int auto_increment
		primary key,
	quantity int unsigned null,
	productId int null,
	branchId int null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
);

create index inventories_branchId_index
	on inventories (branchId);

create index inventories_productId_index
	on inventories (productId);

create table move_item_batch
(
	id int auto_increment
		primary key,
	fromBatchId int null,
	toBatchId int null,
	moveItemId int null,
	quantity int null,
	createdAt datetime null,
	updatedAt datetime null
);

create index move_item_batch_fromBatchId_index
	on move_item_batch (fromBatchId);

create index move_item_batch_moveItemId_index
	on move_item_batch (moveItemId);

create index move_item_batch_toBatchId_index
	on move_item_batch (toBatchId);

create table move_item_to_batch
(
	id int auto_increment
		primary key,
	toBatchId int null,
	moveItemId int null,
	quantity int null,
	createdAt datetime null,
	updatedAt datetime null
);

create index move_item_to_batch_fromBatchId_index
	on move_item_to_batch (toBatchId);

create index move_item_to_batch_moveItemId_index
	on move_item_to_batch (moveItemId);

create table move_items
(
	id int unsigned auto_increment
		primary key,
	moveId int null,
	productUnitId int null,
	productId int null,
	quantity int null,
	createdAt datetime null,
	updatedAt datetime null,
	toQuantity int null,
	price int null
);

create index move_items_moveId_index
	on move_items (moveId);

create index move_items_productId_index
	on move_items (productId);

create index move_items_productUnitId_index
	on move_items (productUnitId);

create index move_items_quantity_index
	on move_items (quantity);

create table moves
(
	id int auto_increment
		primary key,
	code varchar(100) null,
	fromBranchId int unsigned null,
	toBranchId int unsigned null,
	movedAt datetime null,
	receivedAt datetime null,
	movedBy int unsigned null,
	receivedBy int unsigned null,
	status varchar(50) null,
	note varchar(1000) null,
	createdAt datetime null,
	updatedAt datetime null,
	totalItem int null,
	storeId int unsigned null,
	totalPrice bigint null,
	receiveNote varchar(255) null
);

create index moves_code_index
	on moves (code);

create index moves_fromBranchId_index
	on moves (fromBranchId);

create index moves_storeId_index
	on moves (storeId);

create index moves_toBranchId_index
	on moves (toBranchId);

create table notifications
(
	id int auto_increment
		primary key,
	userId int null,
	customerId int null,
	parentId int null,
	role varchar(255) null,
	title varchar(255) null,
	description mediumtext null,
	content mediumtext null,
	type varchar(255) null,
	iconId int null,
	url varchar(255) null,
	isRead tinyint default 0 null,
	objectId int null,
	createdAt datetime null,
	createdBy int null,
	updatedAt datetime null,
	updatedBy int null,
	deletedAt datetime null
)
charset=utf8mb3;

create table order_histories
(
	id int unsigned auto_increment
		primary key,
	orderId int unsigned not null,
	action enum('CREATE', 'UPDATE', 'DELETE') null,
	description varchar(255) null,
	createdAt datetime not null,
	createdBy int unsigned null,
	updatedAt datetime not null,
	updatedBy int unsigned null,
	deletedAt datetime null
)
charset=utf8mb3;

create table order_product_batch
(
	id bigint auto_increment
		primary key,
	batchId int unsigned null,
	orderProductId int unsigned null,
	quantity int null,
	createdAt datetime null,
	deletedAt datetime null,
	updatedAt datetime null
);

create index order_product_batch_batchId_index
	on order_product_batch (batchId);

create index order_product_batch_orderProductId_index
	on order_product_batch (orderProductId);

create table orders_log
(
	id bigint unsigned auto_increment
		primary key,
	orderId int unsigned not null,
	action varchar(10) null,
	status int unsigned null,
	oldStatus int unsigned null,
	isProcess tinyint unsigned default '0' null,
	createdAt datetime not null,
	createdBy int null
)
charset=utf8mb3;

create table otps
(
	id bigint unsigned auto_increment
		primary key,
	phone varchar(255) not null,
	otp varchar(255) not null,
	status tinyint(1) default 1 not null,
	count int default 1 not null,
	createdAt datetime null,
	updatedAt datetime null
)
charset=utf8mb3;

create table payments
(
	id int auto_increment
		primary key,
	code varchar(255) null,
	orderId int null,
	amount bigint null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	createdBy int null,
	paymentMethod varchar(100) null,
	customerId int null,
	status varchar(100) null,
	totalAmount int null,
	isReturn tinyint(1) null
);

create index payments_code_index
	on payments (code);

create index payments_customerId_index
	on payments (customerId);

create index payments_orderId_index
	on payments (orderId);

create table product_masters
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	branchId int unsigned null,
	productId int unsigned null,
	productUnitId int unsigned null,
	quantity double(11,2) unsigned not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
)
collate=utf8mb4_unicode_ci;

create index branchId
	on product_masters (branchId);

create index productId
	on product_masters (productId);

create index productUnitId
	on product_masters (productUnitId);

create index storeId
	on product_masters (storeId);

create table product_statistics
(
	id int auto_increment
		primary key,
	productId int not null,
	viewed int default 0 null,
	sold int default 0 null
)
charset=utf8mb3;

create table product_to_batch_histories
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	branchId int unsigned null,
	productId int unsigned null,
	batchId int unsigned null,
	productUnitId int unsigned null,
	inboundProductId int unsigned null,
	purchaseReturnProductId int unsigned null,
	quantity int unsigned not null,
	currentQuantity int default 0 null,
	initQuantity int default 0 null,
	totalPrice int unsigned not null,
	importPrice int unsigned not null,
	discount int unsigned default '0' null,
	expiryDate date null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
)
collate=utf8mb4_unicode_ci;

create index batchId
	on product_to_batch_histories (batchId);

create index branchId
	on product_to_batch_histories (branchId);

create index inboundProductId
	on product_to_batch_histories (inboundProductId);

create index productId
	on product_to_batch_histories (productId);

create index productUnitId
	on product_to_batch_histories (productUnitId);

create index storeId
	on product_to_batch_histories (storeId);

create table product_to_batches
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	branchId int unsigned null,
	productId int unsigned null,
	batchId int unsigned null,
	productUnitId int unsigned null,
	quantity double(11,2) unsigned not null,
	totalPrice int unsigned not null,
	importPrice int unsigned not null,
	discount int unsigned default '0' null,
	expiryDate date not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
)
collate=utf8mb4_unicode_ci;

create index batchId
	on product_to_batches (batchId);

create index branchId
	on product_to_batches (branchId);

create index productId
	on product_to_batches (productId);

create index productUnitId
	on product_to_batches (productUnitId);

create index storeId
	on product_to_batches (storeId);

create table product_units
(
	id int unsigned auto_increment
		primary key,
	unitName varchar(255) not null,
	exchangeValue int unsigned not null,
	price int unsigned not null,
	productId int unsigned not null,
	code varchar(45) null,
	barCode varchar(255) null,
	isDirectSale tinyint default 0 null,
	point int default 0 null,
	isBaseUnit tinyint default 0 null,
	storeId int unsigned null,
	branchId int unsigned null,
	createdBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
)
charset=utf8mb3;

create index branchId
	on product_units (branchId);

create index productId
	on product_units (productId);

create index product_units_barCode_index
	on product_units (barCode);

create index product_units_code_index_1
	on product_units (code);

create index storeId
	on product_units (storeId);

create table promotion_programs
(
	id int auto_increment
		primary key,
	title varchar(512) null,
	slug varchar(512) null,
	alt varchar(255) null,
	imageId int not null,
	link varchar(255) null,
	description varchar(255) null,
	sponsor varchar(255) null,
	startTime datetime not null,
	endTime datetime not null,
	status tinyint default 1 null,
	createdAt datetime null,
	createdBy int null,
	updatedAt datetime null,
	updatedBy int null,
	deletedAt datetime null
)
charset=utf8mb3;

create table promotion_to_customers
(
	id int auto_increment
		primary key,
	customerId int not null,
	promotionId int not null,
	createdAt datetime null,
	createdBy int null
)
charset=utf8mb3;

create table promotion_to_products
(
	id int auto_increment
		primary key,
	productId int not null,
	promotionId int not null,
	createdAt datetime null,
	createdBy int null
)
charset=utf8mb3;

create table provinces
(
	id tinyint unsigned not null
		primary key,
	vemisId varchar(5) null,
	vemisName varchar(50) null,
	name varchar(50) null,
	name2 varchar(50) null,
	sname varchar(50) null,
	dataArea tinyint null comment 'Vùng dữ liệu',
	economicZone tinyint null comment 'Vùng kinh tế',
	keyword varchar(250) null,
	`order` tinyint null,
	masterId bigint unsigned default '0' null,
	name3 varchar(50) null,
	regionId tinyint default 0 null,
	mainEthnicGroup varchar(250) default '1' not null comment 'Dân tộc chính',
	deletedAt datetime null
)
charset=utf8mb3 row_format = COMPACT;

create table purchase_return_item_batch
(
	id int auto_increment
		primary key,
	purchaseReturnItemId int null,
	batchId int null,
	quantity int null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
);

create index purchase_return_item_batch_batchId_index
	on purchase_return_item_batch (batchId);

create index purchase_return_item_batch_purchaseReturnItemId_index
	on purchase_return_item_batch (purchaseReturnItemId);

create index saleReturnItemId
	on purchase_return_item_batch (batchId);

create table role_permissions
(
	id int auto_increment
		primary key,
	roleId int not null,
	model varchar(255) not null,
	action varchar(255) not null,
	createdBy int null,
	updatedBy int null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
)
charset=utf8mb3;

create table roles
(
	id int auto_increment
		primary key,
	name varchar(255) not null,
	description varchar(255) null,
	storeId int null,
	createdAt datetime null,
	createdBy int null,
	updatedAt datetime null,
	updatedBy int null,
	deletedAt datetime null
)
charset=utf8mb3;

create index storeId
	on roles (storeId);

create table sale_return_batch
(
	id int auto_increment
		primary key,
	saleReturnItemId int null,
	batchId int null,
	quantity int null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
);

create index sale_return_batch_sale_return_item
	on sale_return_batch (saleReturnItemId);

create table sale_return_item
(
	id int unsigned auto_increment
		primary key,
	saleReturnId int unsigned null,
	branchId int unsigned null,
	productUnitId int null,
	quantity int null,
	discount int null,
	price int null,
	totalPrice int null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null
)
charset=utf8mb3;

create index branchId
	on sale_return_item (branchId);

create index createdBy
	on sale_return_item (createdBy);

create index productUnitId
	on sale_return_item (productUnitId);

create index saleReturnId
	on sale_return_item (saleReturnId);

create table sale_returns
(
	id int unsigned auto_increment
		primary key,
	code varchar(255) null,
	storeId int unsigned not null,
	branchId int unsigned not null,
	userId int unsigned not null,
	customerId int unsigned null,
	orderId int unsigned null,
	totalPrice int unsigned default '0' not null,
	itemPrice int unsigned default '0' not null,
	discount int unsigned default '0' null,
	returnFee int unsigned default '0' null,
	debt int unsigned default '0' null,
	paymentType enum('CASH', 'BANK', 'DEBT') null,
	status enum('TRASH', 'DRAFT', 'SUCCEED', 'CANCELLED') default 'DRAFT' not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	paid int unsigned null
)
charset=utf8mb3;

create index branchId
	on sale_returns (branchId);

create index createdBy
	on sale_returns (createdBy);

create index customerId
	on sale_returns (customerId);

create index orderId
	on sale_returns (orderId);

create index storeId
	on sale_returns (storeId);

create index updatedBy
	on sale_returns (updatedBy);

create index userId
	on sale_returns (userId);

create table user_product_customers
(
	id int auto_increment
		primary key,
	userId int not null,
	productId int not null,
	customerId int not null,
	discountProgramId int null,
	createdBy int null
)
charset=utf8mb3;

create table user_products
(
	id int auto_increment
		primary key,
	userId int not null,
	productId int not null,
	createdBy int null
)
charset=utf8mb3;

create table users
(
	id int unsigned auto_increment
		primary key,
	username varchar(255) not null,
	fullName varchar(45) null,
	birthday date null,
	gender varchar(10) null,
	phone varchar(15) null,
	email varchar(255) null,
	password varchar(2000) null,
	avatarId int null,
	position varchar(255) null,
	status varchar(255) null,
	roleId int null,
	address varchar(255) null,
	storeId int null,
	branchId int null,
	lastLoginAt datetime null,
	createdAt datetime null,
	createdBy int null,
	updatedAt datetime null,
	updatedBy int null,
	deletedAt datetime null
)
charset=utf8mb3;

create index branchId
	on users (branchId);

create index roleId
	on users (roleId);

create index storeId
	on users (storeId);

create table wards
(
	id smallint unsigned auto_increment
		primary key,
	vemisProvince varchar(5) not null,
	vemisDistrict varchar(5) not null,
	vemisWard varchar(6) not null,
	geographicalAreaId varchar(2) null comment 'Vùng địa lí',
	vemisName varchar(50) not null,
	difficult tinyint not null comment 'Khó khăn',
	border tinyint not null comment 'Biên giới',
	hspcArea double null,
	name varchar(50) null,
	name2 varchar(50) null,
	provinceId tinyint null,
	districtId smallint null,
	province varchar(50) null,
	district varchar(50) null,
	address varchar(500) null,
	name3 varchar(50) null,
	border1 tinyint not null,
	hspcArea1 double null,
	difficult1 tinyint not null,
	geographicalAreaId1 varchar(2) null,
	deletedAt datetime null
)
charset=utf8mb3 row_format = DYNAMIC;

create table stores
(
	id int unsigned auto_increment
		primary key,
	name varchar(255) not null,
	phone varchar(255) not null,
	email varchar(255) null,
	field varchar(255) null,
	address varchar(255) null,
	wardId smallint unsigned null,
	districtId smallint unsigned null,
	provinceId tinyint unsigned null,
	logoId int unsigned null,
	loginAddress varchar(255) null,
	businessRegistrationImageId int unsigned null,
	businessRegistrationNumber varchar(255) null,
	expiredDate date null,
	status int unsigned default '1' not null,
	lastSync datetime null,
	createdAt datetime null,
	updatedAt datetime null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	deletedAt datetime null,
	constraint stores_ibfk_1
		foreign key (wardId) references wards (id),
	constraint stores_ibfk_2
		foreign key (districtId) references districts (id),
	constraint stores_ibfk_3
		foreign key (provinceId) references provinces (id),
	constraint stores_ibfk_4
		foreign key (businessRegistrationImageId) references images (id),
	constraint stores_ibfk_5
		foreign key (logoId) references images (id)
)
charset=utf8mb3;

create table branches
(
	id int unsigned auto_increment
		primary key,
	name varchar(255) not null,
	phone varchar(255) not null,
	code varchar(255) null,
	zipCode varchar(255) null,
	address1 varchar(255) null,
	address2 varchar(255) null,
	isDefaultBranch tinyint(1) default 0 null,
	storeId int unsigned null,
	wardId smallint unsigned null,
	districtId smallint unsigned null,
	provinceId tinyint unsigned null,
	status int unsigned default '1' not null,
	createdAt datetime null,
	updatedAt datetime null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	deletedAt datetime null,
	constraint branches_ibfk_1
		foreign key (storeId) references stores (id),
	constraint branches_ibfk_2
		foreign key (wardId) references wards (id),
	constraint branches_ibfk_3
		foreign key (districtId) references districts (id),
	constraint branches_ibfk_4
		foreign key (provinceId) references provinces (id)
)
charset=utf8mb3;

create index districtId
	on branches (districtId);

create index provinceId
	on branches (provinceId);

create index storeId
	on branches (storeId);

create index wardId
	on branches (wardId);

create table countries
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint countries_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on countries (storeId);

create table dosages
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint dosages_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on dosages (storeId);

create table group_customers
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	description varchar(255) null,
	discount int unsigned default '0' null,
	type varchar(255) null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint group_customers_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create table customers
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	branchId int unsigned null,
	code varchar(45) null,
	fullName varchar(255) not null,
	phone varchar(255) not null,
	email varchar(255) null,
	birthday date null,
	gender enum('male', 'female', 'other') default 'other' null,
	taxCode varchar(255) null,
	password varchar(2000) not null,
	groupCustomerId int unsigned null,
	avatarId int unsigned null,
	position int unsigned null,
	address varchar(255) null,
	facebook varchar(255) null,
	note varchar(255) null,
	point int default 0 null,
	debt int default 0 null,
	wardId smallint unsigned null,
	districtId smallint unsigned null,
	provinceId tinyint unsigned null,
	type tinyint default 1 null,
	status enum('draft', 'active', 'inactive') default 'active' null,
	lastLoginAt datetime null,
	changePasswordAt datetime null,
	createdAt datetime null,
	updatedAt datetime null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	deletedAt varchar(45) null,
	isDefault tinyint(1) null,
	constraint customers_ibfk_1
		foreign key (groupCustomerId) references group_customers (id),
	constraint customers_ibfk_2
		foreign key (avatarId) references images (id),
	constraint customers_ibfk_3
		foreign key (provinceId) references provinces (id),
	constraint customers_ibfk_4
		foreign key (districtId) references districts (id),
	constraint customers_ibfk_5
		foreign key (wardId) references wards (id)
)
charset=utf8mb3;

create index avatarId
	on customers (avatarId);

create index customers_ibfk_3_idx
	on customers (provinceId);

create index customers_ibfk_4_idx
	on customers (districtId);

create index groupCustomerId
	on customers (groupCustomerId);

create index wardId
	on customers (wardId);

create index storeId
	on group_customers (storeId);

create table group_products
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	description varchar(255) null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	discount int unsigned default '0' null,
	type varchar(255) null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint group_products_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on group_products (storeId);

create table group_suppliers
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	description varchar(255) null,
	branchId int unsigned null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint group_suppliers_ibfk_1
		foreign key (storeId) references stores (id),
	constraint group_suppliers_ibfk_2
		foreign key (branchId) references branches (id)
)
charset=utf8mb3;

create index group_suppliers_ibfk_2_idx
	on group_suppliers (branchId);

create index storeId
	on group_suppliers (storeId);

create table health_facilities
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint health_facilities_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on health_facilities (storeId);

create table levels
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint levels_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on levels (storeId);

create table manufactures
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint manufactures_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on manufactures (storeId);

create table medication_categories
(
	id int unsigned auto_increment
		primary key,
	name varchar(512) not null,
	code varchar(255) not null,
	registerNumber varchar(255) null,
	activeElement text null,
	content text null,
	countryId int unsigned null,
	packingSpecification text null,
	type varchar(45) null,
	unitId int unsigned null,
	storeId int unsigned null,
	manufactureId int unsigned null,
	link varchar(255) null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint medication_categories_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on medication_categories (storeId);

create table national_pharmacy_systems
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	branchId int unsigned null,
	code varchar(255) not null,
	username varchar(255) not null,
	password varchar(255) not null,
	note text null,
	status int unsigned default '0' null,
	isAutoHandle int default 0 null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint national_pharmacy_systems_ibfk_1
		foreign key (storeId) references stores (id),
	constraint national_pharmacy_systems_ibfk_2
		foreign key (branchId) references branches (id),
	constraint national_pharmacy_systems_ibfk_3
		foreign key (createdBy) references users (id),
	constraint national_pharmacy_systems_ibfk_4
		foreign key (updatedBy) references users (id)
)
collate=utf8mb4_unicode_ci;

create index branchId
	on national_pharmacy_systems (branchId);

create index createdBy
	on national_pharmacy_systems (createdBy);

create index storeId
	on national_pharmacy_systems (storeId);

create index updatedBy
	on national_pharmacy_systems (updatedBy);

create table orders
(
	id int unsigned auto_increment
		primary key,
	code varchar(255) not null,
	userId int unsigned not null,
	customerId int unsigned not null,
	groupCustomerId int unsigned null,
	storeId int unsigned not null,
	branchId int unsigned not null,
	totalPrice int unsigned default '0' not null,
	cashOfCustomer int unsigned default '0' null,
	point float(11,2) unsigned default 0.00 null,
	paymentType enum('CASH', 'BANK', 'DEBT') not null,
	description varchar(255) null,
	isVatInvoice tinyint(1) default 0 not null,
	discount float(11,2) null,
	discountType tinyint(1) null,
	discountOrder int unsigned null,
	refund int unsigned default '0' null,
	customerOwes int unsigned default '0' null,
	prescriptionId int null,
	status enum('DRAFT', 'PENDING', 'CONFIRMING', 'SHIPPING', 'DELIVERING', 'PAID', 'CANCELLED', 'SUCCEED') default 'PENDING' not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null,
	discountAmount bigint null,
	paymentPoint int null default 0,
	discountByPoint int null default 0,
	canReturn tinyint(1) default 1 null,
	constraint orders_ibfk_1
		foreign key (userId) references users (id),
	constraint orders_ibfk_2
		foreign key (createdBy) references users (id),
	constraint orders_ibfk_3
		foreign key (updatedBy) references users (id),
	constraint orders_ibfk_4
		foreign key (customerId) references customers (id),
	constraint orders_ibfk_5
		foreign key (branchId) references branches (id)
)
collate=utf8mb4_unicode_ci;

create index branchId
	on orders (branchId);

create index customerId
	on orders (customerId);

create index orders_createdAt_index
	on orders (createdAt);

create index orders_ibfk_1_idx
	on orders (userId);

create index orders_ibfk_2_idx
	on orders (createdBy);

create index orders_ibfk_3_idx
	on orders (updatedBy);

create index orders_ibfk_6_idx
	on orders (prescriptionId);

create table positions
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint positions_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on positions (storeId);

create table product_categories
(
	id int unsigned auto_increment
		primary key,
	name varchar(255) not null,
	description varchar(255) null,
	slug varchar(255) not null,
	`order` int default 0 null,
	imageId varchar(45) null,
	createdBy int null,
	updatedBy int null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	storeId int unsigned null,
	constraint product_categories_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on product_categories (storeId);

create table products
(
	id int unsigned auto_increment
		primary key,
	name varchar(255) not null,
	shortName varchar(255) null,
	slug varchar(255) not null,
	code varchar(255) not null,
	barCode varchar(255) not null,
	groupProductId int unsigned null,
	imageId int unsigned null,
	dosageId int unsigned null,
	positionId int unsigned null,
	primePrice int unsigned null,
	price int unsigned null,
	weight varchar(255) null,
	warningExpiryDate date null,
	warningExpiryText varchar(255) null,
	isDirectSale tinyint(1) default 0 not null,
	registerNumber varchar(255) null,
	activeElement varchar(255) null,
	content varchar(255) null,
	packingSpecification varchar(255) null,
	manufactureId int unsigned null,
	countryId int unsigned null,
	minInventory int unsigned null,
	maxInventory int unsigned null,
	description varchar(255) null,
	note varchar(255) null,
	inventory int unsigned default '0' null,
	baseUnit varchar(255) not null,
	quantitySold int unsigned default '0' null,
	productCategoryId int unsigned null,
	status int unsigned default '1' null,
	storeId int unsigned not null,
	type int unsigned not null,
	branchId int unsigned null,
	isLoyaltyPoint tinyint(1) default 0 null,
	isBatchExpireControl tinyint(1) default 0 null,
	expiryPeriod int null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt date null,
	drugCode varchar(255) null,
	constraint products_ibfk_1
		foreign key (storeId) references stores (id),
	constraint products_ibfk_2
		foreign key (branchId) references branches (id),
	constraint products_ibfk_3
		foreign key (imageId) references images (id),
	constraint products_ibfk_4
		foreign key (manufactureId) references manufactures (id),
	constraint products_ibfk_5
		foreign key (dosageId) references dosages (id),
	constraint products_ibfk_6
		foreign key (positionId) references positions (id),
	constraint products_ibfk_7
		foreign key (productCategoryId) references product_categories (id),
	constraint products_ibfk_8
		foreign key (groupProductId) references group_products (id)
)
charset=utf8mb3;

create table inbound_to_products
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	branchId int unsigned null,
	inboundId int unsigned null,
	productId int unsigned null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	quantity int unsigned null,
	productUnitId int null,
	price bigint null,
	discount int null,
	constraint inbound_to_products_ibfk_1
		foreign key (storeId) references stores (id),
	constraint inbound_to_products_ibfk_2
		foreign key (branchId) references branches (id),
	constraint inbound_to_products_ibfk_3
		foreign key (productId) references products (id),
	constraint inbound_to_products_ibfk_4
		foreign key (createdBy) references users (id),
	constraint inbound_to_products_ibfk_5
		foreign key (updatedBy) references users (id)
)
charset=utf8mb3;

create index branchId
	on inbound_to_products (branchId);

create index createdBy
	on inbound_to_products (createdBy);

create index inboundId
	on inbound_to_products (inboundId);

create index inbound_to_products_productUnitId_index
	on inbound_to_products (productUnitId);

create index productId
	on inbound_to_products (productId);

create index storeId
	on inbound_to_products (storeId);

create index updatedBy
	on inbound_to_products (updatedBy);

create table order_products
(
	id int unsigned auto_increment
		primary key,
	orderId int unsigned not null,
	productId int unsigned not null,
	productUnitId int unsigned not null,
	productUnitData text null,
	quantity int unsigned not null,
	quantityBaseUnit int unsigned not null,
	comboId int unsigned null,
	price int unsigned null,
	primePrice int unsigned null,
	itemPrice int unsigned null,
	discountPrice int unsigned null,
	isDiscount bool default false null,
	customerId int unsigned not null,
	groupCustomerId int unsigned null,
	userId int unsigned null,
	discount float default 0 null,
	quantityLast int null,
	point int unsigned default 0 null,
	status enum('DRAFT', 'PENDING', 'CONFIRMING', 'SHIPPING', 'DELIVERING', 'PAID', 'CANCELLED', 'SUCCEED') null,
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null,
	constraint order_products_ibfk_1
		foreign key (orderId) references orders (id),
	constraint order_products_ibfk_2
		foreign key (productId) references products (id),
	constraint order_products_ibfk_3
		foreign key (customerId) references customers (id),
	constraint order_products_ibfk_4
		foreign key (userId) references users (id)
)
collate=utf8mb4_unicode_ci;

create index customerId
	on order_products (customerId);

create index groupCustomerId
	on order_products (groupCustomerId);

create index orderId
	on order_products (orderId);

create index productId
	on order_products (productId);

create index productUnitId
	on order_products (productUnitId);

create index userId
	on order_products (userId);

create index branchId
	on products (branchId);

create index dosageId
	on products (dosageId);

create index groupProductId
	on products (groupProductId);

create index imageId
	on products (imageId);

create index manufactureId
	on products (manufactureId);

create index positionId
	on products (positionId);

create index productCategoryId
	on products (productCategoryId);

create index products_code_index
	on products (code);

create index storeId
	on products (storeId);

create table purchase_return_to_products
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	branchId int unsigned null,
	purchaseReturnId int unsigned null,
	productId int unsigned null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	productUnitId int null,
	quantity int null,
	importPrice bigint null,
	discount int null,
	totalPrice int null,
	constraint purchase_return_to_products_ibfk_1
		foreign key (storeId) references stores (id),
	constraint purchase_return_to_products_ibfk_2
		foreign key (branchId) references branches (id),
	constraint purchase_return_to_products_ibfk_3
		foreign key (productId) references products (id),
	constraint purchase_return_to_products_ibfk_4
		foreign key (createdBy) references users (id),
	constraint purchase_return_to_products_ibfk_5
		foreign key (updatedBy) references users (id)
)
charset=utf8mb3;

create index branchId
	on purchase_return_to_products (branchId);

create index createdBy
	on purchase_return_to_products (createdBy);

create index productId
	on purchase_return_to_products (productId);

create index purchaseReturnId
	on purchase_return_to_products (purchaseReturnId);

create index purchase_return_to_products_productUnitId_index
	on purchase_return_to_products (productUnitId);

create index storeId
	on purchase_return_to_products (storeId);

create index updatedBy
	on purchase_return_to_products (updatedBy);

create table sample_prescriptions
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned not null,
	branchId int unsigned not null,
	name varchar(512) not null,
	code varchar(512) null,
	description varchar(255) null,
	displayOrder int unsigned default '0' null,
	status int unsigned default '1' null,
	imageId int unsigned null,
	positionId varchar(255) null,
	weight varchar(255) null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null,
	constraint sample_prescriptions_ibfk_1
		foreign key (storeId) references stores (id),
	constraint sample_prescriptions_ibfk_2
		foreign key (branchId) references branches (id),
	constraint sample_prescriptions_ibfk_3
		foreign key (imageId) references images (id)
)
collate=utf8mb4_unicode_ci;

create table sample_prescription_to_products
(
	id int unsigned auto_increment
		primary key,
	productId int unsigned not null,
	samplePrescriptionId int unsigned not null,
	productUnitId int unsigned not null,
	dosage varchar(255) null,
	quantity int unsigned not null,
	storeId int unsigned null,
	branchId int unsigned null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null,
	constraint branchId
		foreign key (branchId) references branches (id),
	constraint productId
		foreign key (productId) references products (id),
	constraint productUnitId
		foreign key (productUnitId) references product_units (id),
	constraint samplePrescriptionId
		foreign key (samplePrescriptionId) references sample_prescriptions (id),
	constraint storeId
		foreign key (storeId) references stores (id)
)
collate=utf8mb4_unicode_ci;

create index branchId
	on sample_prescriptions (branchId);

create index positionId
	on sample_prescriptions (positionId);

create index storeId
	on sample_prescriptions (storeId);

create table specialists
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint specialists_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index storeId
	on specialists (storeId);

create index businessRegistrationImageId
	on stores (businessRegistrationImageId);

create index districtId
	on stores (districtId);

create index logoId
	on stores (logoId);

create index provinceId
	on stores (provinceId);

create index wardId
	on stores (wardId);

create table suppliers
(
	id int unsigned auto_increment
		primary key,
	name varchar(255) not null,
	code varchar(255) null,
	taxCode varchar(255) null,
	phone varchar(255) not null,
	email varchar(255) not null,
	companyName varchar(255) null,
	groupSupplierId int unsigned null,
	storeId int unsigned null,
	branchId int unsigned null,
	address varchar(255) null,
	wardId smallint unsigned null,
	districtId smallint unsigned null,
	provinceId tinyint unsigned null,
	note varchar(255) null,
	status int unsigned default '1' null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint suppliers_ibfk_1
		foreign key (storeId) references stores (id),
	constraint suppliers_ibfk_2
		foreign key (branchId) references branches (id),
	constraint suppliers_ibfk_3
		foreign key (groupSupplierId) references group_suppliers (id),
	constraint suppliers_ibfk_4
		foreign key (provinceId) references provinces (id),
	constraint suppliers_ibfk_5
		foreign key (districtId) references districts (id),
	constraint suppliers_ibfk_6
		foreign key (wardId) references wards (id)
)
charset=utf8mb3;

create table inbounds
(
	id int unsigned auto_increment
		primary key,
	code varchar(255) null,
	storeId int unsigned not null,
	branchId int unsigned not null,
	userId int unsigned not null,
	supplierId int unsigned null,
	totalPrice int unsigned default '0' not null,
	discount int unsigned default '0' null,
	paid int unsigned default '0' null,
	debt int unsigned default '0' null,
	paymentType enum('CASH', 'BANK', 'DEBT') null,
	description varchar(255) null,
	isVatInvoice tinyint(1) default 0 null,
	status enum('TRASH', 'DRAFT', 'SUCCEED', 'CANCELLED') default 'DRAFT' not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint inbounds_ibfk_1
		foreign key (storeId) references stores (id),
	constraint inbounds_ibfk_2
		foreign key (branchId) references branches (id),
	constraint inbounds_ibfk_3
		foreign key (userId) references users (id),
	constraint inbounds_ibfk_4
		foreign key (supplierId) references suppliers (id),
	constraint inbounds_ibfk_5
		foreign key (updatedBy) references users (id),
	constraint inbounds_ibfk_6
		foreign key (createdBy) references users (id)
)
charset=utf8mb3;

create index branchId
	on inbounds (branchId);

create index createdBy
	on inbounds (createdBy);

create index storeId
	on inbounds (storeId);

create index supplierId
	on inbounds (supplierId);

create index updatedBy
	on inbounds (updatedBy);

create index userId
	on inbounds (userId);

create table purchase_returns
(
	id int unsigned auto_increment
		primary key,
	code varchar(255) null,
	storeId int unsigned not null,
	branchId int unsigned not null,
	userId int unsigned not null,
	supplierId int unsigned null,
	totalPrice int unsigned default '0' not null,
	discount int unsigned default '0' null,
	paid int unsigned default '0' null,
	debt int unsigned default '0' null,
	paymentType enum('CASH', 'BANK', 'DEBT') null,
	description varchar(255) null,
	isVatInvoice tinyint(1) default 0 null,
	status enum('TRASH', 'DRAFT', 'SUCCEED', 'CANCELLED') default 'DRAFT' not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint purchase_returns_ibfk_1
		foreign key (storeId) references stores (id),
	constraint purchase_returns_ibfk_2
		foreign key (branchId) references branches (id),
	constraint purchase_returns_ibfk_3
		foreign key (userId) references users (id),
	constraint purchase_returns_ibfk_4
		foreign key (supplierId) references suppliers (id),
	constraint purchase_returns_ibfk_5
		foreign key (updatedBy) references users (id),
	constraint purchase_returns_ibfk_6
		foreign key (createdBy) references users (id)
)
charset=utf8mb3;

create index branchId
	on purchase_returns (branchId);

create index createdBy
	on purchase_returns (createdBy);

create index storeId
	on purchase_returns (storeId);

create index supplierId
	on purchase_returns (supplierId);

create index updatedBy
	on purchase_returns (updatedBy);

create index userId
	on purchase_returns (userId);

create index branchId
	on suppliers (branchId);

create index districtId
	on suppliers (districtId);

create index groupSupplierId
	on suppliers (groupSupplierId);

create index provinceId
	on suppliers (provinceId);

create index storeId
	on suppliers (storeId);

create index wardId
	on suppliers (wardId);

create table units
(
	id int unsigned auto_increment
		primary key,
	name varchar(255) not null,
	storeId int unsigned null,
	slug varchar(255) null,
	status int default 1 not null,
	createdAt datetime null,
	createdBy int null,
	updatedAt datetime null,
	updatedBy int null,
	deletedAt datetime null,
	constraint fk_units_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create index fk_units_1_idx
	on units (storeId);

create fulltext index address
	on wards (address);

create index districtId
	on wards (districtId);

create index provinceId
	on wards (provinceId, districtId);

create table warehouse_card
(
	id int unsigned auto_increment
		primary key,
	code varchar(100) null,
	type int unsigned null,
	partner varchar(255) null,
	createdAt datetime null,
	updatedAt datetime null,
	productId int unsigned not null,
	branchId int unsigned null,
	changeQty double null,
	remainQty double null,
	productUnitId int null
);

create index warehouse_card_branchId_index
	on warehouse_card (branchId);

create index warehouse_card_code_index
	on warehouse_card (code);

create index warehouse_card_productId_index
	on warehouse_card (productId);

create index warehouse_card_productUnitId_index
	on warehouse_card (productUnitId);

create table work_places
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	name varchar(255) not null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt datetime null,
	updatedAt datetime null,
	deletedAt datetime null,
	constraint work_places_ibfk_1
		foreign key (storeId) references stores (id)
)
charset=utf8mb3;

create table doctors
(
	id int unsigned auto_increment
		primary key,
	name varchar(255) not null,
	phone varchar(255) not null,
	code varchar(255) null,
	email varchar(255) null,
	gender enum('male', 'female', 'other') default 'other' null,
	avatarId int unsigned null,
	specialistId int unsigned null,
	levelId int unsigned null,
	workPlaceId int unsigned null,
	storeId int unsigned null,
	wardId smallint unsigned null,
	districtId smallint unsigned null,
	provinceId tinyint unsigned null,
	address varchar(255) null,
	note varchar(255) null,
	status int unsigned default '1' null,
	createdAt datetime null,
	updatedAt datetime null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	deletedAt datetime null,
	constraint doctors_ibfk_1
		foreign key (storeId) references stores (id),
	constraint doctors_ibfk_2
		foreign key (specialistId) references specialists (id),
	constraint doctors_ibfk_3
		foreign key (levelId) references levels (id),
	constraint doctors_ibfk_4
		foreign key (workPlaceId) references work_places (id),
	constraint doctors_ibfk_5
		foreign key (avatarId) references images (id),
	constraint doctors_ibfk_6
		foreign key (provinceId) references provinces (id),
	constraint doctors_ibfk_7
		foreign key (districtId) references districts (id),
	constraint doctors_ibfk_8
		foreign key (wardId) references wards (id)
)
charset=utf8mb3;

create index avatarId
	on doctors (avatarId);

create index districtId
	on doctors (districtId);

create index levelId
	on doctors (levelId);

create index provinceId
	on doctors (provinceId);

create index specialistId
	on doctors (specialistId);

create index storeId
	on doctors (storeId);

create index wardId
	on doctors (wardId);

create index workPlaceId
	on doctors (workPlaceId);

create table prescriptions
(
	id int unsigned auto_increment
		primary key,
	storeId int unsigned null,
	branchId int unsigned null,
	doctorId int unsigned null,
	code varchar(255) not null,
	name varchar(255) not null,
	gender enum('male', 'female', 'other') default 'other' null,
	age varchar(255) null,
	weight varchar(255) null,
	identificationCard varchar(255) null,
	healthInsuranceCard varchar(255) null,
	address varchar(255) null,
	supervisor varchar(255) null,
	phone varchar(255) null,
	diagnostic varchar(255) null,
	healthFacilityId int unsigned null,
	createdBy int unsigned null,
	updatedBy int unsigned null,
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null,
	constraint prescriptions_ibfk_1
		foreign key (storeId) references stores (id),
	constraint prescriptions_ibfk_2
		foreign key (branchId) references branches (id),
	constraint prescriptions_ibfk_3
		foreign key (doctorId) references doctors (id),
	constraint prescriptions_ibfk_4
		foreign key (healthFacilityId) references prescriptions (id)
)
charset=utf8mb3;

create index branchId
	on prescriptions (branchId);

create index doctorId
	on prescriptions (doctorId);

create index healthyFacilityId
	on prescriptions (healthFacilityId);

create index storeId
	on prescriptions (storeId);

create index storeId
	on work_places (storeId);


create table discounts
(
	id int unsigned auto_increment
		primary key,
	code varchar(255) not null,
    name varchar(255) not null,
	status enum('active','inactive') default 'active' not null,
	note varchar(255) null,
	isAllCustomer bool default false null,
	isAllBranch bool default false null,
    target enum('order','product') default 'order' not null,
    type enum('order_price','product_price','gift','loyalty','price_by_buy_number') default 'order_price' not null,
    isMultiple bool default true,
	storeId int unsigned not null,
	constraint fk_discounts_stores
		foreign key (storeId) references stores(id),
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
)
charset=utf8mb3;
create index storeId
	on discounts (storeId);

create table discount_branches(
    id int unsigned auto_increment
		primary key,
    discountId int unsigned not null,
	branchId int unsigned not null,
	constraint discountBranch_ibfk_1
		foreign key (discountId) references discounts(id),
	constraint discountBranch_ibfk_2
		foreign key (branchId) references branches(id)
)
charset=utf8mb3;
create index branchId
	on discount_branches (branchId);
create index discountId
	on discount_branches (discountId);


create table discount_customers(
    id int unsigned auto_increment
		primary key,
    discountId int unsigned not null,
	groupCustomerId int unsigned not null,
	constraint discountCustomer_ibfk_1
		foreign key (discountId) references discounts(id),
	constraint discountGroupCustomer_ibfk_2
		foreign key (groupCustomerId) references group_customers(id)
)
charset=utf8mb3;
create index customerId
	on discount_customers (groupCustomerId);
create index discountId
	on discount_customers (discountId);



create table discount_items(
    id int unsigned auto_increment
		primary key,
    discountId int unsigned null,
	orderFrom int unsigned null,
    fromQuantity int unsigned null,
    maxQuantity int unsigned null,
    discountValue int unsigned null,
    discountType enum('amount','percent') null,
    pointType enum('amount','percent') null,
    isGift bool default false null,
    pointValue int unsigned null,
	fixedPrice int unsigned null,
	changeType enum('type_discount','type_price') null,
	constraint discountItem_ibfk_1
		foreign key (discountId) references discounts(id)
)
charset=utf8mb3;
create index discountId
	on discount_items (discountId);



create table discount_times(
    id int unsigned auto_increment
		primary key,
    discountId int unsigned null,
	dateFrom date not null,
    dateTo date not null,
    byDay nvarchar(255) null,
    byMonth nvarchar(255) null,
    byHour nvarchar(255) null,
    byWeekDay nvarchar(255) null,
    isWarning bool default false null,
    isBirthday bool default false null,
	birthdayType enum('day','week','month') default 'day' null,
	constraint discountTime_ibfk_1
		foreign key (discountId) references discounts(id)
)
charset=utf8mb3;
create index discountId
	on discount_times (discountId);



create table product_discount_items(
    id int unsigned auto_increment
		primary key,
    discountItemId int unsigned not null,
	productUnitId int unsigned null,
    groupId int unsigned null,
    isCondition bool default true,
	constraint productDiscountItem_ibfk_1
		foreign key (discountItemId) references discount_items(id),
	constraint productDiscountItem_ibfk_2
		foreign key (groupId) references group_products(id),
	constraint productDiscountItem_ibfk_3
		foreign key (productUnitId) references product_units(id)
)
charset=utf8mb3;
create index discountItemId
	on product_discount_items(discountItemId);
create index productUnitId
	on product_discount_items(productUnitId);
create index groupId
	on product_discount_items(groupId);


create table discount_apply(
    id int unsigned auto_increment
		primary key,
    discountId int unsigned not null,
	orderId int unsigned null,
	constraint discountApply_ibfk_1
		foreign key (discountId) references discounts(id),
	constraint discountApply_ibfk_2
		foreign key (orderId) references orders(id)
)

charset=utf8mb3;
create index discountId
	on discount_apply(discountId);
create index orderId
	on discount_apply(orderId);


create table discount_configs(
    id int unsigned auto_increment
		primary key,
    isMergeDiscount boolean default false not null,
	isApplyOrder boolean default false not null,
	isAutoApply boolean default false not null,
	storeId int unsigned not null
)
charset=utf8mb3;
create index storeId
	on discount_configs(storeId);

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

create table type_cash_books(
    id int unsigned auto_increment primary key,
    name nvarchar(255) not null,
    description nvarchar(255) null,
    storeId int unsigned not null,
	constraint fk_type_cash_books
		foreign key (storeId) references stores(id),
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
)
charset=utf8mb3;
create index storeId
	on type_cash_books (storeId);

create table user_cash_books(
    id int unsigned auto_increment primary key,
    name nvarchar(255) not null,
    phone nvarchar(15) null,
    address nvarchar(255) null,
    wardId int unsigned null,
    districtId int unsigned null,
    provinceId int unsigned null,
    note nvarchar(255) null,
    storeId int unsigned not null,
	constraint fk_user_cash_books
		foreign key (storeId) references stores(id),
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
)
charset=utf8mb3;
create index storeId
	on user_cash_books (storeId);


create table cash_books(
    id int unsigned auto_increment primary key,
    ballotType enum('expenses','income') default 'expenses' not null,
    code nvarchar(15) not null,
    timeCreate timestamp null,
    typeId int unsigned not null,
    constraint fk_cash_books_1
		foreign key (typeId) references type_cash_books(id),
    value int unsigned not null,
    userId int unsigned not null,
    constraint fk_cash_books_2
		foreign key (userId) references users(id),
    object enum('customer','other','shipper','supplier','user') default 'other' not null,
    peopleId int unsigned not null,
    constraint fk_cash_books_3
		foreign key (peopleId) references user_cash_books(id),
    note nvarchar(255) null,
    isDebt boolean not null default true,
    branchId int unsigned not null,
    constraint fk_cash_books_4
		foreign key (branchId) references branches(id),
    createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
)
charset=utf8mb3;
create index typeId
	on cash_books (typeId);
create index userId
	on cash_books (userId);
create index peopleId
	on cash_books (peopleId);
create index branchId
	on cash_books (branchId);

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