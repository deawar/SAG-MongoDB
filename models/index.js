/* eslint-disable-next-line import/no-dynamic-require */
/* eslint-disable prefer-arrow-callback */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { FieldTypeInstance } = require('twilio/lib/rest/autopilot/v1/assistant/fieldType');

const { Schema } = mongoose;

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

const config = require(`${__dirname}/../config/config.js`)[env];
const db = mongoose.connection;

if (config.use_env_variable) {
  fs.readdirSync(__dirname + '/models').forEach(function (filename) {
    if (~filename.indexOf('.js')) import(path.join(__dirname, filename));
  });
}

// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

module.exports = db;
