const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
require("dotenv").config();
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const roomsCollection = client.db("hoteleo").collection("rooms");

    app.post("/rooms", async (req, res) => {
      const data = req.body;
      const result = await roomsCollection.insertOne(data);
      res.send(result);
    });

    app.get("/rooms", async (req, res) => {
      const { budget } = req.query;
      let filter = {};

      if (budget === "All") {
        filter = {};
      } else if (budget === "0-1000") {
        filter.price = { $lte: 1000 };
      } else if (budget === "1001-1500") {
        filter.price = { $gt: 1000, $lte: 1500 };
      } else if (budget === "1501+") {
        filter.price = { $gt: 1500 };
      }

      const result = await roomsCollection.find(filter).toArray();
      res.send(result);
    });

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

    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

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

    app.get("/my-bookings", async (req, res) => {
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
    });

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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hoteleo Server is Cooking!");
});

app.listen(port, () => {
  console.log(`Hoteleo app listening on port ${port}`);
});
