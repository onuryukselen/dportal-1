const factory = require('./handlerFactory');
const Config = require('../models/configModel');

exports.getAllConfigs = factory.getAll(Config);
exports.getConfig = factory.getOne(Config);
exports.createConfig = factory.createOne(Config);
exports.updateConfig = factory.updateOne(Config);
exports.deleteConfig = factory.deleteOne(Config);

exports.getConfigById = async id => {
  return await Config.findById(id).lean();
};
