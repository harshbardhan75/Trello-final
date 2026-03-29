import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cardDetailsApi,
  cardsApi,
  metaApi,
} from "../api/client.js";

function normalizeJoin(rows) {
  if (!rows?.length) return [];
  return rows.map((row) => row.label || row.member || row);
}

export default function CardModal({ cardId, boardId, onClose }) {
  const qc = useQueryClient();

  const { data: details, isLoading } = useQuery({
    queryKey: ["card-details", cardId],
    queryFn: async () => {
      const res = await cardDetailsApi.get(cardId);
      return res.data;
    },
    enabled: !!cardId,
  });

  const { data: allLabels } = useQuery({
    queryKey: ["meta", "labels"],
    queryFn: async () => (await metaApi.labels()).data,
  });

  const { data: allMembers } = useQuery({
    queryKey: ["meta", "members"],
    queryFn: async () => (await metaApi.members()).data,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync form when GET /card-details returns */
    if (!details) return;
    setTitle(details.title || "");
    setDescription(details.description || "");
    if (details.due_date) {
      try {
        const d = parseISO(details.due_date);
        setDue(format(d, "yyyy-MM-dd'T'HH:mm"));
      } catch {
        setDue("");
      }
    } else {
      setDue("");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [details]);

  const saveCore = useMutation({
    mutationFn: () => {
      const body = {
        title: title.trim(),
        description: description.trim() || null,
        due_date: due ? new Date(due).toISOString() : null,
      };
      return cardsApi.update(cardId, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      qc.invalidateQueries({ queryKey: ["card-details", cardId] });
    },
  });

  const removeCard = useMutation({
    mutationFn: () => cardsApi.remove(cardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      onClose();
    },
  });

  const toggleLabel = useMutation({
    mutationFn: async ({ labelId, add }) => {
      if (add) await cardDetailsApi.addLabel(cardId, labelId);
      else await cardDetailsApi.removeLabel(cardId, labelId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-details", cardId] });
      qc.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });

  const toggleMember = useMutation({
    mutationFn: async ({ memberId, add }) => {
      if (add) await cardDetailsApi.addMember(cardId, memberId);
      else await cardDetailsApi.removeMember(cardId, memberId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-details", cardId] });
      qc.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });

  const addChecklist = useMutation({
    mutationFn: (t) => cardDetailsApi.createChecklist(cardId, t),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["card-details", cardId] }),
  });

  const addItem = useMutation({
    mutationFn: ({ checklistId, content }) =>
      cardDetailsApi.addChecklistItem(checklistId, content),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["card-details", cardId] }),
  });

  const toggleItem = useMutation({
    mutationFn: ({ itemId, isCompleted }) =>
      cardDetailsApi.toggleChecklistItem(itemId, isCompleted),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["card-details", cardId] }),
  });

  const [checklistTitle, setChecklistTitle] = useState("");
  const [itemDraft, setItemDraft] = useState({});

  const labelsOnCard = normalizeJoin(details?.labels).map((l) => l.id);
  const membersOnCard = normalizeJoin(details?.members).map((m) => m.id);

  if (!cardId) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel" onMouseDown={(e) => e.stopPropagation()}>
        {isLoading && <p className="muted">Loading…</p>}

        {!isLoading && details && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{ flex: 1 }}>Card</h3>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="modal-section">
              <label>Title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => saveCore.mutate()}
              />
            </div>

            <div className="modal-section">
              <label>Description</label>
              <textarea
                className="input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => saveCore.mutate()}
              />
            </div>

            <div className="modal-section">
              <label>Due date</label>
              <input
                className="input"
                type="datetime-local"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                onBlur={() => saveCore.mutate()}
              />
            </div>

            <div className="modal-section">
              <label>Labels</label>
              <div className="modal-row">
                {allLabels?.map((lb) => {
                  const on = labelsOnCard.includes(lb.id);
                  return (
                    <button
                      key={lb.id}
                      type="button"
                      className="chip"
                      style={{
                        borderColor: lb.color || "#579dff",
                        background: on ? `${lb.color}33` : undefined,
                      }}
                      onClick={() =>
                        toggleLabel.mutate({ labelId: lb.id, add: !on })
                      }
                    >
                      {lb.name || "Label"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="modal-section">
              <label>Members</label>
              <div className="modal-row">
                {allMembers?.map((m) => {
                  const on = membersOnCard.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className="chip"
                      onClick={() =>
                        toggleMember.mutate({ memberId: m.id, add: !on })
                      }
                    >
                      {on ? "✓ " : ""}
                      {m.name || m.email || m.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="modal-section">
              <label>Checklists</label>
              {(details.checklists || []).map((cl) => (
                <div
                  key={cl.id}
                  style={{
                    marginBottom: 12,
                    padding: 10,
                    background: "var(--bg-list)",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                  }}
                >
                  <strong style={{ color: "var(--text-strong)" }}>
                    {cl.title}
                  </strong>
                  {(cl.checklist_items || [])
                    .slice()
                    .sort((a, b) => (a.position || 0) - (b.position || 0))
                    .map((item) => (
                      <label
                        key={item.id}
                        className="checklist-item"
                        htmlFor={`chk-${item.id}`}
                      >
                        <input
                          id={`chk-${item.id}`}
                          type="checkbox"
                          checked={!!item.is_completed}
                          onChange={(e) =>
                            toggleItem.mutate({
                              itemId: item.id,
                              isCompleted: e.target.checked,
                            })
                          }
                        />
                        {item.content}
                      </label>
                    ))}
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <input
                      className="input"
                      placeholder="New item"
                      value={itemDraft[cl.id] || ""}
                      onChange={(e) =>
                        setItemDraft((d) => ({
                          ...d,
                          [cl.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const t = (itemDraft[cl.id] || "").trim();
                          if (t) {
                            addItem.mutate({ checklistId: cl.id, content: t });
                            setItemDraft((d) => ({ ...d, [cl.id]: "" }));
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const t = (itemDraft[cl.id] || "").trim();
                        if (t) {
                          addItem.mutate({ checklistId: cl.id, content: t });
                          setItemDraft((d) => ({ ...d, [cl.id]: "" }));
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  className="input"
                  placeholder="New checklist title"
                  value={checklistTitle}
                  onChange={(e) => setChecklistTitle(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const t = checklistTitle.trim();
                    if (t) {
                      addChecklist.mutate(t);
                      setChecklistTitle("");
                    }
                  }}
                >
                  Add checklist
                </button>
              </div>
            </div>

            <div className="modal-section" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm("Delete this card?")) removeCard.mutate();
                }}
              >
                Delete card
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
