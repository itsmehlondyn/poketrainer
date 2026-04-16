const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeamPokemon = sequelize.define('TeamPokemon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pokemonId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  slot: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 6 }
  },
  // Cached from PokéAPI so we don't call it every page load
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  spriteUrl: {
    type: DataTypes.STRING
  },
  types: {
    type: DataTypes.STRING // JSON array stored as string
  },
  hp: { type: DataTypes.INTEGER },
  attack: { type: DataTypes.INTEGER },
  defense: { type: DataTypes.INTEGER },
  specialAttack: { type: DataTypes.INTEGER },
  specialDefense: { type: DataTypes.INTEGER },
  speed: { type: DataTypes.INTEGER }
});

module.exports = TeamPokemon;
