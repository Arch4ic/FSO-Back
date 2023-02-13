const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'name too short'],
    required: true,
    unique: [true, 'That name already exists']
  },
  number: {
    type: String,
    required: true,
    minlength: [8, 'Number is too short'],
    validate: {
      validator: function (v) {
        return /^\d{2}-\d+$/.test(v) || /^\d{3}-\d+$/.test(v)
      },
      message: 'not a valid phone number'
    }
  }
})


personSchema.plugin(uniqueValidator)
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)