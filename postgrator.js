module.exports = {
  driver: 'pg',
  migrationDirectory: process.env.APP_DB_MIGRATE_DIR,
  port: +process.env.APP_DB_PORT,
  database: process.env.APP_DB_NAME,
  username: process.env.APP_DB_USER,
  password: process.env.APP_DB_PASSWORD,
  hostname: process.env.APP_DB_HOSTNAME,
  host: process.env.APP_DB_HOST
};