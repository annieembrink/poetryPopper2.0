import PoemModel from "../models/PoemModel.js";
import CommentModel from "../models/CommentModel.js";
import {
  successUrlEncode,
  failUrlEncode
} from "../utils.js";
import {
  ObjectId
} from "mongodb";

//Display all poems. Public and private ones. 
async function getAllPoems(req, res) {
  // console.log('req query', req.query)
  let userPoemMatch = false;
  console.log('req session servermessage', req.session.serverMessage)

    //Find all public poems and populate username
    const publicPoems = await PoemModel.find({
      visibility: 'public'
    }).populate("postedBy", "username").exec(); // I want user.username to populate postedBy 

    //We need id of auth and logged in user to display their own poems
    const {
      userId
    } = req.session

    for (let i = 0; i < publicPoems.length; i++) {
      const poem = publicPoems[i];
      //Find who created that poem
      if (poem.postedBy) {
        const whoCreatedThePoem = poem.postedBy._id.valueOf();
        // console.log(whoCreatedThePoem)

        if (whoCreatedThePoem === userId) {
          poem.userPoemMatch = true;
        } else {
          poem.userPoemMatch = false;
        }
      } else {
        poem.userPoemMatch = false;
      }
    }

    const locals = {
      publicPoems,
      serverMessage: {...req.session.serverMessage},
      pageTitle: "Community",
      isAuth: req.session.isAuth,
      user: req.session.username,
      userPoemMatch
    };
    // console.log('get all poems', req.query)
    req.session.serverMessage = {}
    res.render("poems", locals);

  
}
async function getYourWork(req, res) {
  //We need id of auth and logged in user to display their own poems
  const {
    userId
  } = req.session

  //Find them in db
  // const userPoems = await PoemModel.find({visibility: "private", postedBy: ObjectId(userId)}) || [];
  const userPoems = await PoemModel.find({
    postedBy: userId
  }).populate("postedBy", "username").exec(); // I want user.username to populate postedBy 

  const locals = {
    userPoems,
    serverMessage: {...req.session.serverMessage},
    pageTitle: "Your work",
    isAuth: req.session.isAuth,
    user: req.session.username
  };
  // console.log('get all poems', req.query)
  req.session.serverMessage = {}
  res.render("yourWork", locals);

}

async function notFound(req, res) {
  const locals = {
    serverMessage: {...req.session.serverMessage},
    pageTitle: "Page not found",
    isAuth: req.session.isAuth,
    user: req.session.username
  };
  req.session.serverMessage = {}
  res.render("notFound", locals);

}

//Get requested poem, open one specific poem to read
async function getPoem(req, res) {

  // console.log('req query', req.query)

  let userPoemMatch = false;
  let locals;

  try {
    
      //id of clicked poem
      const poemId = req.params.id;
      // console.log('req params', req.params, 'req query', req.query)

      //id of logged in user
      const {
        userId
      } = req.session

      //find the clicked poem in db
      const poem = await PoemModel.findOne({
        _id: poemId
      }).populate("postedBy", "username").exec();

      //find comments connected to clicked poem
      const comments = await CommentModel.find({
        poemId: poemId
      }).populate("postedBy", "username").exec();

      //Find who created that poem
      const whoCreatedThePoem = poem.postedBy._id.valueOf();

      //render edit page if user who requests poem is the same as created the poem
      if (whoCreatedThePoem === userId) {
        console.log('this is your own poem')
        userPoemMatch = true;
        locals = {
          poem,
          pageTitle: "Read and edit poem",
          isAuth: req.session.isAuth,
          serverMessage: {...req.session.serverMessage},
          poemId,
          userPoemMatch,
          comments,
          user: req.session.username
        }
        req.session.serverMessage = {}
        res.render("readAndEditPoem", locals)

      } else { //render read page if user who requests poem did not create it
        console.log('you didnt write this poem')
        userPoemMatch = false;
        locals = {
          poem,
          pageTitle: "Read poem",
          isAuth: req.session.isAuth,
          serverMessage: {...req.session.serverMessage},
          userPoemMatch,
          poemId,
          comments,
          user: req.session.username
        }
        req.session.serverMessage = {}
        res.render("readPoem", locals)
      }

  } catch (error) {
    console.log(error)
    req.session.serverMessage = {}
    res.render('home')

  }
}


//Get page create poem
async function getCreatePoem(req, res) {
  let locals;
  try {
    locals = {
      pageTitle: "Create poem",
      isAuth: req.session.isAuth,
      serverMessage: {...req.session.serverMessage},
      user: req.session.username
    }
  } catch (error) {
    console.log(error)
  } finally {
    req.session.serverMessage = {}
    res.render("createpoem", locals) //render page

  }
}

async function updatePoem(req, res) {
  let q;

  try {
    const id = req.params.id;

    const {
      name,
      poem,
      visibility
    } = req.body;



    await PoemModel.findOneAndUpdate({
      _id: ObjectId(id)
    }, {
      name,
      poem,
      visibility
    });


    // q = successUrlEncode("Successfully updated poem")
    req.session.serverMessage = {type: "success", message: "Successfully updated poem"}

    res.redirect(`/poems/${id}/edited`);


  } catch (err) {
    console.error('catch', err.message);
    // q = failUrlEncode("Could not update poem, try again")
    req.session.serverMessage = {type: "fail", message: "Couldn't not update poem, try again"}

    res.redirect(`/poems`);
  }
}

async function addPoem(req, res) {
  let q;

  try {
    const {
      name,
      poem,
      visibility
    } = req.body;

    const postedBy = ObjectId(req.session.userId);

    const poemDoc = new PoemModel({
      name,
      poem,
      visibility,
      postedBy
    })

    poemDoc.save();

    // q = successUrlEncode("Successfully created poem")
    req.session.serverMessage = {type: "success", message: "Successfully created poem"}

    console.log(`/poems/added`)
    res.redirect(`/poems/added`);

  } catch (err) {
    console.error(err.message);
    // q = failUrlEncode("Something went wrong, try again")
    req.session.serverMessage = {type: "fail", message: "Something went wrong"}

    res.redirect(`/poems`);
  }
}

async function deletePoem(req, res) {
  let q;

  try {
    // get id from params /poems/<this-part>
    const {
      id
    } = req.params;

    // get result from deletion
    const result = await PoemModel.deleteOne({
      _id: id
    });

    // q = successUrlEncode("Successfully deleted poem!");
    req.session.serverMessage = {type: "success", message: "Successfully deleted poem"}


  } catch (err) {
    console.error(err.message);
    // q = failUrlEncode("Something went wrong, try again");
    req.session.serverMessage = {type: "fail", message: "Something went wrong, try again"}


  } finally {
    res.redirect(`/poems`);
  }
}

async function commentPoem(req, res) {
  // let q;

  try {
    const comment = req.body.comment
    console.log('comment', comment)
    const poemId = req.body.id
    console.log(poemId)
    const postedBy = req.session.userId

    const commentDoc = new CommentModel({
      comment,
      poemId,
      postedBy
    })

    // save comment
    await commentDoc.save();
    // get this particular post
    const postRelated = await PoemModel.findById(poemId);
    // push the comment into the post.comments array
    postRelated.comments.push(commentDoc);
    // save and redirect...
    await postRelated.save()

    console.log('does this happen?')
    // q = successUrlEncode("Successfully commented poem")
    req.session.serverMessage = {type: "success", message: "Successfully commented poem"}

    res.redirect(`/poems/${poemId}/comment`)

  } catch (err) {
    console.error(err.message);
    // q = failUrlEncode("Couldn't comment, try again")
    req.session.serverMessage = {type: "fail", message: "Couldn't comment, try again"}

    res.redirect(`/poems`)
  }
}

export default {
  getAllPoems,
  getPoem,
  notFound,
  getYourWork,
  getCreatePoem,
  updatePoem,
  addPoem,
  deletePoem,
  commentPoem
};