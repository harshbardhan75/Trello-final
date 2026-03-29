import { supabase } from "../config/supabaseClient.js";

// CREATE LIST
export const createList = async (boardId, title) => {
  // Step 1: find max position
  const { data: lists } = await supabase
    .from("lists")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1);

  const newPosition = lists.length > 0 ? lists[0].position + 1 : 1;

  // Step 2: insert new list
  const { data, error } = await supabase
    .from("lists")
    .insert([
      {
        board_id: boardId,
        title,
        position: newPosition,
      },
    ])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

export const updateList = async (listId, title) => {
  const { data, error } = await supabase
    .from("lists")
    .update({ title })
    .eq("id", listId)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// DELETE LIST
export const deleteList = async (listId) => {
  const { error } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId);

  if (error) throw new Error(error.message);

  return true;
};

// REORDER LISTS 🔥🔥🔥
export const reorderLists = async (lists) => {
  /**
   * lists = [
   *   { id: "list1", position: 1 },
   *   { id: "list2", position: 2 }
   * ]
   */

  const updates = lists.map((list) => ({
    id: list.id,
    position: list.position,
  }));

  const { error } = await supabase
    .from("lists")
    .upsert(updates, { onConflict: "id" });

  if (error) throw new Error(error.message);

  return true;
};
