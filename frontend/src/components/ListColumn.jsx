import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableCard from "./SortableCard.jsx";

export default function ListColumn({
  list,
  onSaveTitle,
  onDeleteList,
  onAddCard,
  onOpenCard,
  labelMap,
}) {
  const [draftTitle, setDraftTitle] = useState(list.title);
  const [adding, setAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: { type: "list" },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `droppable-${list.id}`,
    data: { type: "drop-list", listId: list.id },
  });

  const setRefs = (node) => {
    setNodeRef(node);
    setDropRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cards = (list.cards || [])
    .slice()
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const cardIds = cards.map((c) => c.id);

  const cardsWithMeta = cards.map((c) => ({
    ...c,
    listId: list.id,
    labels: (c.labels || [])
      .map((x) => (x.label ? x.label : x))
      .map((lb) => labelMap?.get(lb.id) || lb),
  }));

  return (
    <div
      ref={setRefs}
      style={style}
      className={`list-column ${isDragging ? "dragging" : ""}`}
      {...attributes}
    >
      <div className="list-header">
        <div
          className="list-header-drag-zone"
          {...listeners}
          title="Drag to reorder list"
        >
          <span className="list-drag-grip" aria-hidden>
            ⋮⋮
          </span>
        </div>
        <input
          className="list-title-input"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={() => {
            if (draftTitle.trim() && draftTitle !== list.title) {
              onSaveTitle(list.id, draftTitle.trim());
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.target.blur();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            if (window.confirm("Delete this list and its cards?")) {
              onDeleteList(list.id);
            }
          }}
        >
          ✕
        </button>
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className={`list-cards ${isOver ? "is-over" : ""}`}>
          {cardsWithMeta.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onOpen={onOpenCard}
              dim={card._dim}
            />
          ))}
        </div>
      </SortableContext>

      <div className="add-card-btn">
        {adding ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea
              className="input"
              rows={3}
              placeholder="Card title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              autoFocus
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const t = newCardTitle.trim();
                  if (t) onAddCard(list.id, t);
                  setNewCardTitle("");
                  setAdding(false);
                }}
              >
                Add
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setAdding(false);
                  setNewCardTitle("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAdding(true)}>
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}
