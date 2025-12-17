const Car = require('../models/Car');

exports.getAllCars = async (req, res) => {
  try {
    const { 
      make, 
      model, 
      minPrice, 
      maxPrice, 
      year, 
      minYear,
      maxYear,
      minMileage,
      maxMileage,
      color,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      search
    } = req.query;
    
    const query = { status: 'available' };

    // Text search
    if (search) {
      query.$or = [
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Filters
    if (make) query.make = new RegExp(make, 'i');
    if (model) query.model = new RegExp(model, 'i');
    if (color) query.color = new RegExp(color, 'i');
    
    if (year) {
      query.year = parseInt(year);
    } else {
      if (minYear) query.year = { ...query.year, $gte: parseInt(minYear) };
      if (maxYear) query.year = { ...query.year, $lte: parseInt(maxYear) };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (minMileage || maxMileage) {
      query.mileage = {};
      if (minMileage) query.mileage.$gte = parseInt(minMileage);
      if (maxMileage) query.mileage.$lte = parseInt(maxMileage);
    }

    // Sorting
    const sortOptions = {};
    const validSortFields = ['createdAt', 'price', 'year', 'mileage', 'averageRating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const cars = await Car.find(query)
      .populate('seller', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Car.countDocuments(query);

    res.json({
      cars,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('seller', 'name email avatar');
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCar = async (req, res) => {
  try {
    const car = await Car.create({
      ...req.body,
      seller: req.user.id
    });
    await car.populate('seller', 'name email');
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Check ownership
    if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(car, req.body);
    await car.save();
    await car.populate('seller', 'name email');
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Check ownership
    if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await car.deleteOne();
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ seller: req.user.id })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
