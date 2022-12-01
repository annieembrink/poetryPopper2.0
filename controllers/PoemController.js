import PoemModel from "../models/PoemModel.js";
// import qs from "querystring";
import { ObjectId } from "mongodb";

async function getAllPoems(req, res) {
  // get all public Poems
  // make sure that postedBy gets populated with the user
  const publicPoems = await QuoteModel.find({visibility: 'public'}).populate("postedBy", "username").exec(); // I want user.username to populate postedBy 

  // get all Poems posted by logged in user
  // session should have userId
  // because it is added in AuthController.login
  const {userId} = req.session 
  const userPoems = await QuoteModel.find( {postedBy: ObjectId(userId)});

  const locals = { publicPoems, userPoems, serverMessage: req.query };
  res.render("poems", locals);
}

async function updatePoem(req, res) {
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
    const q = new URLSearchParams({type: "success", message: err.message});
    return res.redirect(`/quotes?${q}`);
  } finally {
    const q = new URLSearchParams({type: "success", message: "Successfully updated quote!"});
    res.redirect(`/quotes?${q}`);
  }
}

async function addPoem(req, res) {
  let query = null;

  try {
    // collect data from body
    const {name, poem, visibility} = req.body;

    const postedBy = ObjectId(req.session.userId);

    // create Quote document instance locally
    const poemDoc = new QuoteModel({name , poem, visibility, postedBy})
    
    // save to database
    poemDoc.save();

    // create message that operation was successfull
    query = new URLSearchParams({type: "success", message: "Successfully created quote!"});
  } catch (err) {
    // create message that operation was unsuccessfull
    query = new URLSearchParams({type: "fail", message: err.message});
    console.error(err.message);
  } finally {
    const queryStr = query.toString();
    res.redirect(`/quotes?${queryStr}`);
  }
}

async function deletePoem(req, res) {
  try {
    // get id from params /quotes/<this-part>
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
    res.redirect("/");
  }
}

export default {
  getAllPoems,
  updatePoem,
  addPoem,
  deletePoem,
};