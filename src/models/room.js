import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now },
});

const bookedDateSchema = new mongoose.Schema({
  roomId: String,
  name: String,
  email: String,
  date: String,
});

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    features: [String],
    reviews: [Object],
    location: String,
    availability: { type: Boolean, default: true },
    bookedDates: [bookedDateSchema],
    bedType: String,
    maxGuests: Number,
    size: String,
    amenities: [String],
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model("room", roomSchema);
