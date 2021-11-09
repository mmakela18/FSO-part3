const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

// URL to persons database should be in ENV
const url = process.env.MONGODB_URL

console.log(`connecting to ${url}`)
mongoose.connect(url).then( () => {
  console.log('connected to MongoDB')
}).catch(error => {
  console.log('error connecting to MongoDB: ', error.message)
})

// Define how person is to be saved
const personSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, required: true, unique: true },
  number: { type: String, minlength: 8, required: true, unique: false }
})

// Get rid of extra MongoDB-stuff when turning person to JSON
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
// Enable validators in personSchema, such as unique: true etc.
personSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Person', personSchema)
