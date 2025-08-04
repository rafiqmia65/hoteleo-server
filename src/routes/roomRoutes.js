import express from "express";
import { verifyFireBaseToken } from "../middleware/verifyFireBaseToken.js";
import { verifyTokenEmail } from "../middleware/verifyTokenEmail.js";

import {
  createRoom,
  getRooms,
  getTopRatedRooms,
  getRoomDetails,
  bookRoom,
  getMyBookings,
  getLatestReviews,
  addReview,
  updateBookingDate,
  cancelBooking,
} from "../controllers/roomController.js";

const router = express.Router();

// Create new room
router.post("/", createRoom);

// Get all rooms (with budget filter)
router.get("/rooms", getRooms);

// Top rated rooms (must be before :id route)
router.get("/top-rated-room", getTopRatedRooms);

// Room details by ID
router.get("/rooms/:id", getRoomDetails);

// Room Booking by id
router.patch("/book-room/:id", bookRoom);

// My Bookings rooms
router.get(
  "/my-bookings",
  verifyFireBaseToken,
  verifyTokenEmail,
  getMyBookings
);

// Get all Reviews
router.get("/latest-reviews", getLatestReviews);

// Review added
router.patch("/review/:roomId", verifyFireBaseToken, addReview);

// Update Room Booking date
router.patch(
  "/booking-date-update",
  verifyFireBaseToken,
  verifyTokenEmail,
  updateBookingDate
);

// Cancel room booking
router.delete(
  "/booking-cancel",
  verifyFireBaseToken,
  verifyTokenEmail,
  cancelBooking
);

export default router;
