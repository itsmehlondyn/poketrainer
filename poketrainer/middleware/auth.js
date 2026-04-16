function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'You must be logged in to do that.');
    return res.redirect('/login');
  }
  next();
}

function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  next();
}

module.exports = { requireAuth, requireGuest };
