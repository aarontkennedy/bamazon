module.exports = Products;

function Products(mysqlConnection) {
    this.connection = mysqlConnection;
}

Products.prototype.prettyPrint = function (p) {
    console.log(`${p.item_id} ${p.product_name} $${p.price}`);
}

Products.prototype.getAll = function (callback) {
    this.connection.query("SELECT * FROM products", function (err, res) {
        if (err) { throw err; }
        if (callback) {
            callback(res);
        }
        return res;
    });
}

Products.prototype.printAll = function () {
    let self = this;
    this.getAll(function (products) {
        for (let i = 0; i < products.length; i++) {
            self.prettyPrint(products[i]);
        }
    });
}