const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');


// Public routes
router.use('/users', require('./auth'));

// Protected routes
router.use('/', requireLogin, require('./home'));

router.use('/home', requireLogin, require('./home'));

router.use('/users', requireLogin, require('./users'));
router.use('/profile', requireLogin, require('./profile'));

router.use('/posts', requireLogin, require('./posts'));


module.exports = router;