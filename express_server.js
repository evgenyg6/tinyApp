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
  let user_id = req.cookies.user_id;
  if (user_id) {
    res.render("urls_index", {
      urls: urlDatabase,
      user_id: user_id,
      email: users[user_id]
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
      res.cookie('user_id', i);
      res.redirect("/urls");
    }
  }

  res.render("login", {
    error: "Error 403: Incorrect email/password."
  });
});
//////////////////////////////////////////////
app.get("/register", (req, res) => { //renders page that includes email/password form
  user_id = req.body.email;
  userPass = req.body.password;
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    email: req.cookies.email
  };
  res.render("register", templateVars);
});
//////////////////////////////////////////////
app.post("/register", (req, res) => { //takes in user_id/pass and posts them to server
  user_id = req.body.email;
  userPass = req.body.password;
  if (user_id == false || userPass == false) { //checks for no input
    res.send("Error 400: Please enter a valid user_id/password.")
  }
  console.log(users);
  for (var keys of Object.keys(users)) { //checks for existing email
    if (user_id === users[keys].email) {
      res.send('Error 400: Please enter a non-existing email.')
      console.log(user_id, users[keys].email);
    } else {
      var uString = generateRandomString();
      users[uString] = {
        id: uString,
        email: user_id,
        password: userPass
      };
    }
  };
  res.cookie('user_id', uString);
  res.redirect("/urls");
});
//////////////////////////////////////////////
app.get("/urls", (req, res) => {
  let templateVars = {
    user_id: req.cookies.user_id
  }
  res.render("urls_new", templateVars);
});
//////////////////////////////////////////////
app.get("/urls_new", (req, res) => {
  let templateVars = {
    user_id: req.cookies.user_id
  }
  res.render("urls_new", templateVars);
});
//////////////////////////////////////////////
app.post("/logout", (req, res) => { //recieves cookies and redirects
  let templateVars = {
    user_id: req.cookies.user_id
  }
  res.clearCookie('user_id');
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
    user_id: req.cookies.user_id
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
app.post("/urls", (req, res) => { //writes user_id cookie to server
  let templateVars = {
    user_id: req.cookies.user_id
  }
  res.cookie("user_id", req.body.user_id);
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