const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongojs = require("mongojs");
const bcrypt = require("bcrypt");
const jwt = require("jwt-simple");
const moment = require("moment");



const app = express();


const config = require("./config"); 

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

app.post("/api/auth/reg", async (req, res) => {
  const { name, email, pass } = req.body;

  if (!name || !email || !pass) {
    return res.json({ result: "KO", msg: "Datos incompletos" });
  }

  const hash = await bcrypt.hash(pass, 10);

  const user = {
    email,
    displayName: name,
    password: hash,
    signupDate: moment().unix(),
    lastLogin: moment().unix(),
  };

  db.user.insert(user, (err, doc) => {
    if (err) return res.json({ result: "KO", msg: err });

    const payload = {
      sub: doc._id,
      iat: moment().unix(),
      exp: moment().add(7, "days").unix(),
    };

    const token = jwt.encode(payload, config.SECRET);

    res.json({
      result: "OK",
      token,
      usuario: doc,
    });
  });
});



app.post("/api/auth/login", (req, res) => {
  const { email, pass } = req.body;

  db.user.findOne({ email }, async (err, user) => {
    if (!user)
      return res.json({
        result: "KO",
        msg: "Usuario o contraseña incorrectos",
      });

    const match = await bcrypt.compare(pass, user.password);

    if (!match)
      return res.json({
        result: "KO",
        msg: "Usuario o contraseña incorrectos",
      });

    const payload = {
      sub: user._id,
      iat: moment().unix(),
      exp: moment().add(7, "days").unix(),
    };

    const token = jwt.encode(payload, config.SECRET);

    res.json({
      result: "OK",
      token,
      usuario: user,
    });
  });
});
