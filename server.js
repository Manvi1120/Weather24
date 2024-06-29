const express = require("express");
const fs = require("fs");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");

// Middleware setup
app.use(express.static("."));
app.use(express.urlencoded());
app.use(cookieParser());

const oneDay = 60 * 60 * 24 * 1000;

// Session setup
app.use(
  session({
    saveUninitialized: true,
    resave: false,
    secret: "sdfs@#$df4%121",
    cookie: { maxAge: oneDay },
  })
);

// Routes


app.get("/style.css",(req,res)=>{
    res.sendFile(path.join(__dirname, "./style.css"));
})
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.get("/login",(req,res)=>{
    res.sendFile(path.join(__dirname, "./login.html"));
})

app.get("/dashboard", (req, res) => {
  if (req.session.username) res.sendFile(path.join(__dirname, "./index.html"));
  else res.redirect("/login");
});

app.post("/login", (req, res) => {
  fs.readFile("users.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).send("Internal Server Error");
    }

    let results = JSON.parse(data);
    let user = results.find(
      (item) =>
        item.username === req.body.username &&
        item.password === req.body.password
    );

    if (!user) {
    //   return res.status(401).send("Invalid username/password or signup");
    res.sendFile(path.join(__dirname, "./invalid.html"));
    }
    else{
    req.session.username = req.body.username;
    res.redirect("/dashboard");
    }
  });
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "./signup.html"));
});

app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  const user = { username, email, password };

  let users = [];
  try {
    users = JSON.parse(fs.readFileSync("users.json"));
  } catch (err) {
    console.error("Error reading users file:", err);
  }

  users.push(user);

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log("Server Started on port", PORT);
  }
});
