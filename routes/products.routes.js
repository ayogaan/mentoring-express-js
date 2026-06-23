const express = require('express')
const router = express.Router();
const controller = require('../controllers/products.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
router.get('/', authenticateToken, controller.getAllProducts);
router.post('/', authenticateToken, controller.createProduct);
router.get('/:id', authenticateToken, controller.getProductById);
router.put('/:id', authenticateToken, controller.updateProduct);
router.patch('/:id/price', authenticateToken, controller.updatePrice);
router.delete('/:id', controller.deleteProduct);

module.exports = router;