const mongoURI = 'mongodb://admin:Password1@ds231720.mlab.com:31720/nodejs';
const Seeder = require('./seed')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {type:String,required:true},
    age: {type:Number, required:true}
})
const User = mongoose.model('flimflam', UserSchema)

const data = {
    model: 'flimflam',
    documents: [
        {username: 'DrPhil', age:7500},
        {username: 'Felix', age:14},
        {username: 'The3rdGuy', age:36}
    ]
}
Seeder.connect(mongoURI, () => {
    Seeder.seedData(data, () => {
        console.log('Data seeded.')
    })
})