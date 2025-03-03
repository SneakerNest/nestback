/* Creating database for the website*/
create database if not exists SneakerNest;
use SneakerNest;

/* User table */ 
CREATE TABLE if not exists `User`(
    `name` VARCHAR(64) NOT NULL,  
    `userName` VARCHAR(64) NOT NULL UNIQUE, 
    `password` VARCHAR(64) NOT NULL,  /* Encrypt password using SHA256 */
    `email` VARCHAR(64) NOT NULL UNIQUE, /* Always same format */
    PRIMARY KEY (`userName`),
    CONSTRAINT `chk_valid_email_user` CHECK (`email` LIKE '%_@__%.__%'), 
    CONSTRAINT `chk_encrypted_password` CHECK (LENGTH(`password`) >= 60) 
);