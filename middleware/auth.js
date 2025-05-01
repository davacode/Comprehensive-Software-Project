// Middleware to restrict access to own profile
const restrictToOwnProfile = (req, res, next) => {
    const userId = parseInt(req.params.id, 10); // Extract the profile ID from the route parameter
    const sessionUserId = req.session.user?.user_id; // Get the logged-in user's ID from the session

    if (!sessionUserId || userId !== sessionUserId) {
        res.render('error');
    }

    next();
};

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Export both functions
module.exports = {
    restrictToOwnProfile,
    requireLogin,

};