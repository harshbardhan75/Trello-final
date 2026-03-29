import express from "express";
import * as boardController from "../controllers/board.controller.js";

const router = express.Router();

router.post("/", boardController.createBoard);
router.get("/", boardController.getAllBoards);
router.get("/search", boardController.searchBoards);
router.get("/:id", boardController.getBoardById);
export default router;
