import * as service from "../services/cardDetails.service.js";

// LABELS
export const addLabel = async (req, res) => {
  try {
    const { cardId, labelId } = req.body;

    const result = await service.addLabelToCard(cardId, labelId);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeLabel = async (req, res) => {
  try {
    const { cardId, labelId } = req.body;

    await service.removeLabelFromCard(cardId, labelId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// MEMBERS
export const addMember = async (req, res) => {
  try {
    const { cardId, memberId } = req.body;

    const result = await service.addMemberToCard(cardId, memberId);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { cardId, memberId } = req.body;

    await service.removeMemberFromCard(cardId, memberId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// CHECKLIST
export const createChecklist = async (req, res) => {
  try {
    const { cardId, title } = req.body;

    const result = await service.createChecklist(cardId, title);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addChecklistItem = async (req, res) => {
  try {
    const { checklistId, content } = req.body;

    const result = await service.addChecklistItem(checklistId, content);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleChecklistItem = async (req, res) => {
  try {
    const { itemId, isCompleted } = req.body;

    const result = await service.toggleChecklistItem(itemId, isCompleted);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET CARD DETAILS
export const getCardDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await service.getCardDetails(id);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
