const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const auth = require('../middleware/auth');
const {
  validateCreateCar,
  validateUpdateCar,
  validateCarId,
  validateQueryParams
} = require('../middleware/validation');

router.get('/my-cars', auth, carController.getMyCars);
router.get('/', validateQueryParams, carController.getAllCars);
router.get('/:id', validateCarId, carController.getCarById);
router.post('/', auth, validateCreateCar, carController.createCar);
router.put('/:id', auth, validateCarId, validateUpdateCar, carController.updateCar);
router.delete('/:id', auth, validateCarId, carController.deleteCar);

module.exports = router;
