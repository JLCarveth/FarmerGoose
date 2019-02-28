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
Seeder.setLogging(true)
Seeder.connect(mongoURI, (error, result) => {
    if (error) console.error(error)
    else Seeder.seedData(data, (error, result) => {
        if (error) console.error('Oopsie...' + error)
        else console.log(`Success: ${result}`)
    })
})