const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const  cors = require('cors')

const app = express()
app.use(express.json())
app.use(express.static('build'))

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status - :req[content-length] :response-time ms - :body'))

app.use(cors())

//harcoded list
 let persons =  [
    {
      "name": "Emil Mustonen",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Test Guy",
      "number": "040-142156",
      "id": 2
    },
    {
      "name": "Mr Test",
      "number": "050-654321",
      "id": 3
    },
    {
      "name": "Mr Guy",
      "number": "040-256125",
      "id": 4
    }
  ]

//Main page
app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

//Get all items method
app.get('/api/persons', (req, res) => {
    res.json(persons)
})

//Get info method
app.get('/api/info', (req ,res) => {
    const count = persons.length
    const date = new Date()
    res.send(`Phonebook has info for ${count} people\n${date}`)
})

//Get item by id method
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

//Delete method
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

//Post method
app.post('/api/persons', (req, res) => {
  const body = req.body
  const dupe = persons.map(person => person.name)
  
  //Checking if name or number field is empty
  if (!body.name || !body.number) {
    console.log('Name or number is missing')
    return response.status(400).json({
      error: 'name or number missing'
    })
  }
  
  //Checking if name exists already
  if (dupe.includes(body.name)) {
    console.log('Name already exists')
    return response.status(400).json({
      error: 'name already exists'
    })
  }

  const person = {
    name : body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  res.json(person)
})

//Function to generate random num between 0-99
const generateId = () => {
  maxId = Math.floor(Math.random() * 100)
  return maxId + 1
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})