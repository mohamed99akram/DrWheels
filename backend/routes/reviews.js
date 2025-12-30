const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const {
  validateCreateReview,
  validateReviewId,
  validateUpdateReview,
  validateCarId
} = require('../middleware/validation');

router.post('/car/:carId', auth, validateCreateReview, reviewController.createReview);
router.put('/:reviewId', auth, validateUpdateReview, reviewController.updateReview);
router.delete('/:reviewId', auth, validateReviewId, reviewController.deleteReview);
router.get('/car/:carId', validateCarId, reviewController.getCarReviews);
router.get('/user', auth, reviewController.getUserReviews);

module.exports = router;

