const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', requireAuth, profileController.getProfile);
router.get('/edit', requireAuth, profileController.getEditProfile);
router.post('/edit', requireAuth, upload.single('avatar'), profileController.postEditProfile);
router.get('/:username', profileController.getPublicProfile);

module.exports = router;
