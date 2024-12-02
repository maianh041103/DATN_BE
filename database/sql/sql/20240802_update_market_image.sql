DROP TABLE market_images;

CREATE TABLE market_images(
    id int unsigned primary key auto_increment,
    storeId int unsigned not null,
    constraint market_images_1
    foreign key(storeId) references stores(id),
    imageBannerId nvarchar(255) not null,
    imageTopId nvarchar(255) not null,
    imageBottomId nvarchar(255) not null,
    createdAt datetime null,
    updatedAt datetime null,
    deletedAt datetime null
);