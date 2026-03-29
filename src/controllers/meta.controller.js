import * as metaService from "../services/meta.service.js";

export const getLabels = async (req, res) => {
  try {
    const data = await metaService.getAllLabels();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const data = await metaService.getAllMembers();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
