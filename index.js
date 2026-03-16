const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongojs = require("mongojs");

const config = require("./config");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

const db = mongojs(config.DB, ["user"]);

const port = config.PORT;

app.get("/", (req, res) => {
  res.json({ msg: "API AUTH funcionando" });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 
app.get("/api/user", (req, res) => {
  db.user.find((err, docs) => {
    if (err) return res.status(500).json({ result: "KO", msg: err });
    res.json({ result: "OK", users: docs });
  });
});

app.get("/api/user/:id", (req, res) => {
  db.user.findOne({ _id: mongojs.ObjectId(req.params.id) }, (err, doc) => {
    if (err) return res.status(500).json({ result: "KO", msg: err });
    res.json({ result: "OK", user: doc });
  });
});

app.post("/api/user", (req, res) => {
  db.user.insert(req.body, (err, doc) => {
    if (err) return res.status(500).json({ result: "KO", msg: err });
    res.json({ result: "OK", user: doc });
  });
});

app.put("/api/user/:id", (req, res) => {
  db.user.update(
    { _id: mongojs.ObjectId(req.params.id) },
    { $set: req.body },
    {},
    (err) => {
      if (err) return res.status(500).json({ result: "KO", msg: err });
      res.json({ result: "OK" });
    }
  );
});

app.delete("/api/user/:id", (req, res) => {
  db.user.remove({ _id: mongojs.ObjectId(req.params.id) }, (err) => {
    if (err) return res.status(500).json({ result: "KO", msg: err });
    res.json({ result: "OK" });
  });
});
