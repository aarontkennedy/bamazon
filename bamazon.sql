DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    `item_id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`product_name` VARCHAR(100) NOT NULL,
	`department_name` VARCHAR(100) NOT NULL,
	`description` VARCHAR(500) NOT NULL,
	`stock_quantity` INT DEFAULT 1,
	`price` DECIMAL(15,2) DEFAULT 1,
	`total_product_sales` DECIMAL(15,2) DEFAULT 0
);
CREATE TABLE departments (
	`department_id` INT PRIMARY KEY AUTO_INCREMENT,
	`department_name` VARCHAR(100) NOT NULL,
	`over_head_costs` DECIMAL(15,2) DEFAULT 0
);