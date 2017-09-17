var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
})); //THE ABOVE ARE ALL THE REQUIRED LIBS
//////////////////////////////////////////////
app.set("view engine", "ejs"); //sets engine to ejs
var current_user = null; //checks for user login

app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.get('/', function(req, res, next) {
  // Update views
  req.session.views = (req.session.views || 0) + 1

  // Write response
  res.end(req.session.views + ' views')
})

app.listen(3000)

var urlDatabase = {
  "b2xVn2": {
    fullURL: "http://www.lighthouselabs.ca",
    poster: "asX412"
  },
  "9sm5xk": {
    fullURL: "http://www.google.com",
    poster: "asX412"
  }
};

const users = {
  "userRandomID": {
    email: "user@example.com",
    password: bcrypt.hashSync("hardpassword", 10)
  },
  "user2RandomID": {
    savedURLs: [],
    email: "user2@example.com",
    password: bcrypt.hashSync("easypassword", 10)
  }
}


//////////////////////////////////////////////
app.get("/", (req, res) => { //if not logged in, go to login
    if (req.session.user_id !== undefined) {
      res.redirect("/login");
    }
  })
  //////////////////////////////////////////////
app.get("/login", (req, res) => {
    let templateVars = {
      urls: urlDatabase,
      shortURL: req.params.id,
      email: req.session.email,
      users: users
    }
    res.render("login", templateVars);
  })
  //////////////////////////////////////////////
app.get("/urls", (req, res) => {
  let filteredDatabase = {};
  for (let x in urlDatabase) {
    if (req.session.user_id !== undefined && req.session.user_id === urlDatabase[x].poster) {
      filteredDatabase[x] = urlDatabase[x];
    } else if (req.session.user_id === undefined) {
      filteredDatabase = urlDatabase;
    }
  }
  let templateVars = {
    urls: filteredDatabase,
    userInfo: users,
    user_id: req.session.user_id,
    users: users
  }
  res.render("urls_index", templateVars);
});
//////////////////////////////////////////////
app.post("/login", (req, res) => {

  res.render("login", {
    error: "Please enter a proper login/password."
  });
});
//////////////////////////////////////////////
app.post("/login/success", (req, res) => {
  for (var i of Object.keys(users)) {
    if (req.body.email === users[i].email && bcrypt.compareSync(req.body.password, users[i].password) === true) {
      current_user = users[i].email;
      req.session.user_id = i;
      res.redirect("/urls");
    }
  }
  res.render("login", {
    error: "Error 403: Incorrect email/password."
  });
});
//////////////////////////////////////////////
app.get("/register", (req, res) => { //renders page that includes email/password form
  var user_id = req.body.email;
  var userPass = req.body.password;
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    email: req.session.email,
    users: users
  };
  res.render("register", templateVars);
});
//////////////////////////////////////////////
app.post("/register", (req, res) => { //takes in user_id/pass and posts them to server
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  var user_id = req.body.email;
  var userPass = req.body.password;
  var uString = generateRandomString();
  if (user_id == false || userPass == false) { //checks for no input
    res.send("Error 400: Please enter a valid user_id/password.")
  }
  for (var keys of Object.keys(users)) { //checks for existing email
    if (user_id === users[keys].email) {
      current_user = user[keys].email;
      res.send('Error 400: Please enter a non-existing email.')
    } else {

      users[uString] = {
        savedURLs: [],
        id: uString,
        email: user_id,
        password: hashedPassword,
        users: users
      };
    }
  };
  req.session.user = uString;
  res.redirect("/urls");
});

//////////////////////////////////////////////
app.get("/urls_new", (req, res) => { //shows URLs page, if you are logged in. If not, go to
  let templateVars = {
    fullURL: req.body.longURL,
    user_id: req.session.user_id,
    poster: req.session.user_id,
    users: users

  }

  if (req.session.user_id === undefined) {
    res.redirect("/login", templateVars);
  } else {
    res.render("urls_new", templateVars)
  }
});
//////////////////////////////////////////////
app.post("/logout", (req, res) => { //recieves cookies and redirects
  let templateVars = {
    user_id: req.session.user_id
  }
  current_user = null;
  req.session = null;
  res.redirect("/register");
});
///////////////////////////////////////////////
app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//////////////////////////////////////////////
app.post("/urls/:id", (req, res) => { //redirects to URL whith short ID
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    user_id: req.session.user_id,
    users: users
  };
  res.render("urls_show", templateVars);
});
//////////////////////////////////////////////
app.post("/urls/:id/update", (req, res) => { //redirects to page to allow to edit ID
  if (Object.keys(urlDatabase).indexOf(req.params.id) > -1) {
    urlDatabase[req.params.id].fullURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }

});
//////////////////////////////////////////////
app.post("/newLink", (req, res) => { //returns a generated shortURL
  if (req.body.longURL === "") {
    res.redirect("urls_new")
  } else {
    let arrt = generateRandomString();
    urlDatabase[arrt] = {
      fullURL: req.body.longURL,
      poster: req.session.user_id,
      users: users
    }
    res.redirect("/urls");
  }

});
//////////////////////////////////////////////
app.post("/urls", (req, res) => { //writes user_id cookie to server
  let templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    users: users
  };
  req.session.user = req.body.user_id;
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