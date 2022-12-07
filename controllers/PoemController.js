import PoemModel from "../models/PoemModel.js";
import CommentModel from "../models/CommentModel.js";
import { successUrlEncode, failUrlEncode } from "../utils.js";
// import qs from "querystring";
import { ObjectId } from "mongodb";

//Display all poems. Public and private ones. 
async function getAllPoems(req, res) {
  
    let locals = {};

  try {
    //Find all public poems and populate username
    const publicPoems = await PoemModel.find({visibility: 'public'}).populate("postedBy", "username").exec(); // I want user.username to populate postedBy 

    //We need id of auth and logged in user to display their own poems
    const {userId} = req.session 

    //Find them in db
    const userPoems = await PoemModel.find({visibility: "private", postedBy: ObjectId(userId)}) || [];

    locals = { publicPoems, userPoems, serverMessage: req.query, pageTitle: "Poems", isAuth: req.session.isAuth, user: req.session.username };

  } catch (error) {
    console.log(error)
  } finally {
    //render poems page
    res.render("poems", locals);
  }
}

//Get requested poem, open one specific poem to read
async function getPoem(req, res) {

  let userPoemMatch = false;
  let locals = {}
  let renderString = "";

  try {
      //id of clicked poem
  const poemId = req.params.id;

  //id of logged in user
  const {userId} = req.session 

  //find the clicked poem in db
  const poem = await PoemModel.findOne({_id: poemId}).populate("postedBy", "username").exec();

  //find comments connected to clicked poem
  const comments = await CommentModel.find({poemId: poemId}).populate("postedBy", "username").exec();

  //Find who created that poem
  const whoCreatedThePoem = poem.postedBy._id.valueOf();

  //render edit page if user who requests poem is the same as created the poem
  if (whoCreatedThePoem === userId) {
      userPoemMatch = true;
      locals = {poem, pageTitle: "Read and edit poem", isAuth: req.session.isAuth, serverMessage: req.query, poemId, userPoemMatch, comments, user: req.session.username}
      renderString = "readAndEditPoem"
  } else { //render read page if user who requests poem did not create it
    userPoemMatch = false; 
    locals = {poem, pageTitle: "Read poem", isAuth: req.session.isAuth, serverMessage: req.query, userPoemMatch, poemId, comments, user: req.session.username}
    renderString = "readPoem"
  }

  } catch (error) {
    console.log(error)

  } finally {
    res.render(renderString, locals) //render page with possibility to edit
  }
} 

//Get page create poem
async function getCreatePoem(req, res) {
  let q = null; 

  const locals = {pageTitle: "Create poem", isAuth: req.session.isAuth, serverMessage: req.query, user: req.session.username}
  res.render("createpoem", locals) //render page
}

async function updatePoem(req, res) {

  let q = null; 
  try {
    const id = req.params.id;

    const { name, poem, visibility}  = req.body;
    
    await PoemModel.updateOne(
      { _id: ObjectId(id) },
      { name, poem, visibility }
    );
    q = new URLSearchParams({type: "success", message: "Successfully updated poem!"});

  } catch(err) {
    console.error(err.message);
    q = new URLSearchParams({type: "fail", message: err.message});
  } finally {
    res.redirect(`/poems?${q}`);
  }
}

async function addPoem(req, res) {
  let q = null;

  try {
    console.log('add poem was requested', req.body)

    const {name, poem, visibility} = req.body;

    const postedBy = ObjectId(req.session.userId);

    // create Quote document instance locally
    const poemDoc = new PoemModel({name , poem, visibility, postedBy})
    
    // save to database
    poemDoc.save();

    // create message that operation was successfull
    q = new URLSearchParams({type: "success", message: "Successfully created poem!"});
  } catch (err) {
    // create message that operation was unsuccessfull
    console.error(err.message);
    q = new URLSearchParams({type: "fail", message: err.message});
  } finally {
    // res.redirect(`/poems?${queryStr}`);
    // res.redirect(`/createpoem?${q}`); 
    const backURL = req.header('Referer') || '/';
    res.redirect(backURL);
  }
}

async function deletePoem(req, res) {
  let q = null;

  try {
    // get id from params /poems/<this-part>
    const { id } = req.params;
    
    // get result from deletion
    const result = await PoemModel.deleteOne({ _id: id });
    
    // make sure there was a deletion otherwise raise exception
    if (result.deletedCount == 0) {
      throw {message: "No deletion was made"};
    }

    q = new URLSearchParams({type: "success", message: "Successfully deleted poem!"});

  } catch (err) {
    console.error(err.message);
    q = new URLSearchParams({type: "fail", message: err.message});

  } finally {
    res.redirect(`/poems${q}`);
  }
}

async function commentPoem(req, res) {
  let q = null;

  try {
    
    const comment = req.body.comment
    const poemId = ObjectId(req.body.id)
    const postedBy = req.session.userId

    const commentDoc = new CommentModel({comment, poemId, postedBy})
    
    await commentDoc.save();

    await PoemModel.findOneAndUpdate({_id: ObjectId(poemId)}, {$push: {"comments": commentDoc._id}});

    // q = new URLSearchParams({type: "success", message: "Successfully commented poem!"});
    q = successUrlEncode("Successfully commented poem")

  } catch (err) {
    console.error(err.message);
    // q = new URLSearchParams({type: "fail", message: err.message});

  } finally {
    // const backURL = req.header('Referer') || '/';
    // res.redirect(backURL); `${backURL + q}`
    // res.redirect(`${backURL}`); 
    res.redirect(`/poems${q}`)
  }
}

export default {
  getAllPoems,
  getPoem,
  getCreatePoem,
  updatePoem,
  addPoem,
  deletePoem,
  commentPoem
};