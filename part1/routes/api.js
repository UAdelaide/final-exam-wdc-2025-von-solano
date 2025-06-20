var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise');

const db = {
    host: 'localhost',
    user: 'root',
    password: ''
}

router.get('/dogs', function(req, res, next) {
    try{

    }
});

module.exports = router;
