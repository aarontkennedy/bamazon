const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');


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
            choices: ["View Product Sales by Department",
                "Create New Department",
                "Exit"]
        }
    ]).then(answer => {
        switch (answer.menuChoice) {
            case "View Product Sales by Department":
                viewProductSalesByDepartment();
                break;
            case "Create New Department":
                createNewDepartment();
                break;
            case "Exit":
            default:
                appCleanUp();
        }
    });
}
whatDoYouWantToDo();

function viewProductSalesByDepartment() {
    console.clear();

    connection.query(`
    SELECT  departments.department_id, 
    departments.department_name,
    departments.over_head_costs,
    products.total_product_sales,
    products.total_product_sales - departments.over_head_costs AS total_profit
    FROM departments
    INNER JOIN products
    WHERE departments.department_name = products.department_name
    GROUP BY departments.department_name;`, function (err, res) {

            console.table(res);

            whatDoYouWantToDo(false);
        });
}

function createNewDepartment() {

    inquirer.prompt([
        {
            type: "input",
            message: "Department Name: ",
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
            message: "Overhead Costs: ",
            name: "overhead",
            validate: function (input) {
                if (parseFloat(input) == NaN) {
                    return "Enter number without $.";
                }
                return true;
            },
        }
    ]).then(answer => {
        connection.query("INSERT INTO departments SET ?",
            {
                department_name: answer.name,
                over_head_costs: answer.overhead
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
}


