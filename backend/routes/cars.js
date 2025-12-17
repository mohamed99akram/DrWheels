const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const auth = require('../middleware/auth');

router.get('/my-cars', auth, carController.getMyCars);
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCarById);
router.post('/', auth, carController.createCar);
router.put('/:id', auth, carController.updateCar);
router.delete('/:id', auth, carController.deleteCar);

module.exports = router;
