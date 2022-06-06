const { randomUUID } = require("crypto");
const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/user/login", (req, res, next) => {
  if (!req.body.username) {
    return res.status(400).send("please provide username and password");
  }
  if (!req.body.password) {
    return res.status(400).send("please provide username and password");
  }
  next();
});

app.post("/user/create", (req, res) => {
  fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
    const parsed = JSON.parse(data);
    parsed.users = [...parsed.users, req.body];

    fs.writeFile(
      "./db.json",
      JSON.stringify(parsed),
      { encoding: "utf-8" },
      () => {
        res.status(201).send("user created");
      }
    );
  });
});

app.post("/user/login", (req, res, next) => {
  fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
    let myData = JSON.parse(data);
    myData.users = myData.users.map((e) => {
      if (e.username == req.body.username && e.password == req.body.password) {
        return { ...e, token: randomUUID() };
      }
      return e;
    });
    fs.writeFile(
      "./db.json",
      JSON.stringify(myData),
      { encoding: "utf-8" },
      () => {
        res.send("login Successful");
      }
    );
  });
});

app.listen(8080);

app.post("/user/logout", (req, res, next) => {
  fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
    let myData = JSON.parse(data);
    myData.users = myData.users.map((e) => {
      if (
        e.token &&
        e.username == req.body.username &&
        e.password == req.body.password
      ) {
        delete e.token;
      }
      return e;
    });
    fs.writeFile(
      "./db.json",
      JSON.stringify(myData),
      { encoding: "utf-8" },
      () => {
        res.send("logut Successful");
      }
    );
  });
});

app.get(`/votes/party/:party`, (req, res, next) => {
  const { party } = req.params;
  fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
    const parsed = JSON.parse(data);
    parsed.users = parsed.users.filter((el) => el.party === party);
    res.send(parsed.users);
  });
});

app.get(`/votes/voters`, (req, res, next) => {
  fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
    const parsed = JSON.parse(data);
    parsed.users = parsed.users.filter((el) => el.role === "voter");
    res.send(parsed.users);
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT);
