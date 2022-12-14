import { Router } from "express";
import PoemController from "../controllers/PoemController.js";
import {ensureAuth} from "../middleware/isAuth.js";

const PoemRouter = Router();

PoemRouter.get("/poems", ensureAuth, PoemController.getAllPoems);
PoemRouter.get("/poems/added", ensureAuth, PoemController.getAllPoems);

PoemRouter.post("/poems/:id", ensureAuth, PoemController.commentPoem);
PoemRouter.get("/poems/:id", ensureAuth, PoemController.getPoem);
PoemRouter.put("/poems/:id", ensureAuth, PoemController.updatePoem);
PoemRouter.delete("/poems/:id", ensureAuth, PoemController.deletePoem);

PoemRouter.get("/poems/:id/edited", ensureAuth, PoemController.getPoem);
PoemRouter.get("/poems/:id/comment", ensureAuth, PoemController.getPoem);
PoemRouter.get("/yourwork", ensureAuth, PoemController.getYourWork);
PoemRouter.get("/notfound", ensureAuth, PoemController.notFound);

PoemRouter.get("/createpoem", ensureAuth, PoemController.getCreatePoem)
PoemRouter.post("/createpoem", ensureAuth, PoemController.addPoem);


export default PoemRouter;