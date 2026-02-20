import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This links the ride directly to the User who created it
    },
    approvedPassengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    routePath: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      }
    ],
    seatsAvailable: {
      type: Number,
      required: true,
      default: 1,
    },
    rideType: {
      type: String,
      required: true,
      enum: ['provide', 'find'], // <-- Now it matches your frontend!
    },
    estimatedCost: {
      type: Number, // We can use this later for the Price Comparison module
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    }
  },
  {
    timestamps: true,
  }
);

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;