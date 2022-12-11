import UserModel from "../models/UserModel.js";
import PoemModel from "../models/PoemModel.js";
import { ObjectId } from "mongodb";
import { successUrlEncode, failUrlEncode } from "../utils.js";
import bcrypt from 'bcryptjs';

async function getHome(req, res) {

  //get all public poems to display on home page
    const publicPoems = await PoemModel.find({visibility: 'public'}).populate('postedBy', 'username').exec();
    let threeRandomPoems = [];

     let i = 0;
     while(threeRandomPoems.length < 3) {
      i++
      publicPoems[i] = publicPoems[Math.floor(Math.random() * publicPoems.length)]
      let oneRandomPoem = publicPoems[i]
      let condition = threeRandomPoems.find(poem => poem.id === oneRandomPoem.id)
      if (!condition) {
        threeRandomPoems.push(oneRandomPoem)
      } 
     }

    res.render("home", {
      threeRandomPoems: threeRandomPoems,
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
  
      const match = bcrypt.compareSync(password, user.password);
      console.log('match', match)
  
      if(match) {
        req.session.isAuth = true;
        req.session.userId = user._id;
        req.session.username = req.body.username
        url = "poems"
        q = successUrlEncode("Successfully logged in");
      } else {
        q = failUrlEncode("Something went wrong, try again");
        url = "login"
      }
 
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

    let q; 
    let url;
    try {

     const { username, password } = req.body;

     const user = await UserModel.findOne({username: username}, {timestamps: true});
 
     if (user) {
        url = "register"
        q = failUrlEncode("username already taken")
        res.redirect(`/${url}?${q}`);
     } else {
      const userDoc = new UserModel({ username, password });
      await userDoc.save();
      url = "login"
      q = successUrlEncode("Successfully registered user");
      res.redirect(`/${url}?${q}`);
     }
    } catch (err) {
      url = "register"
      q = failUrlEncode("something went wrong, try again");
      res.redirect(`/${url}?${q}`);
    } 
  
  }
  
  async function logout(req, res) {
    let q; 
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