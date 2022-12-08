import PoemModel from "../models/PoemModel.js";
import CommentModel from "../models/CommentModel.js";
import { successUrlEncode, failUrlEncode } from "../utils.js";
// import qs from "querystring";
import { ObjectId } from "mongodb";
import { fail } from "assert";

//Display all poems. Public and private ones. 
async function getAllPoems(req, res) {

    if(req.query.message) {
    //Find all public poems and populate username
    const publicPoems = await PoemModel.find({visibility: 'public'}).populate("postedBy", "username").exec(); // I want user.username to populate postedBy 

    //We need id of auth and logged in user to display their own poems
    const {userId} = req.session 

    //Find them in db
    const userPoems = await PoemModel.find({visibility: "private", postedBy: ObjectId(userId)}) || [];

    const locals = { publicPoems, userPoems, serverMessage: req.query, pageTitle: "Poems", isAuth: req.session.isAuth, user: req.session.username };
    // console.log('get all poems', req.query)
    res.render("poems", locals);
    }

}

//Get requested poem, open one specific poem to read
async function getPoem(req, res) {

  let userPoemMatch = false;
  let locals;

  try {

    //Dont know why the comment in function commentPoem is sent as query?
    if (!req.query.comment) {
            //id of clicked poem
  const poemId = req.params.id;
  console.log('req params', req.params, 'req query', req.query)

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
    console.log('this is your own poem')
      userPoemMatch = true;
      locals = {poem, pageTitle: "Read and edit poem", isAuth: req.session.isAuth, serverMessage: req.query, poemId, userPoemMatch, comments, user: req.session.username}
      res.render("readAndEditPoem", locals)
  } else { //render read page if user who requests poem did not create it
    console.log('you didnt write this poem')
    userPoemMatch = false; 
    locals = {poem, pageTitle: "Read poem", isAuth: req.session.isAuth, serverMessage: req.query, userPoemMatch, poemId, comments, user: req.session.username}
    res.render("readPoem", locals)
  }
    } else {
      console.log('ERROR')
    }

  } catch (error) {
    console.log(error)
    res.render('home')
} 
}


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

  try {
    const id = req.params.id;

    const { name, poem, visibility}  = req.body;
    
    await PoemModel.updateOne(
      { _id: ObjectId(id) },
      { name, poem, visibility }
    );

    q = successUrlEncode("Successfully updated poem")
    res.redirect(`/poems/${id}/edited?${q}`);


  } catch(err) {
    console.error(err.message);
    q = failUrlEncode("Could not update poem")
    res.redirect(`/poems/${id}`);
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
    console.log(`/poems/added?${q}`)
    res.redirect(`/poems/added?${q}`);

  } catch (err) {
    console.error(err.message);
    q = failUrlEncode("Something went wrong, try again")
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
    
    q = successUrlEncode("Successfully deleted poem!");

  } catch (err) {
    console.error(err.message);
    q = failUrlEncode("Something went wrong, try again");

  } finally {
    res.redirect(`/poems?${q}`);
  }
}

async function commentPoem(req, res) {
  let q;

  try {
    const comment = req.body.comment
    console.log('comment', comment)
    const poemId = req.body.id
    console.log(poemId)
    const postedBy = req.session.userId

    const commentDoc = new CommentModel({comment, poemId, postedBy})

    // save comment
    await commentDoc.save();
    // get this particular post
    const postRelated = await PoemModel.findById(poemId);
    // push the comment into the post.comments array
    postRelated.comments.push(commentDoc);
    // save and redirect...
    await postRelated.save()

    console.log('does this happen?')
    q = successUrlEncode("Successfully commented poem")
    res.redirect(`${poemId}/comment?${q}`)

  } catch (err) {
    console.error(err.message);
    q = failUrlEncode("Couldn't comment, try again")
    res.redirect(`/poems?${q}`)
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