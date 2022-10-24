const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

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

async function run() {
  try {
    await client.connect();
    const db = client.db("market-place");
    const blogCollection = db.collection("blogs");
    const productCollection = db.collection("products");

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
