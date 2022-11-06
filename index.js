const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//use middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpki4mr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden  Access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const db = client.db("market-place");
    const blogCollection = db.collection("blogs");
    const productCollection = db.collection("products");
    const usersCollection = db.collection("users");

    app.put("/users", async (req, res) => {
      const email = req.body.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ result: result, token: token });
    });

    // get all blogs
    // app.get("/products", async (req, res) => {
    //   const result = await productCollection.find({}).toArray();
    //   res.json(result);
    // });

    // get all products
    app.get("/products", async (req, res) => {
      const tag = req.query.tag;
      if (tag !== undefined) {
        result = await productCollection
          .find({
            tags: { $in: [tag] },
          })
          .toArray();

        return res.json(result);
      }

      result = await productCollection.find({}).toArray();
      res.json(result);
    });
    // get all blogs
    app.get("/allProducts", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.json(result);
    });

    // single product
    app.get("/singleProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.json(result);
    });

    // relatedProducts
    app.get("/relatedProducts", async (req, res) => {
      const tags = req.query.tags_like;
      const limit = parseInt(req.query._limit);
      const result = await productCollection
        .find({
          tags: { $in: tags },
        })
        .limit(limit)
        .toArray();
      res.json(result);
    });

    // get all blogs
    app.get("/blogs", async (req, res) => {
      const result = await blogCollection.find({}).toArray();
      res.json(result);
    });
    // single blog
    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello market-place server " + port);
});

// running server
app.listen(port, () => {
  console.log("market-place server running " + port);
});
