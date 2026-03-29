import { supabase } from "../config/supabaseClient.js";


// =======================
// LABELS
// =======================

// ADD LABEL TO CARD
export const addLabelToCard = async (cardId, labelId) => {
  const { data, error } = await supabase
    .from("card_labels")
    .insert([{ card_id: cardId, label_id: labelId }])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

// REMOVE LABEL FROM CARD
export const removeLabelFromCard = async (cardId, labelId) => {
  const { error } = await supabase
    .from("card_labels")
    .delete()
    .eq("card_id", cardId)
    .eq("label_id", labelId);

  if (error) throw new Error(error.message);

  return true;
};


// =======================
// MEMBERS
// =======================

// ADD MEMBER TO CARD
export const addMemberToCard = async (cardId, memberId) => {
  const { data, error } = await supabase
    .from("card_members")
    .insert([{ card_id: cardId, member_id: memberId }])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

// REMOVE MEMBER FROM CARD
export const removeMemberFromCard = async (cardId, memberId) => {
  const { error } = await supabase
    .from("card_members")
    .delete()
    .eq("card_id", cardId)
    .eq("member_id", memberId);

  if (error) throw new Error(error.message);

  return true;
};


// =======================
// CHECKLIST
// =======================

// CREATE CHECKLIST
export const createChecklist = async (cardId, title) => {
  const { data, error } = await supabase
    .from("checklists")
    .insert([{ card_id: cardId, title }])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

// ADD CHECKLIST ITEM
export const addChecklistItem = async (checklistId, content) => {
  const { data, error } = await supabase
    .from("checklist_items")
    .insert([{ checklist_id: checklistId, content }])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

// TOGGLE CHECKLIST ITEM
export const toggleChecklistItem = async (itemId, isCompleted) => {
  const { data, error } = await supabase
    .from("checklist_items")
    .update({ is_completed: isCompleted })
    .eq("id", itemId)
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};


// =======================
// CARD DETAILS FETCH
// =======================

export const getCardDetails = async (cardId) => {
  const { data, error } = await supabase
    .from("cards")
    .select(`
      id,
      title,
      description,
      due_date,
      labels:card_labels (
        label:labels (*)
      ),
      members:card_members (
        member:members (*)
      ),
      checklists (
        id,
        title,
        checklist_items (*)
      )
    `)
    .eq("id", cardId)
    .single();

  if (error) throw new Error(error.message);

  return data;
};
