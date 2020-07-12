const mysql = require('mysql')

const dotenv = require('dotenv');
dotenv.config();

var connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'headphone_quality'
})

connection.connect(function(err) {
    if (err) throw err;
    console.log("Database connection established successfully!");
});

module.exports = connection