import express from "express";
import * as metaController from "../controllers/meta.controller.js";

const router = express.Router();

router.get("/labels", metaController.getLabels);
router.get("/members", metaController.getMembers);

export default router;
