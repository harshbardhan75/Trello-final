import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "../api/client.js";

export default function BoardsHome() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["boards", q],
    queryFn: async () => {
      const res = q.trim()
        ? await boardsApi.search(q.trim())
        : await boardsApi.list();
      return res.data;
    },
  });

  const create = useMutation({
    mutationFn: () => boardsApi.create(title.trim() || "New board"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      setTitle("");
    },
  });

  return (
    <div>
      <header className="app-header">
        <h1>Boards</h1>
        <span className="muted">Trello-style (demo user)</span>
      </header>

      <div style={{ padding: "16px 24px", maxWidth: 720 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Search boards by title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="New board title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && title.trim() && create.mutate()}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!title.trim() || create.isPending}
            onClick={() => title.trim() && create.mutate()}
          >
            Create
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error.message} — is the API running at the configured URL?
        </div>
      )}

      {isLoading && <p className="muted" style={{ padding: "0 24px" }}>Loading…</p>}

      <div className="boards-grid">
        {data?.map((b) => (
          <Link key={b.id} className="board-tile" to={`/board/${b.id}`}>
            {b.title}
          </Link>
        ))}
      </div>

      {!isLoading && data?.length === 0 && (
        <p className="muted" style={{ padding: "0 24px" }}>
          No boards yet. Create one above.
        </p>
      )}
    </div>
  );
}
