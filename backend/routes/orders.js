const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderById);
router.put('/:orderId/status', auth, orderController.updateOrderStatus);
router.post('/:orderId/cancel', auth, orderController.cancelOrder);

module.exports = router;

