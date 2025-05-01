const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('../db'); // Assumes db is a configured instance of `pg.Pool`
const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
    const {
        username,
        email,
        password,
        phone,
        first_name,
        last_name,
        account_type,
        description,
        instagram_handle,
    } = req.body;

    try {
        // Check if the username or email already exists
        const existingUserQuery = 'SELECT * FROM users WHERE username = $1 OR email = $2';
        const existingUserResult = await db.query(existingUserQuery, [username, email]);

        if (existingUserResult.rows.length > 0) {
            req.flash('error', 'Registration failed. Please contact support.');
            return res.redirect('/register');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const insertUserQuery = `
            INSERT INTO users (
                username, email, password, phone, first_name, last_name,
                account_type, description, instagram_handle
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`;
        await db.query(insertUserQuery, [
            username,
            email,
            hashedPassword,
            phone || null,
            first_name || null,
            last_name || null,
            account_type || null,
            description || null,
            instagram_handle || null,
        ]);

        res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Fetch the user by username
        const fetchUserQuery = 'SELECT * FROM users WHERE username = $1';
        const userResult = await db.query(fetchUserQuery, [username]);

        if (userResult.rows.length === 0) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('login');
        }

        const user = userResult.rows[0];

        // Check if the password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');
        }

        // Create a session
        req.session.user = { user_id: user.user_id, username: user.username, account_type: user.account_type };
        res.redirect('/home');
    } catch (error) {
        console.error('Error during login:', error.message);
        req.flash('error', 'Invalid username or password');
        res.status(500).redirect('login');
    }
});

module.exports = router;