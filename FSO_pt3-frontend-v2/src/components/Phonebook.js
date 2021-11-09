import React from 'react'

// Component to filter out entries
const PhonebookFilter = ({newSearch, handleNewSearch}) => {
  return(
    <div>
    filter to show with: <input value={newSearch} onChange={handleNewSearch}/>
    </div>
  )
}

// Component to handle addition
const PhonebookForm = // Pass functions and state variables
  ({addName, newName, handleNewName, newNumber, handleNewNumber}) => {
  return(
    <div>
    <form onSubmit={addName}>
      <div>
        name: <input value={newName} onChange={handleNewName}/>
        number: <input value={newNumber} onChange={handleNewNumber}/>
      </div>
      <div>
        <button type="submit">add</button>
        </div>
    </form>
    </div>
  )
}

// Component to display list of persons
const PhonebookList = ({persons, newSearch, rmFunction}) => {
  // Prevent list from rendering when no data has been received
  if (persons.length === 1 && persons[0].name === '' && persons[0].number === '') {
    return null
  }
  return (
    <div>
    { // Filter and render persons by search term incasesensitively
    persons.filter( person =>
        person.name.toLowerCase().includes(newSearch.toLowerCase())).map(
          person => <PhonebookLine key={person.id} person={person} rmFunction={rmFunction} />
        )
    }
    </div>
  )
}

// And individual entry to phonebook, delete-button included
// rmFunction: what to call when delete-button pressed
const PhonebookLine = ({person, rmFunction}) => {
  return(
    <div className="person">
    <p key={person.name}>{person.name} {person.number}</p><button onClick={() => rmFunction(person)}>delete</button>
    </div>
  )
}
// Component to display messages to user
const SuccessBox = ({message}) => {
  if (message === null) {
    return null
  }
  return(
    <div className="success">
      {message}
    </div>
  )
}
// Component to display failure message
const FailureBox = ({message}) => {
  if (message === null) {
    return null
  }
  return(
    <div className="failure">
      {message}
    </div>
  )
}

export default PhonebookForm
export {PhonebookFilter, PhonebookList, SuccessBox, FailureBox}
