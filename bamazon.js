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
// Ask what they would like to buy.
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

      let choicesArray = [];
      for (let i = 0; i < res.length; i++) {
        choicesArray.push({
          name: `${res[i].product_name} (${res[i].description}) - $${res[i].price} `,
          value: res[i]
        });
      }
      choicesArray.push({ name: "Exit", value: "exit" });

      function didTheyAskToExit(answer) {
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
          validate: function (input) {
            const reg = /^\d+$/;
            return (reg.test(input) &&
              input != "0" ? true : "Enter a positive number.");
          },
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
          appCleanUp();
        }
        else if (!answer.confirmation) {
          console.log(`Sorry, please check out our other products.\n`);
          whatDoYouWantToBuy();
        }
        else {
          purchaseProduct(answer.product, answer.productNum);
        }
      });
    });

}
whatDoYouWantToBuy("grocery");


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
        console.log(`Thank you, your total purchase is $${totalPurchasePrice}.\n`);
      }
      whatDoYouWantToBuy("", false);
    });
}


