const mongoURI = 'mongodb://seeder:seeder1@ds231720.mlab.com:31720/nodejs';
const Seeder = require('./seed')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {type:String,required:true},
    age: {type:Number, required:true}
})
const User = mongoose.model('user', UserSchema)

const data = {
    model: 'user',
    documents: [
        {username: 'DrPhil', age:7500},
        {username: 'Felix', age:14},
        {username: 'The3rdGuy', age:36}
    ]
}
const options = {useNewUrlParser:true}

var connectionResult    = false
var seedingResult       = false
var countResult         = false

// Seeder.connect(mongoURI, options, (error, result) => {
//     if (error) {
//         console.log(error)
//         connectionResult = false
//     } else {
//         connectionResult = true
//         Seeder.seedData(data, (error, result) => {
//             if (error) {
//                 console.log(error)
//                 seedingResult = false
//             } else {
//                 seedingResult = true
//             }

//             const expectedCount = 3
//             mongoose.model('user').estimatedDocumentCount({}, (e,result) => {
//                 if (e != null) console.error(e)
//                 console.log(result)
//                 countResult = (result == expectedCount)
//             })
//         })
//     }

//     console.log('*'.repeat(50))
//     console.log('mongoose-seeder testing results: \n\n')
//     console.log(`connected:\t\t${connectionResult}`)
//     console.log(`seeded:\t\t${seedingResult}`)
//     console.log(`count:\t\t${countResult}`)
//     console.log(`All tests passed:\t\t${(seedingResult 
//         && connectionResult && countResult)}`)
//     console.log('*'.repeat(50))
// })

Seeder.addListener('onConnect', function onConnect() { console.log('Connected') })
Seeder.addListener('onDisconnect', function onDisconnect () {console.log('Disconnected')})

Seeder.connectPromise(mongoURI, options).then(
    () => Seeder.seedDataPromise(data)
).catch((error) => {
    console.log(error)
}).finally(() => Seeder.disconnect())