import PoemModel from "../models/PoemModel.js";
// import qs from "querystring";
import { ObjectId } from "mongodb";

async function getAllPoems(req, res) {
  // get all public Poems
  // make sure that postedBy gets populated with the user
  const publicPoems = await PoemModel.find({visibility: 'public'}).populate("postedBy", "username").exec(); // I want user.username to populate postedBy 

  // get all Poems posted by logged in user
  // session should have userId
  // because it is added in AuthController.login
  const {userId} = req.session 
  const userPoems = await PoemModel.find( {postedBy: ObjectId(userId)});

  const locals = { publicPoems, userPoems, serverMessage: req.query, pageTitle: "Poems", isAuth: req.session.isAuth };
  res.render("poems", locals);
}
async function getPoem(req, res) {
  const id = req.params.id;
  const poem = await PoemModel.findOne({_id: id}).populate("postedBy", "username").exec();
  console.log(poem)
  const locals = {poem, pageTitle: "Read poem", isAuth: req.session.isAuth, serverMessage: req.query}
  res.render("readpoem", locals)
  // res.redirect(`/poems?${id}`)
}
async function getCreatePoem(req, res) {
  const locals = {pageTitle: "Create poem", isAuth: req.session.isAuth, serverMessage: req.query}
  res.render("createpoem", locals)
  // res.redirect(`/poems?${id}`)
}

async function updatePoem(req, res) {

  let q = null; 
  try {
    // get the id of the request
    const id = req.params.id;

    const { name, poem, visibility}  = req.body;
    
    // find old Poem and replace doc from collection
    // validation happens as we update
    await PoemModel.updateOne(
      { _id: ObjectId(id) },
      { name, poem, visibility }
    );

  } catch(err) {
    console.error(err.message);
    q = new URLSearchParams({type: "success", message: err.message});
    return res.redirect(`/poems?${q}`);
  } finally {
    q = new URLSearchParams({type: "success", message: "Successfully updated poem!"});
    res.redirect(`/poems?${q}`);
  }
}

async function addPoem(req, res) {
  let query = null;

  try {
    console.log('add poem was requested', req.body)
    // collect data from body
    const {name, poem, visibility} = req.body;

    const postedBy = ObjectId(req.session.userId);

    // create Quote document instance locally
    const poemDoc = new PoemModel({name , poem, visibility, postedBy})
    
    // save to database
    poemDoc.save();

    // create message that operation was successfull
    query = new URLSearchParams({type: "success", message: "Successfully created poem!"});
  } catch (err) {
    // create message that operation was unsuccessfull
    query = new URLSearchParams({type: "fail", message: err.message});
    console.error(err.message);
  } finally {
    const queryStr = query.toString();
    // res.redirect(`/poems?${queryStr}`);
    res.redirect(`/createpoem`);
  }
}

async function deletePoem(req, res) {
  try {
    // get id from params /poems/<this-part>
    const { id } = req.params;
  
    // get result from deletion
    const result = await PoemModel.deleteOne({ _id: id });
    
    // make sure there was a deletion otherwise raise exception
    if (result.deletedCount == 0) {
      throw {message: "No deletion was made"};
    }

  } catch (err) {
    console.error(err.message);
  } finally {
    res.redirect("/poems");
  }
}

export default {
  getAllPoems,
  getPoem,
  getCreatePoem,
  updatePoem,
  addPoem,
  deletePoem,
};