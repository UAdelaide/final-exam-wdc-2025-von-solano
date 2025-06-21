var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise');

// database connection
const db_configuration = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
};

// GET request to get all dogs
router.get('/dogs', async (req, res, next) => {
    try {
        // create database connection
        const db = await mysql.createConnection(db_configuration);
        // get list of dogs and owner names
        const [rows] = await db.execute(`
            SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
            FROM Dogs
            JOIN Users ON Dogs.owner_id = Users.user_id
        `);
        res.json(rows); // return list of dogs
    } catch (err){
        res.status(500).json({ error: 'database error.' });
    }
});

// GET request to get open walk requests
router.get('/walkrequests/open', async (req, res, next) => {
    try {
        // create database connection
        const db = await mysql.createConnection(db_configuration);
        // get walk request details which are open
        const [rows] = await db.execute(`
            SELECT WalkRequests.request_id,
            Dogs.name AS dog_name,
            WalkRequests.requested_time,
            WalkRequests.duration_minutes,
            WalkRequests.location,
            Users.username AS owner_username

            FROM WalkRequests
            JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
            JOIN Users ON Dogs.owner_id = Users.user_id
            WHERE WalkRequests.status = 'open'
        `);
        res.json(rows); // return list open walk requests
    } catch(err){
        res.status(500).json({ error: 'database error.' });
    }
});

// GET request to summarise walker stats
router.get('/walkers/summary', async (req, res, next) => {
    try {
        // create database connection
        const db = await mysql.createConnection(db_configuration);
        // get walk request summary... counts ratings, averages walk ratings
        const [rows] = await db.execute(`
            SELECT Users.username AS walker_username,
            COUNT(WalkRatings.rating) AS total_ratings,
            AVG(WalkRatings.rating) AS average_rating,
            COUNT(CASE WHEN WalkRequests.status = 'completed' THEN 1 END) AS completed_walks
            FROM Users
            LEFT JOIN WalkRatings ON Users.user_id = WalkRatings.walker_id
            LEFT JOIN WalkRequests ON WalkRequests.request_id = WalkRatings.request_id
            WHERE Users.role = 'walker' GROUP BY Users.username
        `);
        res.json(rows); // return list of walker summary
    } catch(err){
        res.status(500).json({ error: 'database error.' });
    }
});

module.exports = router;
