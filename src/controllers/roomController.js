import Room from "../models/room.js";
import mongoose from "mongoose";

// Create Room
export const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Rooms
export const getRooms = async (req, res) => {
  try {
    const { budget } = req.query;
    let filter = {};

    if (!budget || budget === "All") {
      filter = {};
    } else if (budget === "0-1000") {
      filter.price = { $lte: 1000 };
    } else if (budget === "1001-1500") {
      filter.price = { $gt: 1000, $lte: 1500 };
    } else {
      filter.price = { $gt: 1500 };
    }

    const rooms = await Room.find(filter);
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Top Rated rooms
export const getTopRatedRooms = async (req, res) => {
  try {
    const topRooms = await Room.aggregate([
      {
        $addFields: {
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $avg: "$reviews.rating" },
              0,
            ],
          },
          totalReviews: { $size: "$reviews" },
        },
      },
      {
        $sort: {
          avgRating: -1,
          totalReviews: -1,
        },
      },
      { $limit: 6 },
      {
        $project: {
          title: 1,
          image: 1,
          price: 1,
          description: 1,
          features: 1,
          location: 1,
          bedType: 1,
          size: 1,
          maxGuests: 1,
          amenities: 1,
          tags: 1,
          availability: 1,
          bookedDates: 1,
          reviews: 1,
          avgRating: 1,
          totalReviews: 1,
        },
      },
    ]);

    res.status(200).json(topRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single room details
export const getRoomDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Room Booking Process
export const bookRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { name, email, date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid room ID" });
    }

    const bookingEntry = {
      _id: new mongoose.Types.ObjectId(),
      roomId,
      name,
      email,
      date,
    };

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      {
        $set: { availability: false },
        $push: { bookedDates: bookingEntry },
      },
      { new: true }
    );

    if (!updatedRoom) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    res.status(200).json({
      success: true,
      message: "Room booked successfully",
      room: updatedRoom,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// My Bookings rooms
export const getMyBookings = async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const rooms = await Room.find({});

    const userBookings = [];

    rooms.forEach((room) => {
      room.bookedDates?.forEach((booking) => {
        if (booking.email === email) {
          userBookings.push({
            bookingId: booking._id,
            roomId: room._id,
            title: room.title,
            image: room.image,
            date: booking.date,
          });
        }
      });
    });

    res.status(200).json(userBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews
export const getLatestReviews = async (req, res) => {
  try {
    const rooms = await Room.find();
    const allReviews = rooms
      .flatMap(
        (room) =>
          room.reviews?.map((review) => ({
            ...(review.toObject ? review.toObject() : review),
            roomTitle: room.title,
            roomId: room._id,
            roomImage: room.image,
            date: new Date(review.date),
          })) || []
      )
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Review added
export const addReview = async (req, res) => {
  const { roomId } = req.params;
  const { review } = req.body;

  if (!review || !review.name || !review.rating || !review.comment) {
    return res.status(400).json({
      success: false,
      message: "Invalid review data",
    });
  }

  try {
    const result = await Room.updateOne(
      { _id: roomId },
      { $push: { reviews: review } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found or no changes made",
      });
    }

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update room booking date
export const updateBookingDate = async (req, res) => {
  const { roomId, bookingId, newDate } = req.body;

  try {
    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(roomId) ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      return res.status(400).json({ message: "Invalid roomId or bookingId" });
    }

    // Validate Date
    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const filter = {
      _id: roomId,
      "bookedDates._id": bookingId,
    };

    const update = {
      $set: {
        "bookedDates.$.date": parsedDate,
      },
    };

    const result = await Room.updateOne(filter, update);

    if (result.modifiedCount > 0) {
      return res.json({
        success: true,
        message: "Booking date updated successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Booking not found or already updated",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Cancel room booking
export const cancelBooking = async (req, res) => {
  const { bookingId, roomId } = req.body;

  // Validate
  if (
    !mongoose.Types.ObjectId.isValid(roomId) ||
    !mongoose.Types.ObjectId.isValid(bookingId)
  ) {
    return res.status(400).json({ message: "Invalid roomId or bookingId" });
  }

  try {
    const filter = { _id: roomId };
    const updateDoc = {
      $pull: { bookedDates: { _id: bookingId } },
      $set: { availability: true },
    };

    const result = await Room.updateOne(filter, updateDoc);

    res.send({
      success: result.modifiedCount > 0,
      message:
        result.modifiedCount > 0
          ? "Booking cancelled successfully"
          : "Booking not found or already cancelled",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
