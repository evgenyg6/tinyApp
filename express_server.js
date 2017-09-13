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
app.post("/urls/:id", (req, res) => { //redirects to URL whith short ID
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id
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
  let arrt = generateRandomString();
  //console.log(req.body); // debug statement to see POST parameters
  urlDatabase[arrt] = req.body.longURL;
  var linkName = "Here is your generated link: localhost:8080/u/" + arrt;
  res.send(linkName.link(urlDatabase[arrt]));
  //res.render("urls_show", templateVars);
});
//////////////////////////////////////////////
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