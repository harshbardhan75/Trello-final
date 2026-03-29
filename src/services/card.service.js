import { supabase } from "../config/supabaseClient.js";

// CREATE CARD
export const createCard = async (listId, title) => {
  // find last position in list
  const { data: cards } = await supabase
    .from("cards")
    .select("position")
    .eq("list_id", listId)
    .order("position", { ascending: false })
    .limit(1);

  const newPosition = cards.length > 0 ? cards[0].position + 1 : 1;

  const { data, error } = await supabase
    .from("cards")
    .insert([
      {
        list_id: listId,
        title,
        position: newPosition,
      },
    ])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

export const updateCard = async (cardId, fields) => {
  const payload = {};
  if (fields.title !== undefined) payload.title = fields.title;
  if (fields.description !== undefined) payload.description = fields.description;
  if (fields.due_date !== undefined) payload.due_date = fields.due_date;

  const { data, error } = await supabase
    .from("cards")
    .update(payload)
    .eq("id", cardId)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

export const deleteCard = async (cardId) => {
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw new Error(error.message);
  return true;
};

export const moveCard = async ({
  cardId,
  sourceListId,
  destinationListId,
  destinationIndex,
}) => {
  if (sourceListId === destinationListId) {
    const { data: allCards, error: fetchErr } = await supabase
      .from("cards")
      .select("id")
      .eq("list_id", sourceListId)
      .order("position", { ascending: true });

    if (fetchErr) throw new Error(fetchErr.message);

    const without = allCards.filter((c) => c.id !== cardId);
    const reordered = [...without];
    reordered.splice(destinationIndex, 0, { id: cardId });

    const updates = reordered.map((c, i) => ({
      id: c.id,
      position: i + 1,
      list_id: sourceListId,
    }));

    const { error } = await supabase.from("cards").upsert(updates, {
      onConflict: "id",
    });
    if (error) throw new Error(error.message);
    return true;
  }

  // STEP 1: Get all cards in destination list
  const { data: destCards } = await supabase
    .from("cards")
    .select("id, position")
    .eq("list_id", destinationListId)
    .order("position", { ascending: true });

  // STEP 2: Insert moved card into new position
  const updatedDestCards = [];

  let inserted = false;
  let pos = 1;

  for (let card of destCards) {
    if (pos === destinationIndex + 1 && !inserted) {
      updatedDestCards.push({ id: cardId, position: pos });
      inserted = true;
      pos++;
    }

    updatedDestCards.push({ id: card.id, position: pos });
    pos++;
  }

  // If inserted at end
  if (!inserted) {
    updatedDestCards.push({ id: cardId, position: pos });
  }

  // STEP 3: Update source list (remove gap)
  const { data: sourceCards } = await supabase
    .from("cards")
    .select("id")
    .eq("list_id", sourceListId)
    .neq("id", cardId)
    .order("position", { ascending: true });

  const updatedSourceCards = sourceCards.map((card, index) => ({
    id: card.id,
    position: index + 1,
  }));

  // STEP 4: Apply all updates
  const { error } = await supabase
    .from("cards")
    .upsert(
      [
        ...updatedDestCards.map((c) => ({
          id: c.id,
          position: c.position,
          list_id: destinationListId,
        })),
        ...updatedSourceCards,
      ],
      { onConflict: "id" }
    );

  if (error) throw new Error(error.message);

  return true;
};
export const searchCards = async ({
  title,
  labelId,
  memberId,
  dueBefore,
}) => {
  let query = supabase.from("cards").select(`
    id,
    title,
    description,
    due_date,
    list_id,
    labels:card_labels (
      label:labels (*)
    ),
    members:card_members (
      member:members (*)
    )
  `);

  // 🔎 FILTER BY TITLE
  if (title) {
    query = query.ilike("title", `%${title}%`);
  }

  // 🔎 FILTER BY DUE DATE
  if (dueBefore) {
    query = query.lte("due_date", dueBefore);
  }

  // 🔎 FILTER BY LABEL
  if (labelId) {
    query = query.eq("card_labels.label_id", labelId);
  }

  // 🔎 FILTER BY MEMBER
  if (memberId) {
    query = query.eq("card_members.member_id", memberId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
};
