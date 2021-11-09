require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const ObjectId = require('mongodb').ObjectId

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan('tiny')) // Using tiny-formatting for all but POST requests

// morgan token for logging name and number
morgan.token('pBody', (req)  => {
  return JSON.stringify(req.body)
})

// Send custom errors before defaulting to next()
const errorHandler = (error, req, res, next) => {
  console.log('ARE WE HERE')
  console.log(error.message)

  if(error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

// Give general information about phonebook
app.get('/info', (req, res) => {
  Person.count({}, (err, count) => {
    if (err) {
      res.status(500).end()
    } else {
      let response = `<p>Phonebook has info for ${count} people</p>`
      response += `<p>${Date()}`
      res.send(response)
    }
  })
})

// Give complete lists of persons in phonebook
app.get('/api/persons', (req, res) => {
  let persons = []
  // Fetch persons from db
  Person.find({}).then( result => {
    result.forEach( person => {
      persons = persons.concat(person)
    })
    res.json(persons)
  })
})

// Give just one person identified by their mongodb-id
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id

  Person.findById(id).then( person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
})

// Remove a person database
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findByIdAndRemove(id).then( result => {
    return res.status(204).end()
  }).catch(error => next(error))
})

// Add a person
app.post('/api/persons', (req, res, next) => {
  // Change morgan formatting for POST request
  app.use(morgan(':method :url :status :response-time ms :pBody'))
  // Check input
  if(!req.body.name) {
    return res.status(400).json({
      error: 'missing name'
    })
  } else if(!req.body.number) {
    return res.status(400).json({
      error: 'missing number'
    })
  }
  // Person to add
  const newPerson = new Person({
    name: req.body.name,
    number: req.body.number
  })
  // Save person to database
  newPerson.save().then(result => {
    // Send result back
    res.json(result.toJSON())
  }).catch(error => next(error))
  // Change morgan formatting back to tiny
  app.use(morgan('tiny'))
})

// Edit a person by id
app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findOneAndUpdate(
    { _id: ObjectId(id) }, // filter
    { number: req.body.number }, // update
    { new: true, // Return the changed document
      runValidators: true } // Why is this not default behavior?
  ).then(result => {
    console.log(result.toJSON())
    return res.status(200).json(result)
  }).catch(error => next(error))
  /*
  Person.findById(id).then( person => {
    if(person === undefined) {
      return res.status(404).json( {
        error: `person with id=${req.params.id} not found`
      })
    } else {
      person.number = req.body.number
      person.save().then( () => {
        return res.status(200).json(person)
      }).catch(error => next(error))
    }
  })
  */
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)
// Try to get port from ENV, default to 3001 is fails
const PORT = process.env.PORT || 3001
// Start server!
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`)
})
