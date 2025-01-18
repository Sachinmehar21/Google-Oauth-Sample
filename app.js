const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const app = express();
app.use(express.static("public"));

// Set EJS as the template engine
app.set("view engine", "ejs");

// Session configuration
app.use(
  session({ secret: "mysecret", resave: false, saveUninitialized: true })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
app.get("/", (req, res) => res.render("index"));

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"]})
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect("/profile")
);

app.get("/profile", (req, res) =>
  req.isAuthenticated()
    ? res.render("profile", { user: req.user })
    : res.redirect("/")
);

app.get("/logout", (req, res) => req.logout(() => res.redirect("/")));

// Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
