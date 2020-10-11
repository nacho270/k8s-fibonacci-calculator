const keys = require("./keys");

// Express setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgress setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("connect", () => {
  pgClient
    .query("CREATE TABLE IF NOT EXISTS valores (number INT)")
    .catch((err) => console.log(err));
});
// redis setup
const redis = require("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// routes setup
app.get("/", (req, resp) => {
  resp.send("Hola amiwo");
});

app.get("/values/all", async (req, resp) => {
  const values = await pgClient.query("SELECT * FROM valores ");
  resp.send(values.rows);
});

app.get("/values/current", async (req, resp) => {
  redisClient.hgetall("values", (err, values) => {
    resp.send(values);
  });
});

app.post("/values", async (req, resp) => {
  const index = req.body.index;
  if (parseInt(index) > 40) {
    return resp.status(422).send("No te zarpes wacho, hasta 40 te banco amiwo");
  }

  redisClient.hset("values", index, "Calculating...");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO valores(number) VALUES($1)", [index]);
  resp.send({ working: true });
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
