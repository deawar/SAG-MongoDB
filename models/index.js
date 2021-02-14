/* eslint-disable global-require */
/* eslint-disable-next-line import/no-dynamic-require */
/* eslint-disable prefer-arrow-callback */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
exports.User = require('./user');

const basename = path.basename(__filename);

// eslint-disable-next-line prefer-destructuring
const Schema = mongoose.Schema;

const env = process.env.NODE_ENV || 'development';
// eslint-disable-next-line import/no-dynamic-require
const config = require(`${__dirname}/../config/config.js`)[env];

const db = mongoose.connection;

const modelsPath = path.resolve(__dirname);
console.log('FilePath: ', modelsPath);
fs.readdirSync(modelsPath).forEach((file) => {
  require(`${modelsPath}/${file}`);
});
require('./user');
require('./school');
require('./role');
require('./bid');
require('./artwork');
// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

module.exports = {
  user: require('./user'),
  school: require('./school'),
  role: require('./role'),
  artwork: require('./artwork'),
  bid: require('./bid'),
};
module.exports = db;
