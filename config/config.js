const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '12345678',
  database: 'tourist_spots_db', // Change to your database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = db;
