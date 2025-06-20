var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise');

// database connection
const db = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
}

router.get('/dogs', async (req, res, next) {
    try{
        const db = await mysql.createConnection(db);
        const [rows] = await db.execute(`
            SELECT Dogs.name, Dogs.size, Users.username
            FROM Dogs
            JOIN Users ON Dogs.owner_id = Users.user_id
        `);
        res.json(rows);
    } catch (err)
});

module.exports = router;
