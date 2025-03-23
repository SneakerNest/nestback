create database if not exists `sneaker_nest`;

use sneaker_nest;

create table if not exists USERS (
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

create table if not exists ProductManager (
	username varchar(64) NOT NULL unique,
	PRIMARY KEY (username),
	FOREIGN KEY (username) REFERENCES USERS(username) on delete cascade
);

create table if not exists SalesManager (
	username varchar(64) NOT NULL unique,
	PRIMARY KEY (username),
	FOREIGN KEY (username) REFERENCES USERS(username) on delete cascade
);

DELIMITER //