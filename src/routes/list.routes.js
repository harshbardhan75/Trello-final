import express from "express";
import * as listController from "../controllers/list.controller.js";

const router = express.Router();

router.post("/", listController.createList);
router.patch("/reorder", listController.reorderLists);
router.patch("/:id", listController.updateList);
router.delete("/:id", listController.deleteList);

export default router;
