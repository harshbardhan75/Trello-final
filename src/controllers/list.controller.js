import * as listService from "../services/list.service.js";

// CREATE LIST
export const createList = async (req, res) => {
  try {
    const { boardId, title } = req.body;

    const list = await listService.createList(boardId, title);

    res.status(201).json({
      success: true,
      data: list,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const list = await listService.updateList(id, title);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE LIST
export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;

    await listService.deleteList(id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REORDER LISTS
export const reorderLists = async (req, res) => {
  try {
    const { lists } = req.body;

    await listService.reorderLists(lists);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
