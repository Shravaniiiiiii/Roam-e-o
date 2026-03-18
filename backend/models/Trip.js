const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');
const User          = require('./User');

const Trip = sequelize.define('Trip', {
  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true
  },
  user_id: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: { model: 'users', key: 'id' }
  },
  destination: {
    type:      DataTypes.STRING(200),
    allowNull: false
  },
  tagline:     { type: DataTypes.STRING(300) },
  dest_emoji:  { type: DataTypes.STRING(10),  defaultValue: '📍' },
  region:      { type: DataTypes.STRING(100) },
  language:    { type: DataTypes.STRING(150) },
  days_count:  { type: DataTypes.INTEGER,    allowNull: false },
  budget:      { type: DataTypes.INTEGER,    allowNull: false },
  travellers:  { type: DataTypes.ENUM('solo','couple','friends','family'), defaultValue: 'couple' },
  travel_style:{ type: DataTypes.STRING(50), defaultValue: 'balanced' },
  stay_pref:   { type: DataTypes.STRING(50) },
  is_edited:   { type: DataTypes.BOOLEAN,    defaultValue: false },

  // Store nested data as JSON (MySQL 5.7+ supports native JSON)
  season:           { type: DataTypes.JSON },
  quick_facts:      { type: DataTypes.JSON },
  budget_breakdown: { type: DataTypes.JSON },
  days:             { type: DataTypes.JSON },
  reels:            { type: DataTypes.JSON },
  insider_tips:     { type: DataTypes.JSON },
  local_phrases:    { type: DataTypes.JSON }
}, {
  tableName:  'trips',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['destination'] },
    { fields: ['region'] },
    { fields: ['created_at'] },
    { fields: ['user_id', 'created_at'] }
  ]
});

// Association
Trip.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Trip,   { foreignKey: 'user_id', as: 'trips' });

module.exports = Trip;