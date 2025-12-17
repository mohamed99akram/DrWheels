const Order = require('../models/Order');
const Car = require('../models/Car');

exports.createOrder = async (req, res) => {
  try {
    const { carId, notes } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Check if car is available
    if (car.status !== 'available') {
      return res.status(400).json({ error: 'Car is not available for purchase' });
    }

    // Check if user is trying to buy their own car
    if (car.seller.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot purchase your own car' });
    }

    const order = await Order.create({
      buyer: req.user.id,
      car: carId,
      seller: car.seller,
      amount: car.price,
      notes
    });

    // Mark car as pending
    car.status = 'pending';
    await car.save();

    await order.populate('car', 'make model year price images');
    await order.populate('buyer', 'name email');
    await order.populate('seller', 'name email');

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { type } = req.query; // 'buyer' or 'seller'
    
    const query = type === 'seller' 
      ? { seller: req.user.id }
      : { buyer: req.user.id };

    const orders = await Order.find(query)
      .populate('car', 'make model year price images')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('car')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (order.buyer._id.toString() !== req.user.id && 
        order.seller._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization (seller or admin)
    if (order.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // If order is completed, mark car as sold
    if (status === 'completed') {
      const car = await Car.findById(order.car);
      if (car) {
        car.status = 'sold';
        await car.save();
      }
    }

    // If order is cancelled, mark car as available
    if (status === 'cancelled') {
      const car = await Car.findById(order.car);
      if (car) {
        car.status = 'available';
        await car.save();
      }
    }

    await order.save();

    await order.populate('car', 'make model year price images');
    await order.populate('buyer', 'name email');
    await order.populate('seller', 'name email');

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization (buyer or admin)
    if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    order.status = 'cancelled';
    await order.save();

    // Mark car as available
    const car = await Car.findById(order.car);
    if (car) {
      car.status = 'available';
      await car.save();
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

