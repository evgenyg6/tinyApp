var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));
//////////////////////////////////////////////
app.set("view engine", "ejs"); //sets engine to ejs

var urlDatabase = { //object containing ID:website
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//////////////////////////////////////////////
app.get("/", (req, res) => {
  res.end("Hello!");
})
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  })
  //////////////////////////////////////////////
app.get("/urls", (req, res) => {
    let templateVars = {
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  })
  //////////////////////////////////////////////
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//////////////////////////////////////////////
app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});
//////////////////////////////////////////////
app.get("/urls/:id", (req, res) => {
    let templateVars = {
      urls: urlDatabase,
      shortURL: req.params.id
    };
  })
  //////////////////////////////////////////////
app.post("/urls", (req, res) => {
  let arrt = generateRandomString();
  //console.log(req.body); // debug statement to see POST parameters
  urlDatabase[arrt] = req.body.longURL;
  var linkName = "Click here for your generated link!";
  res.send(arrt + ' ' + linkName.link(urlDatabase[arrt]));
  //console.log(urlDatabase);
  //res.render("urls_show", templateVars);
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