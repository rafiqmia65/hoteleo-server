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

    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

    app.patch("/book-room/:id", async (req, res) => {
      const roomId = req.params.id;
      const { name, email, date } = req.body;

      const bookingEntry = { roomId, name, email, date };

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

    app.patch("/review/:roomId", async (req, res) => {
      const roomId = req.params.roomId;
      const { review } = req.body;

      const filter = { _id: new ObjectId(roomId) };
      const update = {
        $push: {
          reviews: review,
        },
      };

      const result = await roomsCollection.updateOne(filter, update);
      res.send(result);
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
