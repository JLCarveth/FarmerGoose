# FarmerGoose
Node module to persist data once to a MongoDB system. Has a sole dependency of `mongoose`. This module is used for [Database Seeding](https://en.wikipedia.org/wiki/Database_seeding). A good example of how it works can be seen in `test.js`.
  
# Seeder()
`Seeder` is the primary class in the module. It consists of the following methods:
  - `Seeder.connect(...params)`: Must be called before seeding data. Takes one-three parameters. A single parameter being the database connection URI. Two parameters passed to `Seeder.connect()` indicate a database connection URI and a callback, in that order. The callback is a function, and will only be called if the connection was successful.
  - `Seeder.seedData(data)`: Takes a single parameter, an Object `data` to be seeded to the database. 
    - `data.model` is a String of the model's name to which data will be seeded (for example, `'users'`).   
    - `data.documents` is an array of objects that will be inserted into the appropriate collection.  
Each entry in `data.documents` will only be inserted if there doesn't currently exist a document in the database with the same first value. For example, if `{name:'Felix', age:19}` already existed within the database, then `{username: 'Felix', age:14}` will not be inserted, but the other documents will.  
  
  - `Seeder.disconnect()`: should be called once the seeding is done. A new connection will need to be opened for further access to the database.

  - `Seeder.setLogging(boolean)`: By default Seeder does not log any messages. Calling `Seeder.setLogging(true)` will print info and error messages to the console. 