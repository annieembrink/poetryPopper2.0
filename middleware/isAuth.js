import { failUrlEncode } from "../utils.js";

function ensureAuth(req, res, next) {
    if (req.session.isAuth) {
        next();
    } else {
        const q = failUrlEncode("You must be authenticated to access");
        return res.redirect(`/login?${q}`)
    }
}

function ensureNotAuth(req, res, next) {
    if (!req.session.isAuth) {
        next();
    } else {
        const q = failUrlEncode("You are already authenticated");
        return res.redirect(`/quotes?${q}`)
    }
}

export {
    ensureAuth,
    ensureNotAuth
}