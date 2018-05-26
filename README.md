# bamazon
Node command line program that implements a simple fake amazon for a homework assignment.

'''
CREATE DATABASE bamazon

CREATE TABLE products (
	item_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL,
	product_name VARCHAR(100) NOT NULL,
	department_name VARCHAR(100) NOT NULL,
	description VARCHAR(100) NOT NULL,
	stock_quantity INT DEFAULT 1,
	price INT DEFAULT 1,
	total_product_sales INT DEFAULT 0
);
CREATE TABLE departments (
	department_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE,
	department_name VARCHAR(100) NOT NULL,
	over_head_costs INT DEFAULT 0
);
'''
