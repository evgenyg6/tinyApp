var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
})); //THE ABOVE ARE ALL THE REQUIRED LIBS
//////////////////////////////////////////////
app.set("view engine", "ejs"); //sets engine to ejs

var urlDatabase = { //object containing ID:website
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//////////////////////////////////////////////
app.get("/", (req, res) => {
  res.redirect("/urls_new");
})
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//////////////////////////////////////////////
app.get("/urls", (req, res) => {
  let userName = req.cookies.username;
  if (userName) {
    res.render("urls_index", {
      urls: urlDatabase,
      username: userName,
      email: users[userName]
    })
  } else {
    res.redirect("/register");
  }
});
//////////////////////////////////////////////
app.post("/login", (req, res) => {

  res.render("login", {
    error: ""
  });
});
//////////////////////////////////////////////
app.post("/login/success", (req, res) => {
  for (var i of Object.keys(users)) {
    if (req.body.email === users[i].email && req.body.password === users[i].password) {
      res.cookie('username', i);
      res.redirect("/urls");
    }
  }

  res.render("login", {
    error: "Error 403: Incorrect email/password."
  });
});
//////////////////////////////////////////////
app.get("/register", (req, res) => { //renders page that includes email/password form
  userName = req.body.email;
  userPass = req.body.password;
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    email: req.cookies.email
  };
  res.render("register", templateVars);
});
//////////////////////////////////////////////
app.post("/register", (req, res) => { //takes in username/pass and posts them to server
  userName = req.body.email;
  userPass = req.body.password;
  if (userName == false || userPass == false) { //checks for no input
    res.send("Error 400: Please enter a valid username/password.")
  }
  console.log(users);
  for (var keys of Object.keys(users)) { //checks for existing email
    if (userName === users[keys].email) {
      res.send('Error 400: Please enter a non-existing email.')
      console.log(userName, users[keys].email);
    } else {
      var uString = generateRandomString();
      users[uString] = {
        id: uString,
        email: userName,
        password: userPass
      };
    }
  };
  res.cookie('username', uString);
  res.redirect("/urls");
});
//////////////////////////////////////////////
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  }
  res.render("urls_new", templateVars);
});
//////////////////////////////////////////////
app.get("/urls_new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  }
  res.render("urls_new", templateVars);
});
//////////////////////////////////////////////
app.post("/logout", (req, res) => { //recieves cookies and redirects
  let templateVars = {
    username: req.cookies.username
  }
  res.clearCookie('username');
  res.redirect("/urls_new");
});
///////////////////////////////////////////////
app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});
//////////////////////////////////////////////
app.post("/urls/:id", (req, res) => { //redirects to URL whith short ID
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});
//////////////////////////////////////////////
app.post("/urls/:id/update", (req, res) => { //redirects to page to allow to edit ID
  if (Object.keys(urlDatabase).indexOf(req.params.id) > -1) {
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});
//////////////////////////////////////////////
app.post("/urls", (req, res) => { //returns a generated shortURL
  if (req.body.longURL === "") {
    res.redirect("urls_new")
  } else {
    let arrt = generateRandomString();
    urlDatabase[arrt] = req.body.longURL;
    res.redirect("/urls");
  }

});
//////////////////////////////////////////////
app.post("/urls", (req, res) => { //writes username cookie to server
  let templateVars = {
    username: req.cookies.username
  }
  res.cookie("username", req.body.username);
  res.render("urls_index", templateVars);
});
app.post("/urls/:id/delete", (req, res) => { //deletes the generated shortURL
  if (Object.keys(urlDatabase).indexOf(req.params.id) > -1) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});
//////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on: http://localhost:${PORT}!`);
});
//////////////////////////////////////////////
function generateRandomString() {
  var arr = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) { //picks a random number from 0-1, multiplies it by possible.length to get a number from ~0-possible.length
    arr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return arr;
}