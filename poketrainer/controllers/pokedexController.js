const axios = require('axios');

const POKEAPI = 'https://pokeapi.co/api/v2';

// GET /pokedex
exports.getPokedex = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const response = await axios.get(`${POKEAPI}/pokemon?limit=${limit}&offset=${offset}`);
    const { results, count } = response.data;

    const totalPages = Math.ceil(count / limit);

    res.render('pokedex/index', {
      title: 'Pokédex',
      pokemon: results,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load Pokédex.');
    res.redirect('/profile');
  }
};

// GET /pokedex/:name
exports.getPokemonDetail = async (req, res) => {
  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      axios.get(`${POKEAPI}/pokemon/${req.params.name}`),
      axios.get(`${POKEAPI}/pokemon-species/${req.params.name}`).catch(() => null)
    ]);

    const data = pokemonRes.data;
    const species = speciesRes ? speciesRes.data : null;

    const flavorText = species
      ? (species.flavor_text_entries.find(e => e.language.name === 'en') || {}).flavor_text
      : null;

    const pokemon = {
      id: data.id,
      name: data.name,
      sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
      spriteFront: data.sprites.front_default,
      spriteShiny: data.sprites.other['official-artwork'].front_shiny,
      types: data.types.map(t => t.type.name),
      height: data.height / 10,
      weight: data.weight / 10,
      stats: data.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
      abilities: data.abilities.map(a => a.ability.name),
      flavorText: flavorText ? flavorText.replace(/\f/g, ' ') : 'No description available.',
      genus: species ? (species.genera.find(g => g.language.name === 'en') || {}).genus : ''
    };

    res.render('pokedex/detail', {
      title: `#${pokemon.id} ${pokemon.name}`,
      pokemon
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).render('error', { title: 'Not Found', message: 'That Pokémon does not exist.' });
    }
    console.error(err);
    req.flash('error', 'Could not load Pokémon details.');
    res.redirect('/pokedex');
  }
};
