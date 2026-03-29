/** Backend base URL (Express). Set VITE_API_URL in .env for production. */
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `${res.status} ${res.statusText}`);
  }
  return json;
}

export const boardsApi = {
  list: () => request("/boards"),
  search: (title) =>
    request(`/boards/search${title ? `?title=${encodeURIComponent(title)}` : ""}`),
  get: (id) => request(`/boards/${id}`),
  create: (title) =>
    request("/boards", { method: "POST", body: JSON.stringify({ title }) }),
};

export const listsApi = {
  create: (boardId, title) =>
    request("/lists", {
      method: "POST",
      body: JSON.stringify({ boardId, title }),
    }),
  update: (id, title) =>
    request(`/lists/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),
  remove: (id) => request(`/lists/${id}`, { method: "DELETE" }),
  reorder: (lists) =>
    request("/lists/reorder", {
      method: "PATCH",
      body: JSON.stringify({ lists }),
    }),
};

export const cardsApi = {
  create: (listId, title) =>
    request("/cards", {
      method: "POST",
      body: JSON.stringify({ listId, title }),
    }),
  update: (id, body) =>
    request(`/cards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id) => request(`/cards/${id}`, { method: "DELETE" }),
  move: (body) =>
    request("/cards/move", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  search: (params) => {
    const q = new URLSearchParams();
    if (params.title) q.set("title", params.title);
    if (params.labelId) q.set("labelId", params.labelId);
    if (params.memberId) q.set("memberId", params.memberId);
    if (params.dueBefore) q.set("dueBefore", params.dueBefore);
    const s = q.toString();
    return request(`/cards/search${s ? `?${s}` : ""}`);
  },
};

export const cardDetailsApi = {
  get: (id) => request(`/card-details/${id}`),
  addLabel: (cardId, labelId) =>
    request("/card-details/labels/add", {
      method: "POST",
      body: JSON.stringify({ cardId, labelId }),
    }),
  removeLabel: (cardId, labelId) =>
    request("/card-details/labels/remove", {
      method: "DELETE",
      body: JSON.stringify({ cardId, labelId }),
    }),
  addMember: (cardId, memberId) =>
    request("/card-details/members/add", {
      method: "POST",
      body: JSON.stringify({ cardId, memberId }),
    }),
  removeMember: (cardId, memberId) =>
    request("/card-details/members/remove", {
      method: "DELETE",
      body: JSON.stringify({ cardId, memberId }),
    }),
  createChecklist: (cardId, title) =>
    request("/card-details/checklists", {
      method: "POST",
      body: JSON.stringify({ cardId, title }),
    }),
  addChecklistItem: (checklistId, content) =>
    request("/card-details/checklists/items", {
      method: "POST",
      body: JSON.stringify({ checklistId, content }),
    }),
  toggleChecklistItem: (itemId, isCompleted) =>
    request("/card-details/checklists/items/toggle", {
      method: "PATCH",
      body: JSON.stringify({ itemId, isCompleted }),
    }),
};

export const metaApi = {
  labels: () => request("/meta/labels"),
  members: () => request("/meta/members"),
};
