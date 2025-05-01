const express = require('express');
const db = require('../db');
const router = express.Router();
const bcrypt = require('bcrypt');


router.get('/', async (req, res) => {
    try {
        const query = `SELECT posts.*, users.username FROM posts INNER JOIN users ON posts.user_id = users.user_id ORDER BY posts.created_at DESC;`;
        const result = await db.query(query);
        const posts = result.rows;

        res.render('home', { user: req.session.user, posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;