const Review = require('../models/Review');
const Car = require('../models/Car');

exports.createReview = async (req, res) => {
  try {
    const { carId } = req.params;
    const { rating, comment } = req.body;

    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Check if user already reviewed this car
    const existing = await Review.findOne({ car: carId, user: req.user.id });
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this car' });
    }

    const review = await Review.create({
      car: carId,
      user: req.user.id,
      rating,
      comment
    });

    await review.populate('user', 'name email');
    
    // Update car average rating
    await updateCarRating(carId);

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this car' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    await review.populate('user', 'name email');
    
    // Update car average rating
    await updateCarRating(review.car);

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const carId = review.car;
    await review.deleteOne();

    // Update car average rating
    await updateCarRating(carId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCarReviews = async (req, res) => {
  try {
    const { carId } = req.params;
    const reviews = await Review.find({ car: carId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('car', 'make model year images')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update car average rating
async function updateCarRating(carId) {
  const reviews = await Review.find({ car: carId });
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await Car.findByIdAndUpdate(carId, {
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length
  });
}

