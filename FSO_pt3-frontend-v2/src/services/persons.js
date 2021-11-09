// All pretty empty and selfexplanatory

import axios from 'axios'

const baseURL = "/api/persons/"

const getAllPersons = () => {
  return axios.get(baseURL)
}

const postPerson = person => {
  return axios.post(baseURL, person)
}

const rmPerson = person => {
    return(axios.delete(baseURL + person.id))
}

const changePerson = (person, newPerson) => {
    return axios.put(baseURL + person.id, newPerson)
}

const personsService = {
  getAllPersons: getAllPersons,
  postPerson: postPerson,
  rmPerson: rmPerson,
  changePerson: changePerson
}

export default personsService
