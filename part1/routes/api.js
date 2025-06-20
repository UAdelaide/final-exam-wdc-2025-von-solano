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
        const [rows] = await db.execute(`
            SELECT WalkRequests.request_id,
            Dogs.name AS dog_name,
            WalkRequests.request
        `);

    } catch(err){
        res.status(500).json({ error: 'database error.' });
    }
});

module.exports = router;
