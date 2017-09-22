//ALL THE REQUIRED LIBS
const express = require("express");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

let current_user = null; //checks for user login

app.set("view engine", "ejs"); //sets engine to ejs
app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));

let urlDatabase = {
    "b2xVn2": {
        fullURL: "http://www.lighthouselabs.ca",
        poster: "asX412"
    },
    "9sm5xk": {
        fullURL: "http://www.google.com",
        poster: "asX412"
    }
};

let users = {
    "asX412": {
        id: "userRandomID",
        email: "bsrai91@gmail.com",
        password: bcrypt.hashSync("12345", 10)
    },
    "asdf452": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
    }
};


//if not logged in, go to login
app.get("/", (req, res) => {
    if (req.session.user_id == undefined) {
        res.redirect("/login");
    } else {
        res.redirect("/urls");
    }
});

app.get("/login", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        shortURL: req.params.id,
        user_id: req.session.user_id,
        users: users
    }
    res.render("login", templateVars);
});

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

app.post("/login", (req, res) => {

    res.render("login", {
        error: "Please enter a proper login/password."
    });
});
//get a user_id and password and create a user cookie
app.post("/login/success", (req, res) => {
    for (let i of Object.keys(users)) {
        if (req.body.email === users[i].email && bcrypt.compareSync(req.body.password, users[i].password) === true) {
            current_user = users[i].email;
            req.session.user_id = i;
            res.redirect("/urls");
        }
    }
    if (req.session.user_id) {
        req.session.user_id = i;
        res.redirect("/urls");
    } else {

        res.send("Error 403: Incorrect email/password.");
    }
});
//renders page that includes email/password form
app.get("/register", (req, res) => {
    let user_id = req.body.email;
    let userPass = req.body.password;
    let templateVars = {
        urls: urlDatabase,
        shortURL: req.params.id,
        user_id: req.session.user_id,
        users: users
    };
    res.render("register", templateVars);
});
//takes in user_id/pass and posts them to server
app.post("/register", (req, res) => {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    let user_id = req.body.email;
    let userPass = req.body.password;
    let uString = generateRandomString();
    if (user_id == false || userPass == false) { //checks for no input
        res.send("Error 400: Please enter a valid user_id/password.")
    }
    for (let keys of Object.keys(users)) { //checks for existing email
        if (user_id === users[keys].email) {
            current_user = users[keys].email;
            return res.send('Error 400: Please enter a non-existing email.')
        };
    }
    req.session.user_id = uString
    users[uString] = {
        id: uString,
        email: user_id,
        password: hashedPassword,
    }
    res.redirect("/urls");
});

//shows URLs page, if you are logged in. If not, go to shown urls
app.get("/urls_new", (req, res) => {
    let templateVars = {
        fullURL: req.body.longURL,
        user_id: req.session.user_id,
        poster: req.session.user_id,
        users: users
    }

    if (req.session.user_id !== undefined) {
        return res.render("urls_new", templateVars);
    }
    return res.redirect('/urls/login');
});
//recieves cookies and redirects
app.post("/logout", (req, res) => {
    let templateVars = {
        user_id: req.session.user_id
    }
    current_user = null;
    req.session = null;
    res.redirect("/urls");
});
// route to urlshortenedURL page to edit
app.get("/u/:shortURL", (req, res) => {

    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});
//redirects to URL whith short ID
app.post("/urls/:id", (req, res) => { //redirects to URL whith short ID
    let templateVars = {
        urls: urlDatabase,
        shortURL: req.params.id,
        user_id: req.session.user_id,
        users: users
    };
    res.render("urls_show", templateVars);
});
//redirects to page to allow to edit ID
app.post("/urls/:id/update", (req, res) => {
    if (Object.keys(urlDatabase).indexOf(req.params.id) > -1) {
        urlDatabase[req.params.id].fullURL = req.body.longURL;
        res.redirect("/urls");
    } else {
        res.redirect("/urls");
    }
});
//returns a generated shortURL
app.post("/newLink", (req, res) => {
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
//writes user_id cookie to server
app.post("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        user_id: req.session.user_id,
        users: users
    };
    req.session.user = req.body.user_id;
    res.render("urls_index", templateVars);
});
//deletes the generated shortURL
app.post("/urls/:id/delete", (req, res) => {
    if (Object.keys(urlDatabase).indexOf(req.params.id) > -1) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
    }
});

app.listen(PORT, () => {
    console.log(`Example app listening on: http://localhost:${PORT}!`);
});
//picks a random number from 0-1, multiplies it by possible.length to get a number from ~0-possible.length
function generateRandomString() {
    let arr = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 6; i++) {
        arr += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return arr;
}
app.listen(3000)