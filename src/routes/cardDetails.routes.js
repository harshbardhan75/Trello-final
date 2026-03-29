import express from "express";
import * as controller from "../controllers/cardDetails.controller.js";

const router = express.Router();

// LABELS
router.post("/labels/add", controller.addLabel);
router.delete("/labels/remove", controller.removeLabel);

// MEMBERS
router.post("/members/add", controller.addMember);
router.delete("/members/remove", controller.removeMember);

// CHECKLIST
router.post("/checklists", controller.createChecklist);
router.post("/checklists/items", controller.addChecklistItem);
router.patch("/checklists/items/toggle", controller.toggleChecklistItem);

// CARD DETAILS
router.get("/:id", controller.getCardDetails);

export default router;
