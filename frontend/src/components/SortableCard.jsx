import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Drag the whole card to reorder within a list or move to another list.
 * Double-click (or Enter) to open card details — avoids opening while dragging.
 */
export default function SortableCard({ card, onOpen, dim }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", listId: card.listId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: dim ? 0.35 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card-tile ${isDragging ? "dragging" : ""}`}
      {...attributes}
      {...listeners}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen(card.id);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(card.id);
        }
      }}
      title="Drag to move · Double-click to open"
    >
      {card.labels?.length > 0 && (
        <div className="card-labels">
          {card.labels.map((lb) => (
            <span
              key={lb.id}
              className="label-pill"
              style={{ background: lb.color || "#579dff" }}
              title={lb.name}
            />
          ))}
        </div>
      )}
      <div className="card-title-text">{card.title}</div>
    </div>
  );
}
