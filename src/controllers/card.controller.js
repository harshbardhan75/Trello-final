import * as cardService from "../services/card.service.js";

// CREATE CARD
export const createCard = async (req, res) => {
  try {
    const { listId, title } = req.body;

    const card = await cardService.createCard(listId, title);

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// MOVE CARD
export const moveCard = async (req, res) => {
  try {
    await cardService.moveCard(req.body);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await cardService.updateCard(id, req.body);
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    await cardService.deleteCard(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchCards = async (req, res) => {
  try {
    const { title, labelId, memberId, dueBefore } = req.query;

    const result = await cardService.searchCards({
      title,
      labelId,
      memberId,
      dueBefore,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
