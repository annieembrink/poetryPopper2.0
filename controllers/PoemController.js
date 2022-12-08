import PoemModel from "../models/PoemModel.js";
import CommentModel from "../models/CommentModel.js";
import { successUrlEncode, failUrlEncode } from "../utils.js";
// import qs from "querystring";
import { ObjectId } from "mongodb";
import { fail } from "assert";

//Display all poems. Public and private ones. 
async function getAllPoems(req, res) {
  
    let locals;

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
  let locals;
  let renderString;

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
    console.log('if')
      userPoemMatch = true;
      locals = {poem, pageTitle: "Read and edit poem", isAuth: req.session.isAuth, serverMessage: req.query, poemId, userPoemMatch, comments, user: req.session.username}
      // renderString = "readAndEditPoem"
      res.render("readAndEditPoem", locals)
  } else { //render read page if user who requests poem did not create it
    console.log('else')
    userPoemMatch = false; 
    locals = {poem, pageTitle: "Read poem", isAuth: req.session.isAuth, serverMessage: req.query, userPoemMatch, poemId, comments, user: req.session.username}
    renderString = "readPoem"
    res.render("readPoem", locals)
  }

  } catch (error) {
    console.log(error)
    res.render('home')
} 

}
  // } finally {
  //   console.log('does this happen?')
  //   res.render(renderString, locals) 
  // }

//Get page create poem
async function getCreatePoem(req, res) {
  let locals; 
  try {
    locals = {pageTitle: "Create poem", isAuth: req.session.isAuth, serverMessage: req.query, user: req.session.username}
  } catch (error) {
    console.log(error)
  } finally {
    res.render("createpoem", locals) //render page
  }
}

async function updatePoem(req, res) {
  let q;
  let msg;
  let failOrSuccess;

  try {
    const id = req.params.id;

    const { name, poem, visibility}  = req.body;
    
    await PoemModel.updateOne(
      { _id: ObjectId(id) },
      { name, poem, visibility }
    );

    failOrSuccess = "Success"
    msg = "Successfully updated poem!";
    q = successUrlEncode("Successfully updated poem")


  } catch(err) {
    console.error(err.message);
    failOrSuccess = "Success"
    msg = "Couldn't update poem, try again"
    q = failUrlEncode("Could not update poem")


  } finally {
    const backURL = req.header('Referer') || '/';
    console.log(backURL)
    res.redirect(`/poems?${q}`);
  }
}

async function addPoem(req, res) {
  let q;

  try {
    const {name, poem, visibility} = req.body;

    const postedBy = ObjectId(req.session.userId);

    const poemDoc = new PoemModel({name , poem, visibility, postedBy})
    
    poemDoc.save();

    q = successUrlEncode("Successfully created poem")
  } catch (err) {
    console.error(err.message);
    q = failUrlEncode("Something went wrong, try again")
  } finally {
    res.redirect(`/poems?${q}`);
  }
}

async function deletePoem(req, res) {
  let q;

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
    res.redirect(`/poems?${q}`);
  }
}
async function commentPoem2(id, comment) {
  return 
}

async function commentPoem(req, res) {
  let q;

  try {
    
    const comment = req.body.comment
    const poemId = ObjectId(req.body.id)
    const postedBy = req.session.userId

    const commentDoc = new CommentModel({comment, poemId, postedBy})
    
    await commentDoc.save();

    console.log('The new comment', commentDoc)

    const commentsThatShowOnPage = await CommentModel.find({poemId: poemId})
    console.log(commentsThatShowOnPage)

    const theCommentedPoem = await PoemModel.find({_id: poemId})
    console.log('the commented poem', theCommentedPoem)

    const result = await PoemModel.updateOne({_id: poemId}, {comments: commentsThatShowOnPage});
    // const result = await PoemModel.updateOne({_id: poemId}, {$push: {"comments": commentDoc._id}});
    console.log('result of poem model update one', result)
    res.json({message: "hello"})

    // q = new URLSearchParams({type: "success", message: "Successfully commented poem!"});
    q = successUrlEncode("Successfully commented poem")

  } catch (err) {
    console.error(err.message);
    q = failUrlEncode("Couldn't comment, try again")

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