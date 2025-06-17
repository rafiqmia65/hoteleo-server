const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
require("dotenv").config();
const admin = require("firebase-admin");
const port = process.env.PORT || 3000;

// Middle Ware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// token Convert

const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString(
  "utf8"
);
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Verify Token

const verifyFireBaseToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    req.decoded = decoded;

    next();
  } catch (error) {
    return res.status(401).send({ message: "unauthorized access" });
  }
};

// Verify Email
const verifyTokenEmail = (req, res, next) => {
  if (req.query.email !== req.decoded.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

async function run() {
  try {
    const roomsCollection = client.db("hoteleo").collection("rooms");

    app.post("/rooms", async (req, res) => {
      const data = req.body;
      const result = await roomsCollection.insertOne(data);
      res.send(result);
    });

    app.get("/rooms", async (req, res) => {
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

      const result = await roomsCollection.find(filter).toArray();
      res.send(result);
    });

    // Top Rated Room

    app.get("/top-rated-room", async (req, res) => {
      const topRooms = await roomsCollection
        .aggregate([
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
        ])
        .toArray();

      res.send(topRooms);
    });

    // Room Details

    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

    // Booking Process

    app.patch("/book-room/:id", async (req, res) => {
      const roomId = req.params.id;
      const { name, email, date } = req.body;

      const bookingEntry = { _id: new ObjectId(), roomId, name, email, date };

      const result = await roomsCollection.updateOne(
        { _id: new ObjectId(roomId) },
        {
          $set: { availability: false },
          $push: { bookedDates: bookingEntry },
        }
      );

      res.send(result);
    });

    // My Bookings Rooms

    app.get(
      "/my-bookings",
      verifyFireBaseToken,
      verifyTokenEmail,
      async (req, res) => {
        const { email } = req.query;

        const rooms = await roomsCollection.find({}).toArray();

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

        res.send(userBookings);
      }
    );

    // Total Review get

    app.get("/latest-reviews", async (req, res) => {
      const rooms = await roomsCollection.find().toArray();
      const allReviews = rooms
        .flatMap(
          (room) =>
            room.reviews?.map((review) => ({
              ...review,
              roomTitle: room.title,
              roomId: room._id,
              roomImage: room.image,
              date: new Date(review.date),
            })) || []
        )
        .sort((a, b) => b.date - a.date)

        .slice(0, 10);

      res.send(allReviews);
    });

    // Review Added

    app.patch("/review/:roomId", async (req, res) => {
      const { roomId } = req.params;
      const { review } = req.body;

      if (!review || !review.name || !review.rating || !review.comment) {
        return res.status(400).json({
          success: false,
          message: "Invalid review data",
        });
      }

      const result = await roomsCollection.updateOne(
        { _id: new ObjectId(roomId) },
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
    });

    // Booking Date Update

    app.patch("/booking-date-update", async (req, res) => {
      const { roomId, bookingId, newDate } = req.body;

      const filter = {
        _id: new ObjectId(roomId),
        "bookedDates._id": new ObjectId(bookingId),
      };

      const update = {
        $set: {
          "bookedDates.$.date": newDate,
        },
      };

      const result = await roomsCollection.updateOne(filter, update);

      res.send({
        success: result.modifiedCount > 0,
        message:
          result.modifiedCount > 0
            ? "Booking date updated successfully"
            : "Booking not found or already updated",
      });
    });

    // Booking Room Cancel

    app.delete("/booking-cancel", async (req, res) => {
      const { bookingId, roomId } = req.body;

      const filter = {
        _id: new ObjectId(roomId),
      };

      const updateDoc = {
        $pull: {
          bookedDates: {
            _id: new ObjectId(bookingId),
          },
        },
        $set: { availability: true },
      };

      const result = await roomsCollection.updateOne(filter, updateDoc);

      res.send({
        success: result.modifiedCount > 0,
        message:
          result.modifiedCount > 0
            ? "Booking cancelled successfully"
            : "Booking not found or already cancelled",
      });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hoteleo Server is Cooking!");
});

app.listen(port, () => {
  console.log(`Hoteleo app listening on port ${port}`);
});
