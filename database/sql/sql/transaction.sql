create table type_transactions(
    id int unsigned auto_increment primary key,
    name nvarchar(255) not null,
    description nvarchar(255) null,
    ballotType enum('expenses','income') default 'expenses' not null,
    storeId int unsigned not null,
	constraint fk_type_transactions
		foreign key (storeId) references stores(id),
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
)
charset=utf8mb3;
create index storeId
	on type_transactions (storeId);

create table user_transactions(
    id int unsigned auto_increment primary key,
    name nvarchar(255) not null,
    phone nvarchar(15) null,
    address nvarchar(255) null,
    wardId int unsigned null,
    districtId int unsigned null,
    provinceId int unsigned null,
    note nvarchar(255) null,
    storeId int unsigned not null,
	constraint fk_user_transactions
		foreign key (storeId) references stores(id),
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	deletedAt timestamp null
)
charset=utf8mb3;
create index storeId
	on user_transactions (storeId);

create table transactions(
  id int unsigned auto_increment primary key,
  ballotType enum('expenses','income') default 'expenses' not null,
  code nvarchar(15) not null,
  paymentDate timestamp null,
  typeId int unsigned not null,
  constraint fk_transactions_1
  foreign key (typeId) references type_transactions(id),
  value int unsigned not null,
  createdBy int unsigned not null,
  constraint fk_transactions_2
  foreign key (createdBy) references users(id),
  target enum('customer','other','branch','supplier','user') default 'other' not null,
  targetId int unsigned not null,
  note nvarchar(255) null,
  isDebt boolean not null default true,
  branchId int unsigned not null,
  constraint fk_transactions_4
  foreign key (branchId) references branches(id),
  createdAt timestamp default CURRENT_TIMESTAMP not null,
  updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
  deletedAt timestamp null
)
charset=utf8mb3;
create index typeId
	on transactions (typeId);
create index createdBy
	on transactions (createdBy);
create index targetId
	on transactions (targetId);
create index branchId
	on transactions (branchId);    
