import { API_URL, getAuthHeaders, readJsonOrThrow } from "../../../api/axios";

const FORUM_API_URL = `${API_URL}/forum/comments`;

export const forumService = {
  getComments: async (bacaanId) => {
    const url = bacaanId
      ? `${FORUM_API_URL}?bacaanId=${bacaanId}`
      : FORUM_API_URL;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return readJsonOrThrow(res, "Gagal memuat komentar.");
  },

  getCommentsTree: async (bacaanId) => {
    const url = bacaanId
      ? `${FORUM_API_URL}/tree?bacaanId=${bacaanId}`
      : `${FORUM_API_URL}/tree`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return readJsonOrThrow(res, "Gagal memuat diskusi.");
  },

  createComment: async (data) => {
    const res = await fetch(FORUM_API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJsonOrThrow(res, "Gagal mengirim komentar.");
  },

  updateComment: async (commentId, content) => {
    const res = await fetch(`${FORUM_API_URL}/${commentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ commentContent: content }),
    });
    return readJsonOrThrow(res, "Gagal mengedit komentar.");
  },

  deleteComment: async (commentId) => {
    const res = await fetch(`${FORUM_API_URL}/${commentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return readJsonOrThrow(res, "Gagal menghapus komentar.");
  },
};
