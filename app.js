const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const databasePath = path.join(__dirname, "check.db");

const app = express();

app.use(express.json());
app.use(cors());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

/* Login Api */

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  /* console.log(username, password); */
  const query = `SELECT * FROM credentials WHERE username = '${username}';`;
  const dbUser = await database.get(query);
  if (dbUser === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    if (dbUser.PASSWORD === password) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      res.send({ jwtToken });
    } else {
      res.status(400);
      res.send("Invalid password");
    }
  }
});

/* pushing data to database api */

app.post("/", async (req, res) => {
  const { id, userId, title, body } = req.body;
  /* console.log(id, userId, title, body); */
  const query = `INSERT INTO 
        postdata (id,userId,title,body)
    VALUES
        (${parseInt(id)},${parseInt(userId)},'${title}','${body}');`;
  const userData = await database.run(query);
  /* console.log(userData); */
  res.send("Successfully added");
});

/* overall postdata of userId's api*/

app.get("/posts", async (req, res) => {
  const query = `select * from postdata;`;
  const userData = await database.all(query);
  res.send(userData);
});

/* post data of each userId */

app.get("/posts/:userId", async (req, res) => {
  const { userId } = req.params;
  /* console.log(userId); */
  const query = `select * from postdata where userId = ${parseInt(userId)};`;
  const responseData = await database.all(query);
  res.send(responseData);
});

/* just to delete */

app.delete("/", async (req, res) => {
  const query = `delete from postdata`;
  const responseData = await database.run(query);
});
