const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

router.post('/', auth, favoriteController.addFavorite);
router.delete('/:carId', auth, favoriteController.removeFavorite);
router.get('/', auth, favoriteController.getFavorites);
router.get('/check/:carId', auth, favoriteController.checkFavorite);

module.exports = router;

