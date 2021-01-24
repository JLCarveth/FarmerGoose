# mongoose-seeder

A library to facilitate [database seeding](https://en.wikipedia.org/wiki/Database_seeding) of a MongoDB database. This library was designed to create all the data needed by a service upon it's first startup. More specifically, I designed `mongoose-seeder` to facilitate persisting role data to the database for role-based access control.

## Usage
Importing the `mongoose-seeder` module creates a new `Seeder` object. `Seeder` has the following methods available:

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| Seeder.connect | url, options | Promise | Returns a promise to connect to the MongoDB service using the url and option object provided. |
| Seeder.seedData | data | boolean | Returns true if the data was seeded to the database without an error. |
| Seeder.disconnect | | | Closes the Seeder object's connection to the database. Must be called when seeding is complete. Triggers a 'onDisconnect' flag to registered listeners. |
| Seeder.isConnected | | Boolean | Returns true if Seeder maintains an active connection to the MongoDB service. |

## Data Structure
`Seeder.seedData` can only seed documents into a single collection at a time. The data object passed to `seedData()` is of the following structure:
  
    {
        'model':'modelName',
        'documents': [
            {'attribute1':'value1', 'attribute2':50},
            {'attribute1':'value2', 'attribute2':125}
        ]
    }

`modelName` is the name of the model to which the documents will be inserted. It is the same string that would be used to fetch the given model using `mongoose.model('modelname')`. The documents are structured according to the applicable Schema. 

# Example
The most basic usage of mongoose-seeder is seen below. The seeded data would more likely be fetched from a configuration file in a production environment.

    const Seeder    = require('mongoose-seeder')
    const url       = 'mongodb://username:password@server.com:31720'
    const data      = {
        model: 'user',
        documents: [
            {username: 'DrPhil', age:7500},
            {username: 'Felix', age:14},
            {username: 'The3rdGuy', age:36}
        ]
    }

    Seeder.connect(url, {}).then(
        () => Seeder.seedData(data)
    ).catch((error) => {
        // An Error occurred.
    }).finally(() => Seeder.disconnect())  
      

# Dependencies
Currently, the sole dependency is [mongoose](https://mongoosejs.com/).

# Contributions
Contributions are more than welcome! There's no doubt I've made a few mistakes.
