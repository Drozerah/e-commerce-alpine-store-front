const express = require('express')
const app = express()
app.set('PORT', process.env.port || 3000)

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile('./dist/index.html')
})

app.listen(app.get('PORT'), function(){
  console.log(`[express] listening http://localhost:${this.address().port}`)
})