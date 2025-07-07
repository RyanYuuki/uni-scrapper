import express from "express";
import StreamController from "../controller/sources.controller";

const sourcesRouter = express.Router();

sourcesRouter.post("/search", StreamController.getSearch);

sourcesRouter.post("/streams", StreamController.getStream);

sourcesRouter.post("/details", StreamController.getDetails);

export default sourcesRouter;
