const express = require('express');
const db = require('../db');
const router = express.Router();
const bcrypt = require('bcrypt');
const { restrictToOwnProfile, requireLogin } = require('../middleware/auth');


// Add User
router.get('/add', (req, res) => {
    res.render('users/add');
});

router.post('/add', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, role]
        );
        res.status(201).redirect('/users/list');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List
router.get('/list', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users');
        res.render('users/list', { users: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Edit
router.get('/edit/:id', restrictToOwnProfile, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
        if (result.rows.length > 0) {
            return res.render('users/edit', { user: result.rows[0] });
        } else {
            return res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('This was user_edit get_route:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { username, account_type, phone, first_name,last_name, description, instagram_handle} = req.body;
    try {
        const result = await db.query(
            'UPDATE users SET username = $1, account_type = $2, phone = $3, first_name = $4, last_name = $5, description = $6, instagram_handle = $7 WHERE user_id = $8 RETURNING * ',
            [username, account_type, phone, first_name, last_name, description, instagram_handle, id]
        );
        if (result.rowCount > 0) {
            res.redirect('/');
        } else {
            res.status(404).send('Update failed');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete
router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
        if (result.rows.length > 0) {
            res.render('users/delete', { user: result.rows[0] });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
        if (result.rowCount > 0) {
            res.redirect('/users/list');
        } else {
            res.status(404).send('User not found or deletion failed');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
