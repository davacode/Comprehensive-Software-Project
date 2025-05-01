const express = require('express')
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const routes = require('./routes')
const { Pool } = require('pg')
const path = require('path')
const requireLogin = require('./middleware/auth')
const app = express()
const flash = require('express-flash');
const port = 3000

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));

// USER session
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Flash
app.use(flash());

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// login/register
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));


//establish root dir
app.use('/', routes);


// Logout route
app.get('/users/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Unable to log out');
        }
        res.redirect('/login');
    });
});

// ERROR Page
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error');
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});