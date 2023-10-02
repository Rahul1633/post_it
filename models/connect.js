const mongoose = require('mongoose')
require('dotenv').config()

let dbURI = 'mongodb+srv://rahul2003:rahul2003@cluster0.ia5cbvr.mongodb.net/?retryWrites=true&w=majority';

if (process.env.NODE_ENV === 'production')
    dbURI = process.env.dbURI;

mongoose.connect(dbURI, {
    useNewUrlParser: true
})
.then(() => console.log('connected to DB'))
.catch(console.error);