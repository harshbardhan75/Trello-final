import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardsApi, cardsApi, listsApi, metaApi } from "../api/client.js";
import ListColumn from "../components/ListColumn.jsx";
import CardModal from "../components/CardModal.jsx";

/** Prefer pointer hit targets (cards, list drop zones); fall back for list reorder. */
function boardCollisionDetection(args) {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return closestCorners(args);
}

function sortBoard(board) {
  if (!board?.lists) return board;
  const lists = board.lists
    .slice()
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((list) => ({
      ...list,
      cards: (list.cards || [])
        .slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0)),
    }));
  return { ...board, lists };
}

export default function BoardPage() {
  const { boardId } = useParams();
  const qc = useQueryClient();
  const [modalCardId, setModalCardId] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);

  const [filterTitle, setFilterTitle] = useState("");
  const [filterLabelId, setFilterLabelId] = useState("");
  const [filterMemberId, setFilterMemberId] = useState("");
  const [filterDueBefore, setFilterDueBefore] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const boardQuery = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const res = await boardsApi.get(boardId);
      return sortBoard(res.data);
    },
  });

  const { data: allLabels } = useQuery({
    queryKey: ["meta", "labels"],
    queryFn: async () => (await metaApi.labels()).data,
  });

  const { data: allMembers } = useQuery({
    queryKey: ["meta", "members"],
    queryFn: async () => (await metaApi.members()).data,
  });

  const labelMap = useMemo(() => {
    const m = new Map();
    (allLabels || []).forEach((l) => m.set(l.id, l));
    return m;
  }, [allLabels]);

  const searchQuery = useQuery({
    queryKey: [
      "card-search",
      filterTitle,
      filterLabelId,
      filterMemberId,
      filterDueBefore,
    ],
    queryFn: async () => {
      const res = await cardsApi.search({
        title: filterTitle || undefined,
        labelId: filterLabelId || undefined,
        memberId: filterMemberId || undefined,
        dueBefore: filterDueBefore
          ? new Date(filterDueBefore).toISOString()
          : undefined,
      });
      return res.data;
    },
    enabled: !!(
      filterTitle ||
      filterLabelId ||
      filterMemberId ||
      filterDueBefore
    ),
  });

  const board = boardQuery.data;
  const listIds = board?.lists?.map((l) => l.id) || [];

  const filterIdSet = useMemo(() => {
    if (
      !filterTitle &&
      !filterLabelId &&
      !filterMemberId &&
      !filterDueBefore
    ) {
      return null;
    }
    if (searchQuery.isLoading || searchQuery.isFetching) return undefined;
    const rows = searchQuery.data || [];
    return new Set(rows.map((c) => c.id));
  }, [
    filterTitle,
    filterLabelId,
    filterMemberId,
    filterDueBefore,
    searchQuery.data,
    searchQuery.isLoading,
    searchQuery.isFetching,
  ]);

  const boardCardIds = useMemo(() => {
    if (!board?.lists) return new Set();
    const s = new Set();
    board.lists.forEach((l) =>
      (l.cards || []).forEach((c) => s.add(c.id)),
    );
    return s;
  }, [board]);

  const invalidateBoard = () =>
    qc.invalidateQueries({ queryKey: ["board", boardId] });

  const reorderListsMu = useMutation({
    mutationFn: (lists) => listsApi.reorder(lists),
    onSuccess: invalidateBoard,
  });

  const moveCardMu = useMutation({
    mutationFn: (body) => cardsApi.move(body),
    onSuccess: invalidateBoard,
  });

  const createListMu = useMutation({
    mutationFn: (title) => listsApi.create(boardId, title),
    onSuccess: invalidateBoard,
  });

  const updateListMu = useMutation({
    mutationFn: ({ id, title }) => listsApi.update(id, title),
    onSuccess: invalidateBoard,
  });

  const deleteListMu = useMutation({
    mutationFn: (id) => listsApi.remove(id),
    onSuccess: invalidateBoard,
  });

  const createCardMu = useMutation({
    mutationFn: ({ listId, title }) => cardsApi.create(listId, title),
    onSuccess: invalidateBoard,
  });

  const [newListTitle, setNewListTitle] = useState("");
  const [showAddList, setShowAddList] = useState(false);

  function findListIdForCard(cardId) {
    return board?.lists?.find((l) =>
      (l.cards || []).some((c) => c.id === cardId),
    )?.id;
  }

  function destinationIndexForOver(
    activeCardId,
    destListId,
    overId,
    overIsDrop,
  ) {
    const list = board.lists.find((l) => l.id === destListId);
    if (!list) return 0;
    const without = (list.cards || []).filter((c) => c.id !== activeCardId);

    if (overIsDrop) {
      return without.length;
    }

    const idx = without.findIndex((c) => c.id === overId);
    return idx === -1 ? without.length : idx;
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over || !board) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (listIds.includes(activeId)) {
      const oldIndex = listIds.indexOf(activeId);
      const newIndex = listIds.indexOf(overId);
      if (
        oldIndex === -1 ||
        newIndex === -1 ||
        oldIndex === newIndex
      ) {
        return;
      }
      const reordered = arrayMove(board.lists, oldIndex, newIndex);
      const payload = reordered.map((l, i) => ({
        id: l.id,
        position: i + 1,
      }));
      reorderListsMu.mutate(payload);
      return;
    }

    const sourceListId = active.data.current?.listId;
    if (!sourceListId) return;

    let destListId;
    let overIsDrop = false;

    if (
      listIds.includes(overId) &&
      !listIds.includes(activeId)
    ) {
      destListId = overId;
      overIsDrop = true;
    } else if (overId.startsWith("droppable-")) {
      destListId = over.data.current?.listId;
      overIsDrop = true;
    } else {
      destListId = findListIdForCard(overId);
    }

    if (!destListId) return;

    const destIndex = destinationIndexForOver(
      activeId,
      destListId,
      overId,
      overIsDrop,
    );

    moveCardMu.mutate({
      cardId: activeId,
      sourceListId,
      destinationListId: destListId,
      destinationIndex: destIndex,
    });
  }

  function handleDragStart(event) {
    const id = String(event.active.id);
    if (listIds.includes(id)) {
      setActiveDrag({ type: "list", id });
    } else {
      const c = board?.lists
        ?.flatMap((l) => (l.cards || []).map((x) => ({ ...x, listId: l.id })))
        .find((x) => x.id === id);
      setActiveDrag({ type: "card", card: c });
    }
  }

  const listsWithFilter = useMemo(() => {
    if (!board?.lists) return [];
    if (filterIdSet === null) return board.lists;
    if (filterIdSet === undefined) return board.lists;
    return board.lists.map((list) => ({
      ...list,
      cards: (list.cards || []).map((c) => ({
        ...c,
        _dim:
          filterIdSet.size >= 0 &&
          boardCardIds.has(c.id) &&
          !filterIdSet.has(c.id),
      })),
    }));
  }, [board, filterIdSet, boardCardIds]);

  return (
    <div className="board-shell">
      <header className="app-header">
        <Link to="/">← Boards</Link>
        <h1>{board?.title || "…"}</h1>
        <span />
      </header>

      <div className="board-toolbar">
        <div>
          <h2>{board?.title}</h2>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.8rem" }}>
            Drag lists by ⋮⋮ · Drag cards anywhere · Double-click a card to open
          </p>
        </div>
        <div className="filter-bar">
          <input
            className="input"
            style={{ minWidth: 140 }}
            placeholder="Filter: card title"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
          />
          <select
            className="input"
            value={filterLabelId}
            onChange={(e) => setFilterLabelId(e.target.value)}
          >
            <option value="">Any label</option>
            {(allLabels || []).map((lb) => (
              <option key={lb.id} value={lb.id}>
                {lb.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
          >
            <option value="">Any member</option>
            {(allMembers || []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="datetime-local"
            value={filterDueBefore}
            onChange={(e) => setFilterDueBefore(e.target.value)}
            title="Due before"
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setFilterTitle("");
              setFilterLabelId("");
              setFilterMemberId("");
              setFilterDueBefore("");
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      {boardQuery.error && (
        <div className="error-banner">{boardQuery.error.message}</div>
      )}

      {boardQuery.isLoading && (
        <p className="muted" style={{ padding: 16 }}>
          Loading board…
        </p>
      )}

      {board && (
        <DndContext
          sensors={sensors}
          collisionDetection={boardCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDrag(null)}
        >
          <div className="board-canvas">
            <SortableContext
              items={listIds}
              strategy={horizontalListSortingStrategy}
            >
              {listsWithFilter.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  onSaveTitle={(id, title) =>
                    updateListMu.mutate({ id, title })
                  }
                  onDeleteList={(id) => deleteListMu.mutate(id)}
                  onAddCard={(listId, title) =>
                    createCardMu.mutate({ listId, title })
                  }
                  onOpenCard={setModalCardId}
                  labelMap={labelMap}
                />
              ))}
            </SortableContext>

            <div className="add-list-wrap" style={{ flex: "0 0 280px" }}>
              {showAddList ? (
                <div
                  className="list-column"
                  style={{ padding: 10, maxHeight: "none" }}
                >
                  <input
                    className="input"
                    placeholder="List title"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const t = newListTitle.trim();
                        if (t) {
                          createListMu.mutate(t);
                          setNewListTitle("");
                          setShowAddList(false);
                        }
                      }}
                    >
                      Add list
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setShowAddList(false);
                        setNewListTitle("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ width: "100%", padding: 12 }}
                  onClick={() => setShowAddList(true)}
                >
                  + Add another list
                </button>
              )}
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDrag?.type === "card" && activeDrag.card && (
              <div className="card-tile" style={{ width: 260, opacity: 0.95 }}>
                <div className="card-title-text">{activeDrag.card.title}</div>
              </div>
            )}
            {activeDrag?.type === "list" && (
              <div
                className="list-column"
                style={{ width: 280, opacity: 0.95, maxHeight: 120 }}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {modalCardId && (
        <CardModal
          cardId={modalCardId}
          boardId={boardId}
          onClose={() => setModalCardId(null)}
        />
      )}
    </div>
  );
}
