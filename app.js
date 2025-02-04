const express = require("express");
const amqp = require("amqplib");

const app = express();
const PORT = 8090;

app.use(express.json());

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const LS = require("node-localstorage").LocalStorage;
const localStorage = new LS("./scratch");

app.use(
  express.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.set("view engine", "ejs");
app.disable("etag");
app.use(express.static(__dirname + "/public"));

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
  if (token === null) res.redirect("/login");
  else res.redirect("/home");
});

// Default route
app.get("/login", async (req, res) => {
  if (localStorage.getItem("jwtoken") === null) {
    res.render("login");
  } else {
    res.redirect("/home");
  }
});

// Route to authenticate and log in a user
app.post("/login", async (req, res) => {
  login(req.body)
    .then((r) => {
      token = r.data.token;
      localStorage.setItem("jwtoken", token);
      res.redirect("/home");
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });

  return true;
});

app.get("/signup", (req, res) => {
  res.render("register");
});

app.post("/signup", async (req, res) => {
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

app.get("/home", async (req, res) => {
  console.log(localStorage.getItem("jwtoken"));
  if (localStorage.getItem("jwtoken") === null) {
    return res.redirect("/logout");
  }

  getMe()
    .then(async (r) => {
      const username = r.data.username;
      const role = r.data.role;
      res.render("home", {
        username: username,
        role: role,
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
    res.status(200).json({ username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ---------------------------------------- */
/* --------------- Services --------------- */
/* ---------------------------------------- */

app.get("/customers", async (req, res) => {
  res.render("pages/customers", {
    username: "leonardo",
    customers: (await getCustomers()).data._embedded.customerList,
  });
  return;
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

app.get("/customers/:id", async (req, res) => {
  id = req.params.id;
  res.render("forms/customer", {
    username: "leonardo",
    customer: (await getCustomer(id)).data,
  });
  return;
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

app.post("/customers/:id", async (req, res) => {
  id = req.params.id;
  console.log(req.body);
  putCustomer(id, req.body).then(() => {
    res.redirect("/orders/" + id);
  });
  return;
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

app.get("/collabs", async (req, res) => {
  res.render("pages/collabs", {
    username: "leonardo",
    collaborators: (await getCollabs()).data._embedded.collaboratorList,
  });
  return;
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

app.get("/collabs/:id", async (req, res) => {
  id = req.params.id;

  res.render("forms/collab", {
    username: "leonardo",
    collab: (await getCollab(id)).data,
  });
  /* getMe()
    .then(async (r) => {
      res.render("orders", {
        username: username,
        services: (await getItems()).data._embedded.itemList,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    }); */
});

app.get("/users", async (req, res) => {
  res.render("pages/users", {
    username: "leonardo",
    users: (await getUsers()).data._embedded.userModelList,
  });
  return;
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

app.get("/users/:id", async (req, res) => {
  id = req.params.id;

  res.render("forms/user", {
    username: "leonardo",
    user: (await getUser(id)).data,
  });
  /* getMe()
    .then(async (r) => {
      res.render("orders", {
        username: username,
        services: (await getItems()).data._embedded.itemList,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    }); */
});

app.get("/items", async (req, res) => {
  getMe()
    .then(async (r) => {
      const username = r.data.username;
      const role = r.data.role;
      res.render("pages/items", {
        items: (await getItems()).data._embedded.itemList,
        username: username,
        role: role,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

app.get("/items/:id", async (req, res) => {
  id = req.params.id;
  getMe().then(async (r) => {
    const username = r.data.username;
    const role = r.data.role;
    res.render("forms/item", {
      username: username,
      role: role,
      item: (await getItem(id)).data,
    });
  });
});

app.get("/orders", async (req, res) => {
  res.render("pages/orders", {
    username: "leonardo",
    orders: (await getOrders()).data._embedded.orderList,
  });
  /* getMe()
    .then(async (r) => {
      res.render("orders", {
        username: username,
        services: (await getItems()).data._embedded.itemList,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    }); */
});

app.get("/orders/:id", async (req, res) => {
  id = req.params.id;

  res.render("forms/order", {
    username: "leonardo",
    order: (await getOrder(id)).data,
  });
  /* getMe()
    .then(async (r) => {
      res.render("orders", {
        username: username,
        services: (await getItems()).data._embedded.itemList,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    }); */
});

app.post("/orders/:id", async (req, res) => {
  id = req.params.id;
  console.log(req.body);
  putOrder(id, req.body).then(() => {
    res.redirect("/orders/" + id);
  });
  /* res.render("forms/order", {
    username: "leonardo",
    order: (await getOrder(id)).data,
  }); */
  /* getMe()
    .then(async (r) => {
      res.render("orders", {
        username: username,
        services: (await getItems()).data._embedded.itemList,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    }); */
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

getUsers = async function () {
  return axios.get("http://localhost:8080/users", {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      //Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

getUser = async function (id) {
  return axios.get("http://localhost:8080/users/" + id, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

putUser = async function (id, body) {
  return axios.put("http://localhost:8080/users/" + id, body, {
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

getCustomers = async function () {
  return axios.get("http://localhost:8080/customers", {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

getCustomer = async function (id) {
  return axios.get("http://localhost:8080/customers/" + id, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

putCustomer = async function (id) {
  return axios.put("http://localhost:8080/customer/" + id, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

getCollabs = async function () {
  return axios.get("http://localhost:8080/collaborators", {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

getCollab = async function (id) {
  return axios.get("http://localhost:8080/collaborators/" + id, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

getItems = async function () {
  return axios.get("http://localhost:8080/items", {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

getItem = async function (id) {
  return axios.get("http://localhost:8080/items/" + id, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

getOrders = async function () {
  return axios.get("http://localhost:8083/orders", {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

getOrder = async function (id) {
  return axios.get("http://localhost:8083/orders/" + id, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

putOrder = async function (id, body) {
  return axios.put("http://localhost:8083/orders/" + id, body, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

/* ---------------------------------------- */
/* ----------------- APP ------------------ */
/* ---------------------------------------- */

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
