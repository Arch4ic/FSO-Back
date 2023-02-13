require('dotenv').config()
const { response } = require('express')
const express = require('express')

const morgan = require('morgan')
const  cors = require('cors')

const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(morgan(':method :url :status - :req[content-length] :response-time ms - :body'))
app.use(cors())

//Main page
app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

//Get all items method
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

//Get info method
app.get('/api/info', (req ,res) => {
  const date = new Date()
  Person.countDocuments({ "_id": { "$exists": true } })
    .then(result =>{
      res.send(`Phonebook has info for ${result} people\n${date}`)
  })
})

//Get item by id method
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person){
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

//Delete method
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query'}
  )
    .then(updatePerson => {
      res.json(updatePerson)
    })
    .catch(error => next(error))
})

//Post method
app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name : body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson =>{
      res.json(savedPerson)
  })
  .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

//Error handlausta
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})