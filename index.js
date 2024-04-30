const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Travel Iq server is running");
});

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.omy4kgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
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
    const touristCollection = client.db("touristDB").collection("tourist");
    const countryCollection = client.db("touristDB").collection("country");

    app.get("/tourist", async (req, res) => {
      const cursor = touristCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/tourist", async (req, res) => {
      const newTourist = req.body;
      console.log(newTourist);
      const result = await touristCollection.insertOne(newTourist);
      res.send(result);
    });

    app.get("/myList/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await touristCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    app.put("/tourist/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTourist = req.body;
      const tourist = {
        $set: {
          spot: updatedTourist.spot,
          country: updatedTourist.country,
          location: updatedTourist.location,
          description: updatedTourist.description,
          price: updatedTourist.price,
          season: updatedTourist.season,
          time: updatedTourist.time,
          number: updatedTourist.number,
          email: updatedTourist.email,
          name: updatedTourist.name,
          photo: updatedTourist.photo,
        },
      };

      const result = await touristCollection.updateOne(
        filter,
        tourist,
        options
      );
      res.send(result);
    });

    app.delete("/tourist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristCollection.deleteOne(query);
      res.send(result);
    });

    //counry related apis

    app.get("/countries", async (req, res) => {
      const cursor = countryCollection.find();
      const result = await cursor.toArray();
      console.log(result)
      res.send(result);
    });


    app.get("/country/:name", async (req, res) => {
      console.log(req.params.name);
      const result = await countryCollection
        .find({ name: req.params.name })
        .toArray();
        console.log(result)
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

app.listen(port, () => {
  console.log(`TravelIQ is running on port: ${port}`);
});
