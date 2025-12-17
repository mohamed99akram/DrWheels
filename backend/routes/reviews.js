const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/car/:carId', auth, reviewController.createReview);
router.put('/:reviewId', auth, reviewController.updateReview);
router.delete('/:reviewId', auth, reviewController.deleteReview);
router.get('/car/:carId', reviewController.getCarReviews);
router.get('/user', auth, reviewController.getUserReviews);

module.exports = router;

