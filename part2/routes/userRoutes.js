const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // get user_id, username, and role from username and password login credentials
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // create user session
    req.session.user = rows[0]; // store current user in session

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST logout
router.post('/logout', async (req, res) => {
  // destroy current user session to logout
  req.session.destroy((err) => {
    if(err){
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // erases cookie data
    return res.status(200).json({ message: 'Logout successful' });
  });
});

// GET dogs from part 1
router.get('/dogs', async (req, res, next) => {
  try{
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

module.exports = router;
