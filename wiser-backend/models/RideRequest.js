import mongoose from 'mongoose';

const rideRequestSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    }
  },
  {
    timestamps: true,
  }
);

const RideRequest = mongoose.model('RideRequest', rideRequestSchema);
export default RideRequest;