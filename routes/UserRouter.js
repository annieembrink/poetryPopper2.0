import { Router } from "express";
import UserController from "../controllers/UserController.js";
import {ensureNotAuth, ensureAuth} from "../middleware/isAuth.js";

const UserRouter = Router();

// UserRouter.get("*", UserController.getHome);
UserRouter.get("/", UserController.getHome);

UserRouter.get("/login", ensureNotAuth, UserController.getLogin);
UserRouter.post("/login", ensureNotAuth, UserController.login);

UserRouter.get("/register", ensureNotAuth, UserController.getRegister);
UserRouter.post("/register", ensureNotAuth, UserController.register);

UserRouter.get("/logout", ensureAuth, UserController.logout)


export default UserRouter;