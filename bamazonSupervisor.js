const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');
const bamazon = require("./bamazon.js");

const connection = bamazon.connection;
const appCleanUp = bamazon.appCleanUp;
const validateWholeNumber = bamazon.validateWholeNumber;
const validateMoney = bamazon.validateMoney;


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
    SELECT  departments.department_id AS id, 
    departments.department_name AS department,
    FORMAT(departments.over_head_costs, 2) AS over_head,
    FORMAT(products.total_product_sales, 2) AS product_sales,
    FORMAT(products.total_product_sales - departments.over_head_costs, 2) AS total_profit
    FROM departments
    LEFT JOIN products
    ON departments.department_name = products.department_name
    GROUP BY departments.department_name 
    ORDER BY departments.department_id;`, function (err, res) {

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
            validate: validateMoney
        }
    ]).then(answer => {
        console.log("overhead = " + answer.overhead);
        connection.query("INSERT INTO departments SET ?",
            {
                department_name: answer.name,
                over_head_costs: answer.overhead
            }, function (err, res) {
                if (err) {
                    console.log(err);
                    throw err;
                }

                //console.clear();
                console.log(`${answer.name} has been added.`);
                whatDoYouWantToDo(false);
            }
        );
    });
}


