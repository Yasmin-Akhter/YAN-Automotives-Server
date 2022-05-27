const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0qn5o3z.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// const verifyJwt = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         res.status(401).send({ message: 'unauthorized access' })
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             res.status(403).send({ message: 'forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     });

// }

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("manufacturer").collection("product");
        const userCollection = client.db("manufacturer").collection("user");
        const orderCollection = client.db("manufacturer").collection("order");

        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/products/:id', async (req, res) => {
            id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product)
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const updatedUser = await userCollection.findOne(filter);
            const token = jwt.sign({ email: email }, process.env.TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, updatedUser, token });
        });

        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            console.log(newOrder);
            const result = await orderCollection.insertOne(newOrder);
            res.send(result);
        });

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/order', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            const query = { email: email };
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        });
        app.get('/user-info/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            res.send(user);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send('welcome');
});


app.listen(port, () => {
    console.log('port', port);
})