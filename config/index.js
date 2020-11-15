module.exports = {
  db: {
    dialect: 'mysql',
    host: 'localhost',
    database: 'mysimpleegg',
    username: 'root',
    password: 'admin'
  },
  middleware: ['logger'],
  schedule: ['log']
}