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
 * @function connect
 * Connects to the MongoDB server
 * @param db the database connection URI
 * @param opts the mongoose connection options object
 * @param cb the function that can be called after connection
 */
Seeder.prototype.connect = function (...params) {
    var that = this;
    var db,cb
    var opts = {}
    if (arguments.length == 1) {
        db = arguments[0]
    } else if (arguments.length == 2) {
        db = arguments[0]
        cb = arguments[1]
    } else if (arguments.length == 3) {
        db = arguments[0]
        opts = arguments[1]
        cb = arguments[2]
    } else {
        cb(new Error('Seeder.connect() takes 1-3 arguments. Refer to documentation.'))
    }

    // If mongoose already has a connection
    if (mongoose.connection.readystate == 1) {
        that.connected = true
        cb(null, true);
    } else {
        mongoose.connect(db, opts, (error, result) => {
            if (error) cb(error)
            else {
                that.connected = true
                cb(null,true)
                // Notify any attached listeners
                this.listeners.forEach((l) => {
                     if (l.cause == 'onConnect') l.effect()
                })
            }
        })
    }
}

Seeder.prototype.connectPromise = function (url, opts) {
    return mongoose.connect(url, opts).then(() => {
        const connected = mongoose.connection.readyState == 1
        this.connected = connected
        console.log('Connection made.')
        return connected;
    });
}

Seeder.prototype.seedDataPromise = function (data) {
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
    Promise.all(promises).then(() => {
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
 * @function seedData
 * Persists data once to the MongoDB database.
 * @param {Object} data - the data to persist to the MongoDB collection
 * @param {Function} callback - will be called after data has been seeded.
 */
Seeder.prototype.seedData = function (data, callback) {
    if (this.connected == false) {
        callback(new Error('Not connected to MongoDB.'))
    } else {
        // Stores all promises to be resolved
        var promises = []
        // Fetch the model via its name string from mongoose
        const Model = mongoose.model(data.model)
        // For each object in the 'documents' field of the main object
        data.documents.forEach((item) => {
            promises.push(promise(Model, item))
        })
        // Fulfil each Promise in parallel
        Promise.all(promises).then(callback(null, true)).catch((e)=>{
            callback(e)
        })
    }
}

/**
 * @function Seeder.disconnect
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
 * Generates a Promise that seeds item to model
 * @param {mongoose.Model} model 
 * @param {Object} item 
 */
const promise = function (model, item) {
    return new Promise((resolve, reject) => {
        // To accurately query MongoDB, we need to extract a column name and value
        var key = Object.keys(item)[0]
        var value = item[key]
        // Calling {key:value} inline doesn't work
        var queryParams = {}
        queryParams[key] = value

        model.findOne(queryParams).then((result) => {
            if (result == null) {
                model.create(item).then((result) => {
                    resolve()
                }).catch((error) => {reject()})
            } else  {
                resolve()
            }
        }).catch((error) => {reject()})
    })
}

module.exports = new Seeder()