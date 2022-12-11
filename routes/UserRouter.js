import { Router } from "express";
import UserController from "../controllers/UserController.js";
import {ensureNotAuth, ensureAuth} from "../middleware/isAuth.js";

const UserRouter = Router();

// UserRouter.get("*", UserController.getHome);
UserRouter.get("/", UserController.getHome);

UserRouter.get("/account", ensureAuth, UserController.getAccount);
UserRouter.delete("/account/:id/deleted", ensureAuth, UserController.deleteAccount);
UserRouter.put("/account/:id/updated", ensureAuth, UserController.changeAccount);
UserRouter.get("/account/:id/error", ensureAuth, UserController.getAccount);
UserRouter.get("/account/:id/success", ensureAuth, UserController.getAccount);

UserRouter.get("/login", ensureNotAuth, UserController.getLogin);
UserRouter.post("/login", ensureNotAuth, UserController.login);

UserRouter.get("/register", ensureNotAuth, UserController.getRegister);
UserRouter.post("/register", ensureNotAuth, UserController.register);

UserRouter.get("/logout", ensureAuth, UserController.logout)
// UserRouter.get("*", ensureAuth, UserController.getHome)


export default UserRouter;