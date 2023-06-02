const mongoose = require('mongoose');

mongoose.connect(process.env.Mongo);
const { connection } = mongoose;

// eslint-disable-next-line no-console
connection.on('connected', () => console.log('Database connected'));

connection.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.log('Error in MongoDB Connection', error);
});
module.exports = mongoose;
