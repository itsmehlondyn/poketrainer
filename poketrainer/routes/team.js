const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, teamController.getTeam);
router.post('/add', requireAuth, teamController.addPokemon);
router.post('/:id/nickname', requireAuth, teamController.updateNickname);
router.delete('/:id', requireAuth, teamController.removePokemon);
router.post('/reorder', requireAuth, teamController.reorderTeam);

module.exports = router;
