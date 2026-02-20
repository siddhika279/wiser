import Ride from '../models/Ride.js';

// Helper Math Function: Calculates distance between two GPS coordinates in km
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
};

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

// @desc    Search for available carpools with Smart Route Matching (500m overlap)
// @route   GET /api/rides/search
export const searchRides = async (req, res) => {
  try {
    // Now we also receive the seeker's exact GPS coordinates!
    const { date, sourceLat, sourceLng, destLat, destLng } = req.query;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // 1. Get ALL active drives for that day
    const allRides = await Ride.find({
      rideType: 'provide',
      status: 'active',
      seatsAvailable: { $gt: 0 },
      departureTime: { $gte: startDate, $lte: endDate },
    }).populate('creator', 'name ecoScore gender phoneNumber');

    // 2. The Smart Matching Algorithm (Filter by 500m proximity)
    const MAX_DISTANCE_KM = 0.5; // 500 meters

    const matchedRides = allRides.filter((ride) => {
      if (!ride.routePath || ride.routePath.length === 0) return false;

      let isSourceNear = false;
      let isDestNear = false;

      // Check every GPS point on the driver's route
      for (const point of ride.routePath) {
        // Is this point within 500m of the Seeker's Source?
        if (!isSourceNear && getDistanceFromLatLonInKm(sourceLat, sourceLng, point.lat, point.lng) <= MAX_DISTANCE_KM) {
          isSourceNear = true;
        }
        // Is this point within 500m of the Seeker's Destination?
        if (!isDestNear && getDistanceFromLatLonInKm(destLat, destLng, point.lat, point.lng) <= MAX_DISTANCE_KM) {
          isDestNear = true;
        }

        // If both are true, it's a match! Stop calculating to save memory.
        if (isSourceNear && isDestNear) return true;
      }

      return false; // Throw this ride away if it doesn't pass near both points
    });

    res.status(200).json(matchedRides);
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

// @desc    Get logged-in user's rides (Provided and Requested)
// @route   GET /api/rides/my-rides
export const getMyRides = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find rides where the user is the driver
    const providedRides = await Ride.find({ creator: userId })
      .sort({ departureTime: 1 }); // Sort by soonest

    // 2. Find rides where the user is a passenger
    const requestedRides = await Ride.find({ passengers: userId })
      .populate('creator', 'name ecoScore') // Get the driver's details!
      .sort({ departureTime: 1 });

    res.status(200).json({
      providedRides,
      requestedRides,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};