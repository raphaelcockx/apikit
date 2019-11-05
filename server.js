const bodyParser = require('body-parser')
const express = require('express')
const lodashId = require('lodash-id')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const path = require('path')

const config = require('./config.json')
const port = config.port || 3000
const resourceName = config.resourceName || 'resources'
const base = `/${resourceName}`
const defaults = { [resourceName]: [] }

const app = express()
app.use(bodyParser.json())

const adapter = new FileAsync(path.join(__dirname, 'data', 'resources.json'))
const db = low(adapter)

db
  .then(db => {

    db.defaults(defaults).write()
    db._.mixin(lodashId)

    const resources = db.get(resourceName)

    // CREATE    
    app.post(base, (req, res) => {
      const entry = req.body
      resources.push(entry).last().write().then(entryAdded => res.json(entryAdded))
    })

    // READ
    app.get(base, (req, res) => {
      res.json(resources.value())
    })

    app.get(`${base}/:id`, (req, res) => {
      const id = req.params.id
      const resource = resources.getById(id)
      res.json(resource.value())
    })

    // UPDATE
    app.put(`${base}/:id`, (req, res) => {
      const id = req.params.id
      const newResource = req.body
      resources.updateById(id, newResource).write().then(changedEntry => res.json(changedEntry))
    })

    // DELETE
    app.delete(`${base}/:id`, (req, res) => {
      const id = req.params.id
      resources.removeById(id).write().then(entryRemoved => res.json(entryRemoved))
    })

    app.listen(port, () => {
      console.log(`Your API is listening on port ${port}`)
    })
  })
