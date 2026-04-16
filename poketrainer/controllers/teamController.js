const axios = require('axios');
const { TeamPokemon } = require('../models');

const POKEAPI = 'https://pokeapi.co/api/v2';

// Fetch and normalize Pokémon data from PokéAPI
async function fetchPokemon(nameOrId) {
  const res = await axios.get(`${POKEAPI}/pokemon/${nameOrId.toLowerCase()}`);
  const data = res.data;
  return {
    pokemonId: data.id,
    name: data.name,
    spriteUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    types: JSON.stringify(data.types.map(t => t.type.name)),
    hp: data.stats.find(s => s.stat.name === 'hp').base_stat,
    attack: data.stats.find(s => s.stat.name === 'attack').base_stat,
    defense: data.stats.find(s => s.stat.name === 'defense').base_stat,
    specialAttack: data.stats.find(s => s.stat.name === 'special-attack').base_stat,
    specialDefense: data.stats.find(s => s.stat.name === 'special-defense').base_stat,
    speed: data.stats.find(s => s.stat.name === 'speed').base_stat
  };
}

// GET /team
exports.getTeam = async (req, res) => {
  try {
    const team = await TeamPokemon.findAll({
      where: { userId: req.session.user.id },
      order: [['slot', 'ASC']]
    });

    const teamData = team.map(p => ({
      ...p.toJSON(),
      types: JSON.parse(p.types || '[]'),
      displayName: p.nickname || p.name
    }));

    res.render('team/index', {
      title: 'My Team',
      team: teamData,
      teamSize: team.length
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load team.');
    res.redirect('/profile');
  }
};

// POST /team/add
exports.addPokemon = async (req, res) => {
  const { pokemonName, nickname } = req.body;
  const userId = req.session.user.id;

  try {
    // Team size validation
    const teamSize = await TeamPokemon.count({ where: { userId } });
    if (teamSize >= 6) {
      req.flash('error', 'Your team is full! (Maximum 6 Pokémon)');
      return res.redirect('/team');
    }

    // Fetch from PokéAPI
    let pokeData;
    try {
      pokeData = await fetchPokemon(pokemonName.trim());
    } catch (apiErr) {
      req.flash('error', `Pokémon "${pokemonName}" not found. Check the spelling!`);
      return res.redirect('/team');
    }

    // Duplicate check: same Pokémon species on the same team
    const duplicate = await TeamPokemon.findOne({
      where: { userId, pokemonId: pokeData.pokemonId }
    });
    if (duplicate) {
      req.flash('error', `${pokeData.name} is already on your team!`);
      return res.redirect('/team');
    }

    // Find next available slot
    const existingSlots = (await TeamPokemon.findAll({ where: { userId }, attributes: ['slot'] }))
      .map(p => p.slot);
    let slot = 1;
    while (existingSlots.includes(slot)) slot++;

    await TeamPokemon.create({
      userId,
      slot,
      nickname: nickname ? nickname.trim() : null,
      ...pokeData
    });

    req.flash('success', `${nickname || pokeData.name} was added to your team!`);
    res.redirect('/team');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add Pokémon. Please try again.');
    res.redirect('/team');
  }
};

// POST /team/:id/nickname
exports.updateNickname = async (req, res) => {
  try {
    const pokemon = await TeamPokemon.findOne({
      where: { id: req.params.id, userId: req.session.user.id }
    });
    if (!pokemon) {
      req.flash('error', 'Pokémon not found.');
      return res.redirect('/team');
    }
    pokemon.nickname = req.body.nickname ? req.body.nickname.trim() : null;
    await pokemon.save();
    req.flash('success', 'Nickname updated!');
    res.redirect('/team');
  } catch (err) {
    req.flash('error', 'Could not update nickname.');
    res.redirect('/team');
  }
};

// DELETE /team/:id
exports.removePokemon = async (req, res) => {
  try {
    const pokemon = await TeamPokemon.findOne({
      where: { id: req.params.id, userId: req.session.user.id }
    });
    if (!pokemon) {
      req.flash('error', 'Pokémon not found on your team.');
      return res.redirect('/team');
    }
    const name = pokemon.nickname || pokemon.name;
    await pokemon.destroy();
    req.flash('success', `${name} was released.`);
    res.redirect('/team');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not remove Pokémon.');
    res.redirect('/team');
  }
};

// POST /team/reorder
exports.reorderTeam = async (req, res) => {
  try {
    const { order } = req.body; // array of IDs in desired order
    const ids = JSON.parse(order);
    const userId = req.session.user.id;

    for (let i = 0; i < ids.length; i++) {
      await TeamPokemon.update(
        { slot: i + 1 },
        { where: { id: ids[i], userId } }
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reorder failed.' });
  }
};
