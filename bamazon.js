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

// function passed to inquirer prompts to check if it is a number
function validateWholeNumber(input) {
  const reg = /^\d+$/;
  return (reg.test(input) ? true : "Enter a positive number.");
}
function validateNumber(input) {
  const reg = /^-{0,1}\d+$/;
  return (reg.test(input) ? true : "Enter an integer.");
}
function validateMoney (input) {
  const reg = /^\d+(?:\.{0,1}\d{0,2})$/;
  return (reg.test(input)? true : "Enter a number without $.");
}

// exporting a couple little helpful functions
exports.connection = connection;
exports.appCleanUp = appCleanUp;
exports.validateNumber = validateNumber;
exports.validateWholeNumber = validateWholeNumber;
exports.validateMoney = validateMoney;

//
// Ask what they would like to buy.
// Inputs: department can be used to filter product results by department
// clearBeforePrint indicates if we want to clear the console screen before printing results
//
function whatDoYouWantToBuy(department = "", clearBeforePrint = true) {
  if (clearBeforePrint) {
    console.clear();
  }

  if (department) {
    department = ` AND department_name = "${department}"`;
  }

  // get available products to buy
  connection.query(`SELECT * FROM products WHERE stock_quantity > 0 ${department};`,
    function (err, res) {

      if (err) { throw err; }

      // creating an array of the products formatted to
      // be provided to inquirer list prompt
      let choicesArray = [];
      for (let i = 0; i < res.length; i++) {
        choicesArray.push({
          name: `${res[i].product_name} (${res[i].description}) - $${res[i].price.toFixed(2)} `,
          value: res[i]
        });
      }
      // add exit as an option to the array
      choicesArray.push({ name: "Exit", value: "exit" });

      // function to check if exit was chosen - checked by 
      // subsequent prompts to know if they should fire
      function didTheyAskToExit(answer) {
        // returning false since inquirer wants to know if it
        // should continue with the prompt
        return (answer.product == "exit" ? false : true);
      }

      inquirer.prompt([
        {
          type: "list",
          message: "What would you like to buy?",
          name: "product",
          choices: choicesArray
        },
        {
          type: "input",
          message: "How many would you like?",
          name: "productNum",
          validate: validateWholeNumber,
          when: didTheyAskToExit
        },
        {
          type: "confirm",
          message: function (answers) {
            return `Are you sure you want to buy ${answers.productNum} ${answers.product.product_name}?`;
          },
          name: "confirmation",
          when: didTheyAskToExit
        }
      ]).then(answer => {
        if (answer.product == "exit") {
          appCleanUp(); // kill the connection
        }
        else if (!answer.confirmation) {
          // they said they wanted to order, but they didn't
          // confirm so we present them the product list again
          console.clear();
          console.log(`Sorry, please check out our other products.\n`);
          whatDoYouWantToBuy("", false);
        }
        else {
          purchaseProduct(answer.product, answer.productNum);
        }
      });
    });

}

// only run if not called as a require
// other modules might be using some of the little 
// helper functions and we don't want to run this app
if (require.main === module) {
whatDoYouWantToBuy("");
}


function purchaseProduct(product, quantity) {
  let totalPurchasePrice = quantity * product.price;
  connection.query(
    `UPDATE products 
    SET stock_quantity = stock_quantity-?, 
    total_product_sales = total_product_sales+?  
    WHERE item_id = ? AND stock_quantity >= ?;`,
    [quantity, totalPurchasePrice, product.item_id, quantity],
    function (err, res) {
      if (err) {
        console.log(err);
        throw err;
      }

      console.clear();

      if (!res.affectedRows && !res.changedRows) { // no rows were changed/affected
        console.log(`Sorry, insufficient stock on hand, we only have ${product.stock_quantity}.\n`);
      }
      else {
        console.log(`Thank you, your total purchase is $${totalPurchasePrice.toFixed(2)}.\n`);
      }
      whatDoYouWantToBuy("", false);
    });
}


