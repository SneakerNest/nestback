create database if not exists `sneaker_nest`;

use sneaker_nest;


create table if not exists `Address` (
	`addressID` int not null auto_increment unique,
	`addressTitle` varchar(64) not null,
	`country` varchar(64) not null,
	`city` varchar(64) not null,
	`province` varchar(64),
	`zipCode` varchar(10) not null,
	`streetAddress` varchar(255) not null,
	`longitude` decimal(10,8),
	`latitude` decimal(8,6),
	primary key (`addressID`)
);


create table if not exists `Supplier` (
	`supplierID` int NOT NULL AUTO_INCREMENT unique,
	`name` varchar(64) NOT NULL,
	`phone` BIGINT not null,
	`timeJoined` timestamp not null default CURRENT_TIMESTAMP,
	`addressID` int NOT NULL,
	PRIMARY KEY (`supplierID`),
	FOREIGN KEY (`addressID`) REFERENCES `Address`(`addressID`) ON DELETE RESTRICT
);

create table if not exists `Product` (
	`productID` int not null auto_increment unique,
	`stock` int not null,
	`name` varchar(255) not null,
	`unitPrice` decimal(8,2) not null,
	`overallRating` decimal(2,1) not null default 0,
	`discountPercentage` int(3) not null default 0,
	`description` text,
	`timeListed` timestamp not null default current_timestamp,
	`brand` varchar(64),
	`color` varchar(64),
	`showProduct` boolean default true,
	`supplierID` int not null,
	`material` varchar(64),
	`warrantyMonths` int(3) not null default 0,
	`serialNumber` varchar(64),
	`popularity` int(3) not null default 0,
	primary key (`productID`),
	foreign key (`supplierID`) references `Supplier` (`supplierID`) on delete restrict
);

create table if not exists `Pictures` (
	`productID` int not null,
	`picturePath` varchar(255) not null, 
	primary key (`productID`, `picturePath`),
	foreign key (`productID`) references `Product` (`productID`) on delete cascade
);

create table if not exists `Category` (
	/* Main categories have parentCategoryID = 0 */
	/* Subcategories under Sneakers have parentCategoryID = 1 */
	/* Subcategories under Casual have parentCategoryID = 2 */
	/* Subcategories under Boots have parentCategoryID = 3 */
	/* Subcategories under SlipperSandals Bags have parentCategoryID = 4 */
	`categoryID` int not null auto_increment unique,
	`name` varchar(64) not null,
	`description` text,
	`parentCategoryID` int not null default 0,
	`timeCreated` timestamp not null default current_timestamp,
	`image` varchar(255),
	primary key (`categoryID`)
);

create table if not exists `CategoryCategorizesProduct` ( 
	`categoryID` int not null,
	`productID` int not null,
	primary key (`categoryID`, `productID`),
	foreign key (`categoryID`) references `Category` (`categoryID`) on delete cascade,
	foreign key (`productID`) references `Product` (`productID`) on delete cascade
);

create table if not exists `USERS` (
    `name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL
);

create table if not exists `ProductManager` (
	`username` varchar(64) NOT NULL unique,
	`supplierID` int NOT NULL,
	PRIMARY KEY (`username`),
	FOREIGN KEY (`username`) REFERENCES USERS(`username`) on delete cascade,
	FOREIGN KEY (`supplierID`) REFERENCES Supplier(`supplierID`) on delete cascade
);

create table if not exists `SalesManager` (
	`username` varchar(64) NOT NULL unique,
	`supplierID` int NOT NULL,
	PRIMARY KEY (`username`),
	FOREIGN KEY (`username`) REFERENCES USERS(`username`) on delete cascade,
	FOREIGN KEY (`supplierID`) REFERENCES Supplier(`supplierID`) on delete cascade
);

create table if not exists `Customer` (
    `customerID` int not null auto_increment unique,
    `username` varchar(64) not null,
    `addressID` int not null,
    `timeJoined` timestamp not null default current_timestamp,
    `phone` BIGINT,
    `taxID` varchar(20),
    primary key (`customerID`),
    foreign key (`username`) references USERS(`username`) on delete cascade,
    foreign key (`addressID`) references Address(`addressID`) on delete restrict
);

create table if not exists `Wishlist` (
	`wishlistID` int not null auto_increment unique,
	`customerID` int not null,
	primary key (`wishlistID`, `customerID`),
	foreign key (`customerID`) references Customer(`customerID`) on delete cascade
);

create table if not exists `WishlistItems` (
	`wishlistID` int not null,
	`productID` int not null,
	`addedTime` timestamp not null default current_timestamp,
	primary key (`wishlistID`, `productID`),
	foreign key (`wishlistID`) references Wishlist(`wishlistID`) on delete cascade,
	foreign key (`productID`) references Product(`productID`) on delete cascade
);


create table if not exists `BillingInfo` (
    	`billingID` int not null auto_increment unique,
    	`customerID` int not null,
    	`creditCardNo` varchar(64) not null, /* Encrypt credit card number using SHA256 */
    	`creditCardEXP` varchar(5) not null, /* Enforced format mm/yy */
    	/* no CVV cuz it's prohibited by PCI DSS */
	`addressID` int not null,
    	primary key (`billingID`),
    	foreign key (`customerID`) references Customer(`customerID`) on delete cascade,
	foreign key (`addressID`) references Address(`addressID`) on delete restrict,
    	check (`creditCardEXP` regexp '^(0[1-9]|1[0-2])/([0-9]{2})$'), /* Enforce mm/yy format */
	check (LENGTH(`creditCardNo`) >= 60 )
);

create table if not exists `Cart` (
	`cartID` int NOT NULL AUTO_INCREMENT unique,
	`totalPrice` decimal(8,2) NOT NULL default 0,
	`numProducts` int NOT NULL default 0,
	`fingerprint` varchar(255),
	`temporary` boolean NOT NULL default true,			/* probably remove this*/
	`timeCreated` timestamp not null default CURRENT_TIMESTAMP, /* So that we can tell when to delete it */
	`customerID` int,									/* probably remove this*/
	PRIMARY KEY (`cartID`),
	FOREIGN KEY (`customerID`) REFERENCES `Customer`(`customerID`) ON DELETE CASCADE /* probably remove this*/
);

create table if not exists `CartContainsProduct` (
	`cartID` int NOT NULL,
	`productID` int not null,
	`quantity` int not null,
	PRIMARY KEY (`cartID`, `productID`),
	FOREIGN KEY (`cartID`) REFERENCES `Cart`(`cartID`) ON DELETE CASCADE,
	FOREIGN KEY (`productID`) REFERENCES `Product`(`productID`) ON DELETE CASCADE
);

create table if not exists `ProdManagerCreatesCategory` (
	`creationDate` timestamp NOT NULL default CURRENT_TIMESTAMP,
	`productManagerUsername` varchar(64) NOT NULL,
	`categoryID` int not null,
	FOREIGN KEY (`productManagerUsername`) REFERENCES `ProductManager`(`username`) ON DELETE cascade,
	FOREIGN KEY (`categoryID`) REFERENCES `Category`(`categoryID`) ON DELETE cascade,
	PRIMARY KEY (`productManagerUsername`,`categoryID`)
);

create table if not exists `ProductManagerRestocksProduct` (
	`productID` INT NOT NULL,
	`productManagerUsername` varchar(64) not null,
	`quantity` int,
	`restockTime` timestamp not null default CURRENT_TIMESTAMP,
	FOREIGN KEY (`productManagerUsername`) REFERENCES `ProductManager`(`username`) on delete restrict,
	FOREIGN KEY (`productID`) REFERENCES `Product`(`productID`) on delete cascade,
	primary key (`productID`, `productManagerUsername`, `restockTime`)
);

CREATE TABLE IF NOT EXISTS `SalesManagerManagesPriceProduct` (
	`productID` INT NOT NULL,
	`newPrice` DECIMAL(8, 2),
	`updateTime` TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
	`discountPercent` INT(3) default 0, 
	`salesManagerUsername` varchar(64) not null,
	FOREIGN KEY (`productID`) REFERENCES `Product`(`productID`) ON DELETE cascade, 
	foreign key(`salesManagerUsername`) references `SalesManager`(`username`) on delete restrict,
	primary key (`productID`, `salesManagerUsername`, `updateTime`)
);

create table if not exists `Review` (
	`reviewID` INT NOT NULL AUTO_INCREMENT unique,
	`reviewContent` TEXT,
	`reviewStars` INT,
	/* CustomerWritesReview relationship */
	`customerID` INT NOT NULL,
	/* ReviewRatesProduct relationship */
	`productID` INT NOT NULL,
	/* ProdManagerApprovesReview relationship */
	`productManagerUsername` varchar(64),
	`approvalStatus` INT DEFAULT 0, /* 0=pending, 1=approved, 2=rejected */
	FOREIGN KEY (`productManagerUsername`) REFERENCES `ProductManager`(`username`) on delete restrict,
	FOREIGN KEY (`customerID`) REFERENCES `Customer`(`customerID`) on delete no action,
	FOREIGN KEY (`productID`) REFERENCES `Product`(`productID`) on delete cascade,
	primary key (`reviewID`),
	CHECK (`reviewStars` BETWEEN 1 AND 5)
);


DELIMITER //