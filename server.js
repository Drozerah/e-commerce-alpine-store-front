const express = require('express')
const app = express()
const createHttpError = require('http-errors')

// settings
app.set('PORT', process.env.port || 3000)

// middlewares
app.use(express.static('public'))

// routes
app.get('/', (req, res) => {
  res.sendFile('./dist/index.html')
})

// 404 error
app.use((req, res, next) => {
  next(createHttpError.NotFound())
})

// 500 error
app.use((error, req, res, next) => {
  error.status = error.status || 500
  res.status(error.status)
  res.send({
    error,
    page_name: 'error'
  })
})

app.listen(app.get('PORT'), function () {
  console.log(`[express] listening http://localhost:${this.address().port}`)
})
