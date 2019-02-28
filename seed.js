/**
 * @module seed
 * @author John L. Carveth
 * A module to persist data to a MongoDB system on startup, 'seeding' the database.
 */

/**
 * Dependencies
 */
var mongoose = require('mongoose')
mongoose.Promise = Promise

/**
 * @class Seeder
 */
const Seeder = function () {
    this.connected = false;
    this.logging = false;
}

/**
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
        if (this.logging == true) console.error('Seeder.connect() only takes 1-3 arguments.')
    }

    // If mongoose already has a connection
    if (mongoose.connection.readystate == 1) {
        that.connected = true
        cb(null, true);
    } else {
        mongoose.connect(db, opts, (error, result) => {
            if (error) {
                if (that.logging == true) console.error('Could not make connection to MongoDB')
                callback(error)
            }
            else {
                that.connected = true
                cb(null,true)
            }
        })
    }
}

/**
 * @function seedData
 * Persists data once to the MongoDB database.
 * @param {Object} data - the data to persist to the MongoDB collection
 * @param {Function} callback - will be called after data has been seeded.
 */
Seeder.prototype.seedData = function (data, callback) {
    if (this.connected == false) {
        if (this.logging == true) console.error('Not connected to MongoDB.')
    } else {
        // Stores all promises to be resolved
        var promises = []
        // Fetch the model via its name string from mongoose
        const Model = mongoose.model(data.model)
        // For each object in the 'documents' field of the main object
        data.documents.forEach((item) => {
            if (this.logging == true) console.log('Item: ' + JSON.stringify(item))
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
    if (this.logging == true) console.log('Seeder disconnecting.')
}

Seeder.prototype.setLogging = function (bool) {
    this.logging = bool;
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