'use strict'

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongojs = require("mongojs");
const moment = require("moment");

const AuthMiddleware = require('./middlewares/auth.middleware');
const PassHelper = require('./helpers/pass.helper'); 
const TokenHelper = require("./helpers/token.helper");
const config = require("./config");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

const db = mongojs(config.DB, ["user"]);
const port = config.PORT;

// ============================
// API USER (PROTEGIDO)
// ============================

// GET /api/user
app.get("/api/user", AuthMiddleware.auth, (req, res) => {
  db.user.find((err, docs) => {
    if (err) return res.status(500).json({ result: "KO", msg: err });

    res.json({
      result: "OK",
      usuarios: docs
    });
  });
});

// GET /api/user/:id
app.get("/api/user/:id", AuthMiddleware.auth, (req, res) => {

  if (req.params.id.length !== 24) {
    return res.status(400).json({ result: "KO", msg: "ID inválido" });
  }

  db.user.findOne({ _id: mongojs.ObjectId(req.params.id) }, (err, doc) => {
    if (err) return res.status(500).json({ result: "KO", msg: err });

    res.json({
      result: "OK",
      usuario: doc
    });
  });
});

// POST /api/user
app.post("/api/user", AuthMiddleware.auth, (req, res) => {
  db.user.insert(req.body, (err, doc) => {
    if (err) return res.status(500).json({ result: "KO", msg: err });

    res.json({
      result: "OK",
      usuario: doc
    });
  });
});

// PUT
app.put("/api/user/:id", AuthMiddleware.auth, (req, res) => {

  if (req.params.id.length !== 24) {
    return res.status(400).json({ result: "KO", msg: "ID inválido" });
  }

  db.user.update(
    { _id: mongojs.ObjectId(req.params.id) },
    { $set: req.body },
    {},
    err => {
      if (err) return res.status(500).json({ result: "KO", msg: err });

      res.json({ result: "OK" });
    }
  );
});

// DELETE
app.delete("/api/user/:id", AuthMiddleware.auth, (req, res) => {

  if (req.params.id.length !== 24) {
    return res.status(400).json({ result: "KO", msg: "ID inválido" });
  }

  db.user.remove(
    { _id: mongojs.ObjectId(req.params.id) },
    err => {
      if (err) return res.status(500).json({ result: "KO", msg: err });

      res.json({ result: "OK" });
    }
  );
});


// ============================
// AUTH
// ============================

// REGISTRO
app.post("/api/auth/reg", async (req, res) => {

  const { name, email, pass } = req.body;

  if (!name || !email || !pass) {
    return res.status(400).json({ result: "KO", msg: "Datos incompletos" });
  }

  db.user.findOne({ email: email }, async (err, user) => {

    if (err) return res.status(500).json({ result: "KO", msg: err });

    if (user) {
      return res.status(400).json({ result: "KO", msg: "Usuario ya existe" });
    }

    const hash = await PassHelper.encriptaPassword(pass);

    const newUser = {
      email,
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
        token,
        usuario
      });

    });

  });

});


// LOGIN
app.post("/api/auth/login", (req, res) => {

  const { email, pass } = req.body;

  if (!email || !pass) {
    return res.status(400).json({ result: "KO", msg: "Datos incompletos" });
  }

  db.user.findOne({ email: email }, async (err, usuario) => {

    if (err) return res.status(500).json({ result: "KO", msg: err });

    if (!usuario) {
      return res.status(401).json({ result: "KO", msg: "Credenciales incorrectas" });
    }

    const match = await PassHelper.comparaPassword(pass, usuario.password);

    if (!match) {
      return res.status(401).json({ result: "KO", msg: "Credenciales incorrectas" });
    }

    const now = moment().unix();

    db.user.update(
      { _id: usuario._id },
      { $set: { lastLogin: now } },
      {},
      err => {

        if (err) return res.status(500).json({ result: "KO", msg: err });

        usuario.lastLogin = now;

        const token = TokenHelper.creaToken(usuario);

        res.json({
          result: "OK",
          token,
          usuario
        });

      }
    );

  });

});


// GET usuarios (protegido)
app.get("/api/auth", AuthMiddleware.auth, (req, res) => {

  db.user.find({}, { email: 1, displayName: 1, _id: 0 }, (err, users) => {

    if (err) return res.status(500).json({ result: "KO", msg: err });

    res.json({
      result: "OK",
      usuarios: users
    });

  });

});

// PERFIL
app.get("/api/auth/me", AuthMiddleware.auth, (req, res) => {

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
// START
// ============================

app.listen(port, () => {
  console.log(`API AUTH ejecutándose en http://localhost:${port}/api`);
});