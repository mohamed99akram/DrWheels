const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const {
  validateCreateOrder,
  validateOrderId,
  validateOrderIdParam,
  validateUpdateOrderStatus
} = require('../middleware/validation');

router.post('/', auth, validateCreateOrder, orderController.createOrder);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, validateOrderIdParam, orderController.getOrderById);
router.put('/:orderId/status', auth, validateUpdateOrderStatus, orderController.updateOrderStatus);
router.post('/:orderId/cancel', auth, validateOrderId, orderController.cancelOrder);

module.exports = router;

