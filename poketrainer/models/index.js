const sequelize = require('../config/database');
const User = require('./User');
const TeamPokemon = require('./TeamPokemon');

// Associations
User.hasMany(TeamPokemon, { foreignKey: 'userId', as: 'team', onDelete: 'CASCADE' });
TeamPokemon.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, TeamPokemon };
