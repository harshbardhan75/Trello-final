import { supabase } from "../config/supabaseClient.js";

// CREATE BOARD
export const createBoard = async (title) => {
  const { data, error } = await supabase
    .from("boards")
    .insert([{ title }])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

// GET ALL BOARDS
export const getAllBoards = async () => {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data;
};

// GET BOARD WITH LISTS & CARDS (IMPORTANT 🔥)
export const getBoardById = async (boardId) => {
  const { data, error } = await supabase
    .from("boards")
    .select(`
      id,
      title,
      lists (
        id,
        title,
        position,
        cards (
          id,
          title,
          description,
          position
        )
      )
    `)
    .eq("id", boardId)
    .single();

  if (error) throw new Error(error.message);

  return data;
};
export const searchBoards = async (title) => {
  let query = supabase.from("boards").select("*");

  if (title) {
    query = query.ilike("title", `%${title}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
};
