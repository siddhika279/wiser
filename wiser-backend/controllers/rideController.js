import Ride from '../models/Ride.js';

// @desc    Create a new ride
// @route   POST /api/rides
export const createRide = async (req, res) => {
  try {
    const { source, destination, date, time, seatsAvailable, rideType } = req.body;

    // Combine the date and time strings into one proper Date object for MongoDB
    const departureTime = new Date(`${date}T${time}`);

    const ride = await Ride.create({
      creator: req.user._id, // We get this safely from the middleware!
      source,
      destination,
      departureTime,
      seatsAvailable,
      rideType,
    });

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search for available carpools
// @route   GET /api/rides/search
export const searchRides = async (req, res) => {
  try {
    const { date } = req.query;

    // Create a time window for the whole day to find matches
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find active rides where someone is driving on that specific date
    const rides = await Ride.find({
      rideType: 'provide',
      status: 'active',
      seatsAvailable: { $gt: 0 }, // Must have at least 1 empty seat
      departureTime: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate('creator', 'name ecoScore'); // This magically pulls the driver's name and score from the User database!

    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book a seat on a ride
// @route   POST /api/rides/:id/request
export const requestRide = async (req, res) => {
  try {
    // 1. Find the specific ride in the database using the ID from the URL
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // 2. Prevent the driver from booking their own ride
    if (ride.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own ride!' });
    }

    // 3. Prevent booking if no seats are left
    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ message: 'Sorry, this ride is full.' });
    }

    // 4. Prevent double-booking
    if (ride.passengers.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already booked this ride.' });
    }

    // 5. Success! Deduct a seat and add the user to the passenger list
    ride.seatsAvailable -= 1;
    ride.passengers.push(req.user._id);

    await ride.save();

    res.status(200).json({ message: 'Ride booked successfully!', ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};