import { Router } from "express";
import PoemController from "../controllers/PoemController.js";
import {ensureAuth} from "../middleware/isAuth.js";

const PoemRouter = Router();

PoemRouter.get("/poems", ensureAuth, PoemController.getAllPoems);
PoemRouter.put("/poems/:id", ensureAuth, PoemController.updatePoem);
PoemRouter.post("/poems", ensureAuth, PoemController.addPoem);
PoemRouter.delete("/poems/:id", ensureAuth, PoemController.deletePoem);


export default PoemRouter;