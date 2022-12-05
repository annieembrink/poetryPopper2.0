import { failUrlEncode } from "../utils.js";

function yourPoem(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        const q = failUrlEncode("You can't edit somone elses poem");
        return res.redirect(`/poems?${q}`)
    }
}

function notYourPoem(req, res, next) {
    if (!req.session.userId) {
        next();
    } else {
        const q = failUrlEncode("This is your poem");
        return res.redirect(`/poems?${q}`)
    }
}

export {
    yourPoem,
    notYourPoem
}