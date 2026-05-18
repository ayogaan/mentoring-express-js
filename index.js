const express = require('express')
const app = express()
const port = 3000
const productRoutes = require('./routes/products.routes');

app.use(express.json());
app.use('/api', productRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
