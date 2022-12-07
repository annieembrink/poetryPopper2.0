import UserModel from "../models/UserModel.js";
import PoemModel from "../models/PoemModel.js";
import { ObjectId } from "mongodb";
import { successUrlEncode, failUrlEncode } from "../utils.js";
import bcrypt from 'bcryptjs';

async function getHome(req, res) {
    const publicPoems = await PoemModel.find({visibility: 'public'}).populate('postedBy', 'username').exec();
    res.render("home", {
      serverMessage: req.query,
      pageTitle: "Home",
      isAuth: req.session.isAuth,
      poems: publicPoems,
      user: req.session.username || null
    });
  }

  async function getLogin(req, res) {
    res.render("login", {
      serverMessage: req.query,
      pageTitle: "Login",
      isAuth: req.session.isAuth,
      user: req.session.username || null

    });
  }
  
  async function login(req, res) {

    let url; 
    let q;

    try {
      // collect data from body
      const { username, password } = req.body;
  
      const user = await UserModel.findOne({ username: username });
  
      // if (!user) {
      //   throw new Error("No user found with that username");
      // }
  
      await user.comparePassword(password, user.password);
  
      req.session.isAuth = true;
      req.session.userId = user._id;
      req.session.username = req.body.username

      url = "poems"

      q = successUrlEncode("Successfully logged in");

    } catch (err) {
      console.error('catch', err.message);
      q = failUrlEncode("Something went wrong, try again");
      url = "login"
    } finally {
      res.redirect(`/${url}?${q}`); 
    }
  }
  
  async function getRegister(req, res) {
    res.render("register", {
      serverMessage: {},
      pageTitle: "Register",
      isAuth: req.session.isAuth,
      user: req.session.username || null

    });
  }
  
  async function register(req, res) {

    let q = null; 
    let url = null;
    try {

     // collect data from body
     const { username, password } = req.body;

     const user = await UserModel.findOne({username: username});
 
     if (user) {
        url = "register"
        return q = failUrlEncode("username already taken")
     }
 
   else {
        url = "login"
        q = successUrlEncode("Successfully registered user");
          // create User document instance locally
        const userDoc = new UserModel({ username, password });
        userDoc.save();
     }
    
    } catch (err) {
      // create message that operation was unsuccessfull
      console.error(err.message);
      q = failUrlEncode(err.message);
        // return res.redirect(`/register?${q}`);
    } finally {
      // create message that operation was successfull
      res.redirect(`/${url}?${q}`);
    }
  }
  
  async function logout(req, res) {
    let q = null; 

    try {
      req.session.destroy();
    } catch (err) {
      q = successUrlEncode("Failed logged out");
      res.redirect(`/poems?${q}`);
    } finally {
      q = successUrlEncode("You have to be logged in to read poems");
      res.redirect(`/?${q}`);
    }
  }
  
  export default {
    getHome,
    getLogin,
    login,
    getRegister,
    register,
    logout,
  };