import express from "express";
import * as cardController from "../controllers/card.controller.js";

const router = express.Router();

router.post("/", cardController.createCard);
router.patch("/move", cardController.moveCard);
router.get("/search", cardController.searchCards);
router.patch("/:id", cardController.updateCard);
router.delete("/:id", cardController.deleteCard);
export default router;
