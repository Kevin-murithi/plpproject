CREATE DATABASE IF NOT EXISTS foodwaste;

USE foodwaste;

CREATE TABLE IF NOT EXISTS Admin (
    admin_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NULL,
    password VARCHAR(100) NULL
);


CREATE TABLE IF NOT EXISTS Users (
    user_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NULL,
    password VARCHAR(100) NULL,
    email VARCHAR(100) NULL
);

CREATE TABLE IF NOT EXISTS Business (
    biz_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NULL,
    category VARCHAR(100) NULL,
    password VARCHAR(100) NULL,
    email VARCHAR(100) NULL
);


CREATE TABLE IF NOT EXISTS food_listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    amount INT NOT NULL,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);