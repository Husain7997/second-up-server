const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_Username}:${process.env.DB_Password}@cluster0.molyssj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  // console.log(req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('unauthorized access')
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' })
    }
    req.decoded = decoded;
    next();
  })
}


async function run() {
  try {
    const categoryCollection = client.db("secondUp").collection("category");
    const productCollection = client.db("secondUp").collection("product");
    const bookingCollection = client.db("secondUp").collection("booking");
    const usersCollection = client.db("secondUp").collection("users");
    
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
      res.send(products);
    });

    app.get("/products", async (req, res) => {
      const query ={status:'available'};
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

    app.get('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await productCollection.findOne(query);
      // res.send({isavailable:service?.status == 'available'})
     res.send(service)
    });

    app.put('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const status = 'booked';
      const booking = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: status,
      title:booking.name,
      price:booking.price,
      ctegory:booking.category,
      name: booking.name,
      imgURL :booking.imgURL,
      email:booking.email ,
      rating: booking.rating,
      textarea:booking.textarea
        }
      };
      const result = await productCollection.updateOne(query, updatedDoc,options);
      res.send(result);
      
    })

  
    app.get('/myProduct', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email
        };
      }
      const cursor = productCollection.find(query);
      const myProduct = await cursor.toArray();
      res.send(myProduct);
    });
    app.get('/myordars', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email
        };
      }
      const cursor = productCollection.find(query);
      const myProduct = await cursor.toArray();
      res.send(myProduct);
    });

    app.get('/users', async (req, res) => {
      const query = {}
      const user = await usersCollection.find(query).toArray();
      res.send(user);
    })
    app.get('/sellar', async (req, res) => {
      const query = {usertype:'sellar'}
      const user = await usersCollection.find(query).toArray();
      res.send(user);
    })
    app.get('/bayer', async (req, res) => {
      const query = {usertype:'bayer'}
      const user = await usersCollection.find(query).toArray();
      res.send(user);
    })

    
    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      console.log(user);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '3h' });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: '' });
    });


    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const filter= {email}
      const user = await usersCollection.findOne(filter);
      res.send({isAdmin: user?.role =='admin'});
     
    })
    app.get('/users/sellar/:email', async (req, res) => {
      const email = req.params.email;
      const filter= {email}
      const user = await usersCollection.findOne(filter);
      res.send({isSellar: user?.usertype =='sellar'});
     
    })


    app.post('/users', async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });


    app.put('/users/admin/:id',verifyJWT, async (req, res) => {
      const id = req.params.id;
      const decodedEmail=req.decoded.email;
      const query = {email: decodedEmail};
      const user = await usersCollection.findOne(query);
      if(user.role !== 'admin'){
        return res.status(403).send({message:'forbidden Access'})
      }
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    })

    app.post('/AddAProduct', async (req, res) => {
      const addService = req.body;
      const result = await productCollection.insertOne(addService);
      res.send(result);
    })

    app.put('/product/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: 'available'
        }
      };
      const result = await productCollection.updateOne(query, updatedDoc,options);
      res.send(result);
    });

    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })

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