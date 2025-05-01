const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Create a new post
router.post('/create', upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const user_id = req.session.user.user_id; // Assuming user session stores user_id
    let image_url = null;

    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        const query = `
            INSERT INTO posts (title, content, image_url, user_id, created_at)
            VALUES ($1, $2, $3, $4, NOW()) RETURNING *;
        `;
        const values = [title, content, image_url, user_id];
        const result = await db.query(query, values);

        res.redirect('/'); // Redirect back to the homepage/feed
    } catch (error) {
        console.error('Error creating post:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch all posts to display in the feed
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT posts.*, users.username FROM posts
            INNER JOIN users ON posts.user_id = users.user_id
            ORDER BY posts.created_at DESC;
        `;
        const result = await db.query(query);
        const posts = result.rows;

        res.render('home', { user: req.session.user, posts });
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const user_id = req.session.user.user_id;

    try {
        // Query to get post details
        const query = `SELECT post_id, image_url FROM posts WHERE user_id = $1 AND post_id = $2`;
        const values = [user_id, id];
        const result = await db.query(query, values);

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Delete the post from the database
        await db.query(`DELETE FROM posts WHERE post_id = $1`, [id]);

        // Remove associated image file if it exists
        if (result.rows[0].image_url) {
            const fileName = result.rows[0].image_url.replace('/uploads/', '');
            const filePath = path.join(__dirname, '..', 'public/uploads', fileName);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err.message);
                }
            });
        }

        res.sendStatus(200); // Respond with success
    } catch (error) {
        console.error('Error during deletion:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
