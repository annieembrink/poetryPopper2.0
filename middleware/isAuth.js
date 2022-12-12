import { failUrlEncode } from "../utils.js";

function ensureAuth(req, res, next) {
    if (req.session.isAuth) {
        next();
    } else {
        // const q = failUrlEncode("You must be authenticated to access");
        req.session.serverMessage = {type:"fail", message: "You must be authenticated to access"}
        res.redirect(`/login`)

        req.session.serverMessage = {}
    }
}

function ensureNotAuth(req, res, next) {
    if (!req.session.isAuth) {
        next();
    } else {
        // const q = failUrlEncode("You are already authenticated");
        req.session.serverMessage = {type:"fail", message: "You are already authenticated"}
        res.redirect(`/poems`)

        req.session.serverMessage = {}
    }
}

export {
    ensureAuth,
    ensureNotAuth
}