const { User } = require('../models');

// GET /register
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Create Account' });
};

// POST /register
exports.postRegister = async (req, res) => {
  const { username, email, password, confirmPassword, hometown, trainerTitle } = req.body;

  try {
    // Validation
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/register');
    }
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/register');
    }
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/register');
    }

    // Check uniqueness
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      req.flash('error', 'Username already taken.');
      return res.redirect('/register');
    }
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      req.flash('error', 'Email already in use.');
      return res.redirect('/register');
    }

    const user = await User.create({
      username,
      email,
      password,
      hometown: hometown || '',
      trainerTitle: trainerTitle || 'Pokémon Trainer'
    });

    req.session.user = { id: user.id, username: user.username };
    req.flash('success', `Welcome, ${user.username}! Your trainer journey begins!`);
    res.redirect('/profile');
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      req.flash('error', err.errors.map(e => e.message).join(', '));
    } else {
      req.flash('error', 'Registration failed. Please try again.');
      console.error(err);
    }
    res.redirect('/register');
  }
};

// GET /login
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Trainer Login' });
};

// POST /login
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.validatePassword(password))) {
      req.flash('error', 'Invalid username or password.');
      return res.redirect('/login');
    }

    req.session.user = { id: user.id, username: user.username };
    req.flash('success', `Welcome back, ${user.username}!`);
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/login');
  }
};

// POST /logout
exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/login');
  });
};
