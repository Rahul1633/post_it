const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000

let dbURL = 'mongodb+srv://rahul2003:rahul2003@cluster0.ia5cbvr.mongodb.net/?retryWrites=true&w=majority';
if (process.env.NODE_ENV === 'production') {
  dbURL = process.env.DB_HOST || process.env.MONGODB_URI;
}

mongoose.connect(dbURL, {useNewUrlParser: true});

mongoose.connection.on('connected', () => {
 console.log(`Mongoose connected to ${dbURL}`);
});

mongoose.connection.on('error', err => {
 console.log(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
 console.log('Mongoose disconnected');
});

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close( () => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });
};
// For nodemon restarts
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});