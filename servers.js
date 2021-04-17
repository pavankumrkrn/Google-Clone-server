const express = require("express");
const cors = require("cors");
const { authenticate, createJWT } = require("./auth");
const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");
const { URL } = require("./mongoURL");

const mongoClient = mongodb.MongoClient;
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

app.post("/login", async (req, res) => {
  try {
    const client = await mongoClient.connect(URL, {
      useNewURLParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db("Google-Clone");
    const user = await db
      .collection("Users")
      .findOne({ email: req.body.email }, {});
    if (user) {
      let result = user.password === req.body.password;
      if (result) {
        const token = await createJWT({ id: user._id });
        console.log(token);
        res.json({
          data: { userEmail: user.email, token },
          code: "green",
          message: "Login Successful",
        });
      } else {
        res.json({
          data: "",
          code: "red",
          message: "Wrong Password",
        });
      }
    } else {
      res.json({
        data: "",
        code: "red",
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      data: "",
      code: "red",
      message: "Login Failed",
    });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const client = await mongoClient.connect(URL, {
      useNewURLParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db("Google-Clone");
    const email = req.body.email;
    const user = await db.collection("Users").findOne({ email: email }, {});
    if (user !== null) {
      res.json({
        data: "",
        code: "red",
        message: "EmailId already exists. Please signup with different email",
      });
    } else {
      let usr = req.body;
      usr.history = [];
      await db.collection("Users").insertOne(usr);
      const insertedUser = await db
        .collection("Users")
        .findOne({ email: usr.email }, {});
      res.json({
        data: "",
        code: "green",
        message: "signup successful",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      data: "",
      code: "red",
      message: "signup failed",
    });
  }
});

app.get("/", async (req, res) => {
  res.json("Hi");
});

app.get("/getHistory/:userEmail", authenticate, async (req, res) => {
  try {
    const client = await mongoClient.connect(URL, {
      useNewURLParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db("Google-Clone");
    const email = req.params.userEmail;
    const user = await db.collection("Users").findOne({ email: email }, {});
    if (user !== null) {
      res.json({
        data: user.history.map((i) => JSON.parse(i)),
        code: "green",
        message: "History Fetched",
      });
    } else {
      res.json({
        data: "",
        code: "red",
        message: "Getting History Failed",
      });
    }
  } catch (error) {
    res.json({
      data: "",
      code: "red",
      message: error,
    });
  }
});

app.put("/addToHistory", authenticate, async (req, res) => {
  console.log("hi");
  try {
    const client = await mongoClient.connect(URL, {
      useNewURLParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db("Google-Clone");
    const details = req.body;
    const email = details.userData.userEmail;
    const item = { title: details.title, link: details.link };
    const user = await db.collection("Users").findOne({ email: email }, {});
    console.log(user);
    if (user !== null) {
      const history = user.history;
      history.push(JSON.stringify(item));
      console.log(history);
      await db
        .collection("Users")
        .updateOne(
          { email: user.email },
          { $set: { history: [...new Set(history)] } },
          { upsert: false }
        );
      res.json({
        data: "",
        code: "green",
        message: "item added in history",
      });
    } else {
      res.json({
        data: "",
        code: "red",
        message: "operation failed",
      });
    }
  } catch (error) {
    res.json({
      data: "",
      code: "red",
      message: error,
    });
  }
});

app.listen(port, async (req, res) => {
  console.log("Listening to " + port);
});
