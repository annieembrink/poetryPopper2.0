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
      poems: publicPoems
    });
  }

  async function getLogin(req, res) {
    res.render("login", {
      serverMessage: req.query,
      pageTitle: "Login",
      isAuth: req.session.isAuth,
    });
  }
  
  async function login(req, res) {
    try {
      // collect data from body
      const { username, password } = req.body;
  
      const user = await UserModel.findOne({ username: username });
  
      if (!user) {
        throw new Error("No user found with that username");
      }
  
      await user.comparePassword(password, user.password);
  
      req.session.isAuth = true;
      req.session.userId = user._id;
    } catch (err) {
      console.error(err.message);
      const q = failUrlEncode(err.message);
      return res.redirect(`/login?${q}`);
    } finally {
      const q = successUrlEncode("Successfully logged in");
      return res.redirect(`/poems?${q}`);
    }
  }
  
  async function getRegister(req, res) {
    res.render("register", {
      serverMessage: {},
      pageTitle: "Register",
      isAuth: req.session.isAuth,
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
        q = failUrlEncode("username already taken")
        url = `/register?${q}`
        return q 
     }
 
   else {
        q = successUrlEncode("Successfully registered user");
        url = `/login?${q}`

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
      res.redirect(url);
    }
  }
  
  async function logout(req, res) {
    try {
      req.session.destroy();
    } catch (err) {
      const q = successUrlEncode("Failed logged out");
      res.redirect(`/poems?${q}`);
    } finally {
      const q = successUrlEncode("Successfully logged out");
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