require('dotenv').config()

const express = require('express')
const  cors = require('cors')
const morgan = require('morgan')
const app = express()

const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors())
app.use(morgan(':method :url :status - :req[content-length] :response-time ms - :body'))
morgan.token('body', (req) => JSON.stringify(req.body))

app.use(express.json())
//Main page
app.get('build/index.html', (req, res) => {
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
  Person.countDocuments({ '_id': { '$exists': true } })
    .then(result => {
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
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
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
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})


const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}


//Error handlausta
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})