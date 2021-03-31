// require('dotenv').config(); moved to dev-dependency must run "node -r dotenv/config server.js"
// or "npm run start_local"

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    uri: process.env.MONGODB_URI,
    // dialect: 'mongodb',
    // socketPath: '/var/run/mysqld/mysqld.sock',
  },
  test: {
    username: process.env.DBLOCAL_USER,
    password: process.env.DBLOCAL_PASSWORD,
    database: process.env.DBLOCAL_NAME,
    host: process.env.DBLOCAL_HOST,
    uri: process.env.MONGODB_URI,
    // dialect: 'mongodb',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    uri: process.env.MONGODB_URI,
    dialect: 'mongodb',
    dialectModule: 'mongodb',
  },
  // production: {
  //   use_env_variable: 'JAWSDB_URL',
  //   dialect: 'mysql',
  // },
};
