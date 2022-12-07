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
    let locals;
    try {
      locals = {serverMessage: req.query, pageTitle: "Login", isAuth: req.session.isAuth, user: req.session.username || null}
    } catch (error) {
      console.log(error)
    } finally {
      res.render("login", locals)
    }
  }
  
  async function login(req, res) {

    let url; 
    let q;

    try {
      const { username, password } = req.body;
  
      const user = await UserModel.findOne({ username: username });
  
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
    let locals;
    try {
      locals = { serverMessage: req.query, pageTitle: "Register", isAuth: req.session.isAuth, user: req.session.username || null }
    } catch (error) {
      console.log(error)
    } finally {
    res.render("register", locals)
    }
  }
  
  async function register(req, res) {

    let q = null; 
    let url = null;
    try {

     const { username, password } = req.body;

     const user = await UserModel.findOne({username: username});
 
     if (user) {
        url = "register"
        q = failUrlEncode("username already taken")
     }
 
   else {
        url = "login"
        q = successUrlEncode("Successfully registered user");
        const userDoc = new UserModel({ username, password });
        userDoc.save();
     }
    
    } catch (err) {
      console.error(err.message);
      url = "register"
      q = failUrlEncode("something went wrong, try again");
    } finally {
      res.redirect(`/${url}?${q}`);
    }
  }
  
  async function logout(req, res) {
    let q = null; 
    let url;

    try {
      req.session.destroy();
      q = successUrlEncode("Successfully logged out");
      url = ""
    } catch (err) {
      q = failUrlEncode("Failed logged out");
      url = "poems";
    } finally {
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