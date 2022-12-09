import express from "express";
import UserRouter from "./routes/UserRouter.js";
import PoemRouter from "./routes/PoemRouter.js";
import session from "express-session";

// Express related
const app = express();

// active sessions
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 } 
}))

// Use ejs as the templeting engine
app.set('view engine', 'ejs')

// Middleware

function checkSession(req, res, next) {
  // console.log("session", req.session);

  next();
}

// tell app to use middleware function everywhere
app.use(checkSession);
app.use(express.static('./public'));

// Make sure the express server is using correct middleware to process information correctly
// middleware can be seen as pre-work before doing the actuall request/response process
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(UserRouter);
app.use(PoemRouter);

app.listen(3000, function () {
  console.log("Listening on 3000");
});