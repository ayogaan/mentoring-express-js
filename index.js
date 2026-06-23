const express = require('express')
const app = express()
const port = 3000
const productRoutes = require('./routes/products.routes');
const authRoutes = require('./routes/auth.routes');
app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!')
})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
