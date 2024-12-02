CREATE TABLE user_branches(
	id int unsigned primary key auto_increment,
    userId int unsigned not null,
    branchId int unsigned not null
);
