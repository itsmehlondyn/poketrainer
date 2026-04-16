const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest, requireAuth } = require('../middleware/auth');

// Home redirect
router.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/profile');
  res.redirect('/login');
});

router.get('/register', requireGuest, authController.getRegister);
router.post('/register', requireGuest, authController.postRegister);

router.get('/login', requireGuest, authController.getLogin);
router.post('/login', requireGuest, authController.postLogin);

router.post('/logout', requireAuth, authController.postLogout);

module.exports = router;
