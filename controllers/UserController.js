import UserModel from "../models/UserModel.js";
import PoemModel from "../models/PoemModel.js";
import CommentModel from "../models/CommentModel.js";
import { ObjectId } from "mongodb";
import { successUrlEncode, failUrlEncode } from "../utils.js";
import bcrypt from 'bcryptjs';

async function getHome(req, res) {

  console.log('req.query', req.query)

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

    const locals = {
      threeRandomPoems: threeRandomPoems,
      serverMessage: {...req.session.serverMessage},
      pageTitle: "Home",
      isAuth: req.session.isAuth,
      poems: publicPoems,
      user: req.session.username || null
    }
    req.session.serverMessage = {}
    res.render("home", locals);
  }

  async function getRegister(req, res) {
    let locals;
    try {
      console.log(req.query.message, req.params)
      locals = { serverMessage: req.session.serverMessage || req.query, pageTitle: "Register", isAuth: req.session.isAuth, user: req.session.username || null }
    } catch (error) {
      console.log(error)
    } finally {
    res.render("register", locals)
    req.session.serverMessage = {}

    }
  }

  async function getLogin(req, res) {
    let locals;
    try {
      console.log('get login', req.query, req.params)
      locals = {serverMessage: {...req.session.serverMessage}, pageTitle: "Login", isAuth: req.session.isAuth, user: req.session.username || null}
    } catch (error) {
      console.log(error)
    } finally {
      req.session.serverMessage = {}
      res.render("login", locals)
    }
  }
  async function getAccount(req, res) {
    let locals;
    try {
      console.log(req.query, req.params)
      locals = {serverMessage: {...req.session.serverMessage}, pageTitle: "Your account", isAuth: req.session.isAuth, userId: req.session.userId, user: req.session.username || null}
    } catch (error) {
      console.log(error)
    } finally {
      req.session.serverMessage = {}
      res.render("account", locals)
    }
  }
  async function changeAccount(req, res) {
    // let q; 
    try {
      const {username, oldPassword, newPassword, id} = req.body; 
      console.log('req.body', req.body)

      const user = await UserModel.findOne({_id: ObjectId(id)})

      const match = bcrypt.compareSync(oldPassword, user.password);
      console.log('match', match)

      const userDoc = new UserModel({ username, password: newPassword});
      await userDoc.validate();

      if(match) {
        let hashedpw = bcrypt.hashSync(newPassword, 10)
        await UserModel.findOneAndUpdate(
          { _id: ObjectId(id) },
          { username, password: hashedpw}
        );
      // q = successUrlEncode("successfully updated account")  
      req.session.serverMessage = {type: "success", message: "Successfully updated account"}
      res.redirect(`/account/?${req.body.id}/success`)

      } else {
        // q = failUrlEncode("couldn't update account, try again")
        req.session.serverMessage = {type: "fail", message: "Couldn't update account"}
        res.redirect(`/account/?${req.body.id}/error`)
      }

    } catch (error) {
      console.log(error)
      // q = failUrlEncode("couldn't update account, try again")
      req.session.serverMessage = {type: "fail", message: "Couldn't update account"}
      res.redirect(`/account/?${req.body.id}/error`)
    }
  }

  async function deleteAccount(req, res) {
    let q; 
    // req.session.serverMessage = {type: "success", message: "Successfully deleted account"}

    try {
      console.log('delete', req.params.id)
      const id = req.params.id
      const deletedUser = await UserModel.deleteOne({ _id: ObjectId(id) });
      const deletedPoems = await PoemModel.deleteMany({ postedBy: ObjectId(id) });
      const deletedComments = await CommentModel.deleteMany({ postedBy: ObjectId(id) });
      console.log(deletedUser, deletedPoems, deletedComments)
      q = successUrlEncode("successfully deleted account")  

      req.session.destroy();

    } catch (error) {
      console.log(error)
      q = failUrlEncode("Couldn't delete account")  

    } finally {
    res.redirect(`/register?${q}`)
    }
  }
  
  async function login(req, res) {

    let url; 
    // let q;

    try {
      const { username, password } = req.body;
  
      const user = await UserModel.findOne({ username: username });
  
      const match = bcrypt.compareSync(password, user.password);
      console.log('match', match)
  
      if(match) {
        req.session.isAuth = true;
        req.session.userId = user._id;
        req.session.username = req.body.username
        req.session.serverMessage = {type: "success", message: "Successfully logged in"}
        url = "poems"
        // q = successUrlEncode("Successfully logged in");
      } else {
        // q = failUrlEncode("Something went wrong, try again");
        req.session.serverMessage = {type: "fail", message: "Couldn't log in, try again"}

        url = "login"
      }
 
    } catch (err) {
      console.error('catch', err.message);
      // q = failUrlEncode("Something went wrong, try again");
      req.session.serverMessage = {type: "fail", message: "Couldn't log in, try again"}

      url = "login"
    } finally {
      res.redirect(`/${url}`); 
    }
  }
  
  async function register(req, res) {

    // let q; 
    let url;
    try {

     const { username, password } = req.body;

     const user = await UserModel.findOne({username: username});
 
     if (user) {
        url = "register"
        // q = failUrlEncode("username already taken")
        req.session.serverMessage = {type: "fail", message: "username already taken"}

        res.redirect(`/${url}`);
     } else {
      const userDoc = new UserModel({ username, password });
      await userDoc.save();
      url = "login"
      // q = successUrlEncode("Successfully registered user");
      req.session.serverMessage = {type: "success", message: "Successfully registered user"}

      res.redirect(`/${url}`);
     }
    } catch (err) {
      console.log(err)
      url = "register"
      // q = failUrlEncode("something went wrong, try again");
      req.session.serverMessage = {type: "fail", message: "Something went wrong, try again"}

      res.redirect(`/${url}`);
    } 
  
  }
  
  async function logout(req, res) {
    let q; 
    let url;

    try {
      req.session.destroy();
      q = successUrlEncode("Successfully logged out");
      // req.session.serverMessage = "Successfully logged out"
      url = ""
    } catch (err) {
      q = failUrlEncode("Failed logged out");
      // req.session.serverMessage = "Failed logged out"
      url = "poems";
    } finally {
      // console.log(req.session.serverMessage)
      res.redirect(`/?${q}`);
    }
  }
  
  export default {
    getHome,
    getLogin,
    getAccount,
    changeAccount,
    login,
    deleteAccount,
    getRegister,
    register,
    logout,
  };