const express = require("express");
//const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bodyParser = require("body-parser");
const LS = require("node-localstorage").LocalStorage;
const localStorage = new LS("./scratch");

const app = express();
const PORT = 8090;

app.use(express.json());
app.set("view engine", "ejs");
app.disable("etag");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

/* ---------------------------------------- */
/* ----------------- UTILS ---------------- */
/* ---------------------------------------- */

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

/* ---------------------------------------- */
/* ----------------- AUTH ----------------- */
/* ---------------------------------------- */

app.get("/logout", async (req, res) => {
  localStorage.clear();
  res.redirect("/");
});

app.get("/", async (req, res) => {
  let token = localStorage.getItem("jwtoken");
  if (token == null) res.redirect("/login");
  else res.redirect("/home");
});

// Default route
app.get("/login", async (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

// Route to authenticate and log in a user
app.post("/login", async (req, res) => {
  login(req.body)
    .then((r) => {
      token = r.data.token;
      localStorage.setItem("jwtoken", token);
      getMe()
        .then((r) => {
          res.redirect("/home");
        })
        .catch((err) => {
          res.status(500).json({ message: err });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });

  return true;
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.post("/register", async (req, res) => {
  axios
    .post("http://localhost:8080/auth/register", req.body, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
    })
    .then((r) => {
      res.status(201).json({ message: "success" });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });

  return true;
});

/* ---------------------------------------- */
/* ----------------- HOME ----------------- */
/* ---------------------------------------- */

app.get("/home", (req, res) => {
  getMe()
    .then(async (r) => {
      const username = r.data.username;
      res.render("home", {
        username: username,
        services: (await getItems()).data._embedded.itemList,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

/* ---------------------------------------- */
/* ----------------- USER ----------------- */
/* ---------------------------------------- */

// Protected route to get user details
app.get("/api/user", verifyToken, async (req, res) => {
  try {
    // Fetch user details using decoded token
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    v;
    res.status(200).json({ username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ---------------------------------------- */
/* --------------- Services --------------- */
/* ---------------------------------------- */

app.get("/items", (req, res) => {
  getMe()
    .then(async (r) => {
      const username = r.data.username;
      res.render("services", {
        username: username,
        services: (await getUsers()).data._embedded.userModelList,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

app.get("/orders", (req, res) => {
  axios
    .get("http://localhost:8080/orders", {
      headers: {
        "Cache-Control": "no-cache",
      },
    })
    .then((r) => {
      console.log(r);
      res.json(r.data);
    })
    .catch((err) => {
      console.log(err);
      res.send("err");
    });
});

/* ---------------------------------------- */
/* ----------------- APP ------------------ */
/* ---------------------------------------- */

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/* ---------------------------------------- */
/* ------------- REQUESTS ----------------- */
/* ---------------------------------------- */

getMe = async function () {
  return axios.get("http://localhost:8080/users/me", {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

login = async function (body) {
  return axios.post("http://localhost:8080/auth/login", body, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
    },
  });
};

getItems = async function () {
  return axios.get("http://localhost:8084/items", {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

getItem = async function (id) {
  return axios.get("http://localhost:8084/items/" + id, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};
