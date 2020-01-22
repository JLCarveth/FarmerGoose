/**
 * @module seed
 * @author John L. Carveth
 * @version 1.1.0
 * A module to persist data to a MongoDB system on startup, 'seeding' the database.
 */

/**
 * Dependencies
 */
var mongoose = require('mongoose')
mongoose.Promise = global.Promise

/**
 * @memberof module:seed
 * @class Seeder
 */
const Seeder = function () {
    this.connected = false;
    this.listeners = []
}

/**
 * @memberof module:seed.Seeder
 * @function connect opens a connection to the MongoDB server
 * @param {String} url the mongodb access url 
 */
Seeder.prototype.connect = function (url, opts) {
    return mongoose.connect(url, opts).then(() => {
        const connected = mongoose.connection.readyState == 1
        this.connected = connected
        this.listeners.forEach((l) => {
            if (l.cause == 'onConnect') l.effect()
        })
        return connected;
    });
}

/**
 * @memberof module:seed.Seeder
 * @function seedData
 * @param {Object} data the data to be seeded
 * @param {String} data.model the name of the model to which the data will be seeded
 * @param {Array} data.documents the documents to be seeded 
 */
Seeder.prototype.seedData = function (data) {
    // Mongoose might have been connected by another source, so check
    const connected = mongoose.connection.readyState == 1
    this.connected = connected
    if (!this.connected) {
        console.error(new Error('Not connected to MongoDB'))
        return false
    }
    // Stores all promises to be resolved
    var promises = []
    // Fetch the model via its name string from mongoose
    const Model = mongoose.model(data.model)
    // For each object in the 'documents' field of the main object
    data.documents.forEach((item) => {
        promises.push(promise(Model, item))
    })
    // Fulfil each Promise in parallel
    return Promise.all(promises).then(() => {
        return true
    }).catch(() => {
        console.log(`Connected:\t${this.connected}`)
    })
}

/**
 * @memberof module:seed.Seeder
 * @function addListener
 * @param {String} cause action flag the listener is listening for
 * @param {function} effect the function to be called when listener is triggered 
 * Adds a new listener to the Seeder object, which will be called when an 
 * action is triggered by the seeder. Supported causes are:
 *      - 'onConnect',
 *      - 'onDisconnect' 
 */
Seeder.prototype.addListener = function (cause, effect) {
    this.listeners.push({'cause':cause,'effect':effect})
}

/**
 * @memberof module:seed.Seeder
 * @function disconnect
 * Closes the connection to MongoDB
 */
Seeder.prototype.disconnect = function () {
    mongoose.disconnect()
    this.connected = false
    this.listeners.forEach((l) => {
        if (l.cause == 'onDisconnect') l.effect()
   })
}

/**
 * @memberof module:seed.Seeder
 * @function isConnected
 * @return true if Seeder has an active connection to MongoDB
 */
Seeder.prototype.isConnected = function () {
    return this.connected
}

/**
 * Generates a Promise that seeds item to model
 * @param {mongoose.Model} model 
 * @param {Object} item 
 */
const promise = function (model, item) {
    return new Promise((resolve, reject) => {
        // To accurately query MongoDB, we need to extract a column name and value
        var key = Object.keys(item)[0]
        var value = item[key]
        var queryParams = {}
        queryParams[key] = value
        // Find if a similar item already exists
        model.findOne(queryParams).then((result) => {
            if (result == null) {
                model.create(item).then((result) => {
                    resolve()
                }).catch((error) => {reject(error)})
            } else resolve() // Already exists so do not seed
        }).catch((error) => {reject(error)})
    })
}

module.exports = new Seeder()