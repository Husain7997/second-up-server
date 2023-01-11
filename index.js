const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_Username}:${process.env.DB_Password}@cluster0.molyssj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const categoryCollection = client.db("secondUp").collection("category");
    const productCollection = client.db("secondUp").collection("product");
    const bookingCollection = client.db("secondUp").collection("booking");
    
    app.get("/", async (req, res) => {
      const size=parseInt(req.query.size)
     
      const query = {};
      const cursor = productCollection.find(query);
      const home = await cursor.limit(size).toArray();
      res.send(home);
    });

    app.get('/category/:name', async (req, res) => {
      const category = req.params.name;
      const categoryQuery = { category };
      const products = await productCollection.find(categoryQuery).toArray();
      console.log(products)

      res.send(products);
    });




    app.get("/products", async (req, res) => {
      const query = {}
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
   

    app.get('/productdetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await productCollection.findOne(query);
      res.send(service);
    });

    // app.get('/booking/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const service = await productCollection.findOne(query);
    //   res.send(service);
    // });

    // app.get('/myreview', async (req, res) => {
    //   let query = {};
    //   if (req.query.email) {
    //     query = {
    //       email: req.query.email
    //     };
    //   }
    //   const cursor = reviewCollection.find(query);
    //   const myreview = await cursor.toArray();
    //   res.send(myreview);
    // });

    // app.get('/review', async (req, res) => {
    //   // const id = req.params.id;
    //   let query = {};
    //   if (req.params.id) {
    //     query = {
    //       id: req.query.id
    //     };
    //   }
    //   const cursor = reviewCollection.find(query);
    //   const review = await cursor.toArray();
    //   res.send(review);
    // });
    // app.get('/booking', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const service = await productCollection.findOne(query);
    //   res.send(service);
    // })


    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })

    // app.post('/addService', async (req, res) => {
    //   const addService = req.body;
    //   const result = await servicesCollection.insertOne(addService);
    //   res.send(result);
    // })

    // app.put('/review/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const status = req.body.status;
    //   const query = { _id: ObjectId(id) };
    //   const options = { upsert: true };
    //   const updatedDoc = {
    //     $set: {
    //       status: status
    //     }
    //   };
    //   const result = await reviewCollection.updateOne(query, updatedDoc,options);
    //   res.send(result);
    // });

    // app.delete('/review/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const result = await reviewCollection.deleteOne(query);
    //   res.send(result);
    // })

  } finally {

  }

app.get('/', (req, res) => {
  res.send('Server Runing')
});



};
run().catch(err => console.log(err))
app.listen(port, () => {
  console.log(` server running on port ${port}`)
});