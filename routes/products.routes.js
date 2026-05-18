const express = require('express')
const router = express.Router();
const controller = require('../controllers/products.controller');

router.get('/products', controller.getAllProducts);
router.post('/products', controller.createProduct);
router.get('/products/:id', controller.getProductById);
router.put('/products/:id', controller.updateProduct);
router.patch('/products/:id/price', controller.updatePrice);
router.delete('/products/:id', controller.deleteProduct);

module.exports = router;