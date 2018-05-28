const inquirer = require("inquirer");
const mysql = require("mysql");

//
//  The connection needed for the database
//
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});
function appCleanUp() {
    connection.end();
}


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

    connection.query(`SELECT * FROM products ${condition};`,
        function (err, res) {

            for (let i = 0; i < res.length; i++) {
                console.log(`${res[i].item_id}: ${res[i].product_name} (${res[i].description}) - $${res[i].price} - Qty: ${res[i].stock_quantity}`);
            }

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
                validate: function (input) {
                    if (parseFloat(input) == NaN) {
                        return "Enter a price without $.";
                    }
                    return true;
                },
            },
            {
                type: "input",
                message: "Initial Stock Quantity: ",
                name: "quantity",
                validate: function (input) {
                    const reg = /^\d+$/;
                    return (reg.test(input) ? true : "Enter a positive number.");
                },
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
                name: `${res[i].product_name} (${res[i].description}) - $${res[i].price} - Qty: ${res[i].stock_quantity}`,
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
                validate: function (input) {
                    const reg = /^[\-\+]?\d+$/;
                    return (reg.test(input) ? true : "Enter a number.");
                },
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


