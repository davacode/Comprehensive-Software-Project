const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this is your database connection file
const { restrictToOwnProfile, requireLogin } = require('../middleware/auth'); // Middleware to check login

// GET: Display user profile

router.get('/', requireLogin, (req, res) => {
    const loggedInUserId = req.session.user.user_id;
    res.redirect(`/profile/${loggedInUserId}`);
});
router.get('/:id', requireLogin, async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);

        if (result.rows.length > 0) {
            const viewedUser = result.rows[0];
            res.render('profile/profile', { user: req.session.user, viewedUser });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// GET: Edit user profile form
router.get('/edit/:id', requireLogin, async (req, res) => {
    const userId = req.params.id;

    try {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await db.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = result.rows[0];
        res.render('edit_profile', { user });
    } catch (error) {
        console.error('Error fetching user profile for edit:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST: Update user profile
router.post('/edit/:id', requireLogin, async (req, res) => {
    const userId = req.params.id;
    const { email, phone, first_name, last_name, description, instagram_handle } = req.body;

    try {
        const query = `
            UPDATE users 
            SET email = $1, phone = $2, first_name = $3, last_name = $4, 
                description = $5, instagram_handle = $6
            WHERE id = $7
        `;
        await db.query(query, [email, phone, first_name, last_name, description, instagram_handle, userId]);

        res.redirect(`/${userId}`);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
