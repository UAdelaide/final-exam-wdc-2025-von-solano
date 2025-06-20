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

router.get('/dogs', function(req, res, next) {
    try{
        const db = await mysql.createConnection
    }
});

module.exports = router;
