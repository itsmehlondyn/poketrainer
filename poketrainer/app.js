const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const teamRoutes = require('./routes/team');
const pokedexRoutes = require('./routes/pokedex');

const app = express();

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override (for PUT/DELETE in forms)
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: 'poke-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true
  }
}));

// Flash messages
app.use(flash());

// Global middleware: pass user + flash to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/profile', profileRoutes);
app.use('/team', teamRoutes);
app.use('/pokedex', pokedexRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('error', { title: '404 - Not Found', message: 'Page not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: '500 - Server Error', message: err.message });
});

const PORT = process.env.PORT || 3009;

sequelize.sync().then(() => {
  console.log('Database synced.');
  app.listen(PORT, '0.0.0.0', () => console.log(`PokéTrainer running on http://hopper.winthrop.edu:${PORT}`));
}).catch(err => {
  console.error('DB sync failed:', err);
});
