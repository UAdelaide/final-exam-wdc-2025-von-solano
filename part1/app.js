var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);


let db;

(async () => {
    try {
        // Connect to MySQL without specifying a database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '' // Set your MySQL root password
        });

        // Create the database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService;');
        await connection.end();

        // Now connect to the created database
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'DogWalkService'
        });

        // Create a table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('owner', 'walker') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
    `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS Dogs (
                dog_id INT AUTO_INCREMENT PRIMARY KEY,
                owner_id INT NOT NULL,
                name VARCHAR(50) NOT NULL,
                size ENUM('small', 'medium', 'large') NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES Users(user_id)
            );
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS WalkRequests (
                request_id INT AUTO_INCREMENT PRIMARY KEY,
                dog_id INT NOT NULL,
                requested_time DATETIME NOT NULL,
                duration_minutes INT NOT NULL,
                location VARCHAR(255) NOT NULL,
                status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
            );
        `);

        // insert data
        const [user_rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
        if (user_rows[0].count === 0){
            await db.execute(`
                INSERT INTO Users (username, email, password_hash, role)
                VALUES
                ('alice123', 'alice@example.com', 'hashed123', 'owner'),
                ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
                ('carol123', 'carol@example.com', 'hashed789', 'owner'),
                ('lebronjames', 'lebron@example.com', 'hashed23', 'owner'),
                ('bronnyjames', 'bronny@example.com', 'hashed9', 'walker');

            `);
        }

        const [dog_rows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
        if (dog_rows[0].count === 0){
            await db.execute(`
                INSERT INTO Dogs (owner_id, name, size)
                VALUES
                ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
                ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
                ((SELECT user_id FROM Users WHERE username = 'lebronjames'), 'Terry', 'small'),
                ((SELECT user_id FROM Users WHERE username = 'lebronjames'), 'Michael', 'large'),
                ((SELECT user_id FROM Users WHERE username = 'lebronjames'), 'Steven', 'small');
            `);
        }

        const [request_rows] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
        if (request_rows[0].count === 0){
            await db.execute(`
                INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
                VALUES
                ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Terry'), '2025-06-10 09:15:00', 60, 'Hillside Road', 'completed'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Michael'), '2025-06-10 10:00:00', 40, 'Walk Terrace', 'cancelled'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Steven'), '2025-06-10 10:30:00', 20, 'Lakesview Street', 'cancelled');
            `);
        }
    } catch (err) {
        console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
    }
})();

module.exports = app;
