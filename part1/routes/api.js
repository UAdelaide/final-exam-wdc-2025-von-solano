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

router.get('/dogs', async (req, res, next) => {
    try{
        const db = await mysql.createConnection(db_configuration);
        // get list of dogs and owner names
        const [rows] = await db.execute(`
            SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
            FROM Dogs
            JOIN Users ON Dogs.owner_id = Users.user_id
        `);
        res.json(rows);
    } catch (err){
        res.status(500).json({ error: 'database error.' });
    }
});

router.get('/walkrequests/open', async (req, res, next) => {
    try{
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
        res.json(rows);
    } catch(err){
        res.status(500).json({ error: 'database error.' });
    }
});

router.get('/walkers/summary', async (req, res, next) => {
    try{
        const db = await mysql.createConnection(db_configuration);
        // get walk request summary
        const [rows] = await db.execute(`
            SELECT Users.username AS walker_username,
            COUNT

        `);
        res.json(rows);
    } catch(err){
        res.status(500).json({ error: 'database error.' });
    }
});

module.exports = router;
