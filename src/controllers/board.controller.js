import * as boardService from "../services/board.service.js";

// CREATE BOARD
export const createBoard = async (req, res) => {
  try {
    const { title } = req.body;

    const board = await boardService.createBoard(title);

    res.status(201).json({
      success: true,
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL BOARDS
export const getAllBoards = async (req, res) => {
  try {
    const boards = await boardService.getAllBoards();

    res.json({
      success: true,
      data: boards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BOARD BY ID
export const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await boardService.getBoardById(id);

    res.json({
      success: true,
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const searchBoards = async (req, res) => {
  try {
    const { title } = req.query;

    const boards = await boardService.searchBoards(title);

    res.json({
      success: true,
      data: boards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
