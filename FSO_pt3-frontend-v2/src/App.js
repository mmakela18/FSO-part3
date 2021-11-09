import React, { useState, useEffect } from 'react'
import PhonebookForm, {
  PhonebookFilter,
  PhonebookList,
  SuccessBox,
  FailureBox } from './components/Phonebook'
import personsService from './services/persons'

// Phonebook exercise
const App = () => {
  // Initialize states
  // Array of person-objects
  const [persons, setPersons] = useState([
    {name: '', number: ''}
  ])
  // Next three states for user input
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newSearch, setNewSearch] = useState('')
  // Next two states for messages to display
  const [success, setNewSuccess] = useState(null)
  const [failure, setNewFailure] = useState(null)
  // Function to reset successmessage
  const resetSuccess = () => {
    setTimeout( () => {
      setNewSuccess(null)
    }, 5000)
  }
  // Function to reset failuremessage
  const resetFailure = () => {
    setTimeout( () => {
      setNewFailure(null)
    }, 5000)
  }
  // Function to get list of persons from server
  const fetchPersons = () =>
    personsService.getAllPersons()
    .then(response => {
      setPersons(response.data)
    }).catch(error => {
      if (error.response) {
        setNewFailure("Server responded, but there was another fault.\nCheck your console.")
        console.log(error.response.data)
        console.log(error.response.headers)
        console.log(error.response.status)
      } else if(error.request) {
        setNewFailure("Request made to fetch persons, but no response received.\nSee console.")
        console.log(error.request)
      } else {
        setNewFailure("Error: ", error.message)
        console.log(error.message)
      }
      resetFailure()
    })
  // Get persons on first render
  useEffect(fetchPersons, [])
  // Function to add name to persons
  const addName = (event) => {
    // Fetch persons again to avoid conflict/duplicate entry from another client
    // Doesn't really work tho because we'd have to wait
    // fetchPersons()
    event.preventDefault()
    // Temporary object for person
    const nameObject = {
      name: newName,
      number: newNumber
    }
    // Check for duplicate name-entry
    const filtered = persons.filter(person =>
        person.name.toLowerCase() === newName.toLowerCase())
    if (filtered.length > 0) {
      // Duplicate entry -> ask for edit
      const msg = `${filtered[0].name} is already in the list.\nWanna change number?`
      if (window.confirm(msg)) {
        personsService.changePerson(filtered[0], nameObject)
        .then(response => {
          // Success -> add response data so local persons matches server
          setPersons(persons.map( person => person.id !== response.data.id
            ? person
            : response.data))
            setNewSuccess(`Changed ${response.data.name}`)
            resetSuccess()
          }
        ).catch(error => {
          if (error.response) {
            setNewFailure(`${error.response.data.error}`)
            resetFailure()
            console.log(error.response.data)
            console.log(error.response.headers)
            console.log(error.response.status)
          } else if(error.request) {
            setNewFailure("Request to edit person sent, but no response.\nSee console.")
            console.log(error.request)
          } else {
            setNewFailure(error.message)
          }
          resetFailure()
          }
        )
      }
    } else { // Not a duplicate -> just add entry
      personsService.postPerson(nameObject)
      .then(response => {
        // Success -> just add response data so local persons matches server
        setPersons(persons.concat(response.data))
        setNewSuccess("Person added.")
        resetSuccess()
        }
      ).catch(error => {
        if(error.response) {
          setNewFailure(`${error.response.data.error}`)
          console.log(error.response.data)
          console.log(error.response.headers)
          console.log(error.response.status)
        } else if (error.request) {
          setNewFailure("Request to add person sent, but no response.\nSee console.")
          console.log(error.request)
        } else {
          setNewFailure(error.message)
        }
        resetFailure()
      })
    }
    // Reset input-states again
    setNewName("")
    setNewNumber("")
  }
  // Function to handle input to name field
  const handleNewName = (event) => {
    setNewName(event.target.value)
  }
  // Function to handle input to number field
  const handleNewNumber = (event) => {
    setNewNumber(event.target.value)
  }
  // Function to handle input to search field
  const handleNewSearch = (event) => {
    setNewSearch(event.target.value)
  }
  // Function to remove person
  const handleRemoval = (person) => {
    const msg = `Delete ${person.name}?`
    if (window.confirm(msg)) {
      // Check if person already removed by another client
      personsService
      .rmPerson(person)
      .then(response => {
        if (response.status === 204) {
          setPersons(persons.filter( removed => removed.id !== person.id))
          setNewSuccess(`Removed ${person.name}`)
          resetSuccess()
        }
      }).catch(error => {
        if (error.response) {
          setNewFailure("Server responded, but there was another fault (person probably already removed).\nCheck your console.")
          console.log(error.response.data)
          console.log(error.response.headers)
          console.log(error.response.status)
        } else if(error.request) {
          setNewFailure("Requested removal of person, but no response.\nSee console.")
          console.log(error.request)
        } else {
          setNewFailure(error.message)
        }
        resetFailure()
        // refetch persons in case there was conflict with server
        fetchPersons()
      })
    }
  }

  return (
    <div>
      <SuccessBox message={success}/>
      <FailureBox message={failure}/>
      <h2>Phonebook</h2>
      <PhonebookForm addName={addName} newName={newName} handleNewName={handleNewName}
        newNumber={newNumber} handleNewNumber={handleNewNumber}/>
      <h2>Numbers</h2>
      <PhonebookFilter newSearch={newSearch} handleNewSearch={handleNewSearch}/>
      <PhonebookList newSearch={newSearch} persons={persons} rmFunction={handleRemoval}/>

    </div>
  )
}

export default App
