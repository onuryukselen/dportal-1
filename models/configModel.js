const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  project_name: {
    unique: true,
    type: String,
    required: [true, 'Please provide project name.']
  },
  api_config: {
    type: String
  },
  graphs: {
    type: 'Mixed'
  },
  columns: {
    type: 'Mixed',
    required: [true, 'Please provide column descriptions.']
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdateDate: {
    type: Date,
    default: Date.now
  },
  perms: {
    type: 'Mixed',
    default: { read: { user: ['everyone'] } }
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  lastUpdatedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
});

const Config = mongoose.model('config', configSchema, 'config');

module.exports = Config;
