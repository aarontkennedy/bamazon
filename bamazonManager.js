const inquirer = require("inquirer");
const mysql = require("mysql");
const bamazon = require("./bamazon.js");
const cTable = require('console.table');

const connection = bamazon.connection;
const appCleanUp = bamazon.appCleanUp;
const validateWholeNumber = bamazon.validateWholeNumber;
const validateMoney = bamazon.validateMoney;
const validateNumber = bamazon.validateNumber;

//
// Ask what they would like to.
//
function whatDoYouWantToDo(clearBeforePrint = true) {
    console.log(`\n`);

    if (clearBeforePrint) {
        console.clear();
    }

    inquirer.prompt([
        {
            type: "list",
            message: "What do you want to do?",
            name: "menuChoice",
            choices: ["View Products for Sale",
                "View Low Inventory",
                "Adjust Inventory",
                "Add New Product",
                "Exit"]
        }
    ]).then(answer => {
        switch (answer.menuChoice) {
            case "View Products for Sale":
                viewProductsForSale();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Adjust Inventory":
                adjustInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Exit":
            default:
                appCleanUp();
        }
    });
}
whatDoYouWantToDo();

function viewProductsForSale(condition = "") {
    console.clear();

    connection.query(`SELECT 
    item_id AS id,
    product_name AS product,
    description,
    FORMAT(price, 2) AS price,
    stock_quantity AS quantity
    FROM products ${condition};`,
        function (err, res) {

            console.table(res);

            whatDoYouWantToDo(false);
        });
}

function viewLowInventory() {
    console.log("Low Inventory: ");
    viewProductsForSale("WHERE stock_quantity < 5 ");
}

function addNewProduct() {
    // get departments
    connection.query(`SELECT * FROM departments;`, function (err, res) {
        if (err) { throw err; }

        let choicesArray = [];
        for (let i = 0; i < res.length; i++) {
            choicesArray.push(res[i].department_name);
        }

        inquirer.prompt([
            {
                type: "list",
                message: "Select department for new product.",
                name: "department",
                choices: choicesArray
            },
            {
                type: "input",
                message: "Product Name: ",
                name: "name",
                validate: function (input) {
                    if (input) {
                        return true;
                    }
                    return false;
                },
            },
            {
                type: "input",
                message: "Product Description: ",
                name: "description",
                default: ""
            },
            {
                type: "input",
                message: "Sale Price: ",
                name: "price",
                validate: validateMoney
            },
            {
                type: "input",
                message: "Initial Stock Quantity: ",
                name: "quantity",
                validate: validateWholeNumber
            }
        ]).then(answer => {
            connection.query("INSERT INTO products SET ?",
                {
                    product_name: answer.name,
                    department_name: answer.department,
                    description: answer.description,
                    stock_quantity: answer.quantity,
                    price: answer.price
                }, function (err, res) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }

                    console.clear();
                    console.log(`${answer.name} has been added.`);
                    whatDoYouWantToDo(false);
                }
            );
        });
    });
}

function adjustInventory() {
    console.clear();

    // get products
    connection.query(`SELECT * FROM products;`, function (err, res) {
        if (err) { throw err; }

        let choicesArray = [];
        for (let i = 0; i < res.length; i++) {
            choicesArray.push({
                name: `${res[i].product_name} (${res[i].description}) - $${res[i].price.toFixed(2)} - Qty: ${res[i].stock_quantity}`,
                value: res[i]
            });
        }

        inquirer.prompt([
            {
                type: "list",
                message: "Select product to increase inventory.",
                name: "product",
                choices: choicesArray
            },
            {
                type: "input",
                message: "Increase inventory by?",
                name: "productNum",
                validate: validateNumber  // this way they can subtract with a negative to account for product theft...
            }
        ]).then(answer => {
            connection.query(
                `UPDATE products 
                SET stock_quantity = stock_quantity+?  
                WHERE item_id = ?;`,
                [answer.productNum, answer.product.item_id], function (err, res) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }

                    console.clear();
                    console.log(`Product inventory has now been updated.`);
                    whatDoYouWantToDo(false);
                }
            );
        });
    });
}


