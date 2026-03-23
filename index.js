'use strict'

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongojs = require("mongojs");
const bcrypt = require("bcrypt");
const moment = require("moment");

const config = require("./config");
const TokenHelper = require("./helpers/token.helper");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

const db = mongojs(config.DB, ["user"]);
const port = config.PORT;



// ============================
// Middleware AUTH (JWT)
// ============================

function auth(req, res, next) {

  if (!req.headers.authorization) {
    return res.status(401).json({ result: "KO", msg: "No autorizado" });
  }

  const token = req.headers.authorization.split(" ")[1];

  TokenHelper.decodificaToken(token).then(
    userID => {
      req.user = {
        id: userID,
        token: token
      };
      next();
    },
    err => {
      res.status(401).json({ result: "KO", msg: `No autorizado: ${err.msg}` });
    }
  );
}



// ============================
// API USER
// ============================

// GET /api/user
app.get("/api/user", auth, (req, res) => {

  db.user.find((err, docs) => {
    if (err) return res.status(500).json({ result: "KO", msg: err });

    res.json({
      result: "OK",
      usuarios: docs
    });
  });

});


// GET /api/user/:id
app.get("/api/user/:id", auth, (req, res) => {

  db.user.findOne({ _id: mongojs.ObjectId(req.params.id) }, (err, doc) => {

    if (err) return res.status(500).json({ result: "KO", msg: err });

    res.json({
      result: "OK",
      usuario: doc
    });

  });

});


// POST /api/user
app.post("/api/user", auth, (req, res) => {

  db.user.insert(req.body, (err, doc) => {

    if (err) return res.status(500).json({ result: "KO", msg: err });

    res.json({
      result: "OK",
      usuario: doc
    });

  });

});


// PUT /api/user/:id
app.put("/api/user/:id", auth, (req, res) => {

  db.user.update(
    { _id: mongojs.ObjectId(req.params.id) },
    { $set: req.body },
    {},
    err => {

      if (err) return res.status(500).json({ result: "KO", msg: err });

      res.json({
        result: "OK"
      });

    }
  );

});


// DELETE /api/user/:id
app.delete("/api/user/:id", auth, (req, res) => {

  db.user.remove(
    { _id: mongojs.ObjectId(req.params.id) },
    err => {

      if (err) return res.status(500).json({ result: "KO", msg: err });

      res.json({
        result: "OK"
      });

    }
  );

});



// ============================
// AUTH
// ============================


// POST /api/auth/reg
app.post("/api/auth/reg", async (req, res) => {

  const { name, email, pass } = req.body;

  if (!name) return res.status(400).json({ result: "KO", msg: "Debe suministrar un nombre" });
  if (!email) return res.status(400).json({ result: "KO", msg: "Debe suministrar un email" });
  if (!pass) return res.status(400).json({ result: "KO", msg: "Debe suministrar una contraseña" });


  db.user.findOne({ email: email }, async (err, user) => {

    if (err) return res.status(500).json({ result: "KO", msg: err });

    if (user) {
      return res.status(400).json({
        result: "KO",
        msg: "El usuario ya existe"
      });
    }

    const hash = await bcrypt.hash(pass, 10);

    const newUser = {
      email: email,
      displayName: name,
      password: hash,
      signupDate: moment().unix(),
      lastLogin: moment().unix()
    };

    db.user.insert(newUser, (err, usuario) => {

      if (err) return res.status(500).json({ result: "KO", msg: err });

      const token = TokenHelper.creaToken(usuario);

      res.json({
        result: "OK",
        token: token,
        usuario: usuario
      });

    });

  });

});



// ============================
// LOGIN (signIn)
// ============================

app.post("/api/auth/login", (req, res) => {

  const { email, pass } = req.body;

  if (!email || !pass) {
    return res.status(400).json({
      result: "KO",
      msg: "Debe suministrar un correo y una contraseña"
    });
  }

  db.user.findOne({ email: email }, async (err, usuario) => {

    if (err) return res.status(500).json({ result: "KO", msg: err });

    if (!usuario) {
      return res.status(401).json({
        result: "KO",
        msg: "El usuario no está registrado o la contraseña no es correcta"
      });
    }

    const match = await bcrypt.compare(pass, usuario.password);

    if (!match) {
      return res.status(401).json({
        result: "KO",
        msg: "El usuario no está registrado o la contraseña no es correcta"
      });
    }

    const now = moment().unix();

    db.user.update(
      { _id: usuario._id },
      { $set: { lastLogin: now } },
      { safe: true, multi: false },
      err => {

        if (err) return res.status(500).json({ result: "KO", msg: err });

        usuario.lastLogin = now;

        const token = TokenHelper.creaToken(usuario);

        res.json({
          result: "OK",
          token: token,
          usuario: usuario
        });

      }
    );

  });

});



// ============================
// GET /api/auth
// ============================

app.get("/api/auth", auth, (req, res) => {

  db.user.find({}, { email: 1, displayName: 1, _id: 0 }, (err, users) => {

    if (err) return res.status(500).json({ result: "KO", msg: err });

    res.json({
      result: "OK",
      usuarios: users
    });

  });

});



// ============================
// GET /api/auth/me
// ============================

app.get("/api/auth/me", auth, (req, res) => {

  db.user.findOne(
    { _id: mongojs.ObjectId(req.user.id) },
    (err, user) => {

      if (err) return res.status(500).json({ result: "KO", msg: err });

      res.json({
        result: "OK",
        usuario: user
      });

    }
  );

});



// ============================
// START SERVER
// ============================

app.listen(port, () => {
  console.log(`API AUTH ejecutándose en https://localhost:${port}/api/{user|auth}`);
});