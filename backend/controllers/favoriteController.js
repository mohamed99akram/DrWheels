const Favorite = require('../models/Favorite');
const Car = require('../models/Car');

exports.addFavorite = async (req, res) => {
  try {
    const carId = req.body.carId || req.body.car;
    
    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ user: req.user.id, car: carId });
    if (existing) {
      return res.status(400).json({ error: 'Car already in favorites' });
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      car: carId
    });

    await favorite.populate('car', 'make model year price images');
    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Car already in favorites' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { carId } = req.params;
    
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      car: carId
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('car')
      .sort({ createdAt: -1 });
    
    res.json(favorites.map(fav => fav.car));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const { carId } = req.params;
    const favorite = await Favorite.findOne({
      user: req.user.id,
      car: carId
    });
    
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

