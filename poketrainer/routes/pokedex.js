const express = require('express');
const router = express.Router();
const pokedexController = require('../controllers/pokedexController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, pokedexController.getPokedex);
router.get('/:name', requireAuth, pokedexController.getPokemonDetail);

module.exports = router;
