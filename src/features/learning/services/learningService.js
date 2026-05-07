import { API_URL, getAuthHeaders, readJsonOrThrow } from "../../../api/axios";

const LEARNING_API_URL = `${API_URL}/learning`;

export const learningService = {
  listBacaan: async (category) => {
    const url = category
      ? `${LEARNING_API_URL}/bacaan?category=${encodeURIComponent(category)}`
      : `${LEARNING_API_URL}/bacaan`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return readJsonOrThrow(res, "Gagal memuat daftar bacaan.");
  },

  getBacaan: async (id) => {
    const res = await fetch(`${LEARNING_API_URL}/bacaan/${id}`, {
      headers: getAuthHeaders(),
    });
    return readJsonOrThrow(res, "Gagal memuat bacaan.");
  },

  createBacaan: async (data) => {
    const res = await fetch(`${LEARNING_API_URL}/bacaan`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJsonOrThrow(res, "Gagal membuat bacaan.");
  },

  updateBacaan: async (id, data) => {
    const res = await fetch(`${LEARNING_API_URL}/bacaan/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJsonOrThrow(res, "Gagal mengupdate bacaan.");
  },

  deleteBacaan: async (id) => {
    const res = await fetch(`${LEARNING_API_URL}/bacaan/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal menghapus bacaan.");
    return true;
  },

  getQuestions: async (bacaanId) => {
    const res = await fetch(
      `${LEARNING_API_URL}/bacaan/${bacaanId}/questions`,
      {
        headers: getAuthHeaders(),
      },
    );
    return readJsonOrThrow(res, "Gagal memuat soal.");
  },

  addQuestion: async (data) => {
    const res = await fetch(`${LEARNING_API_URL}/questions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJsonOrThrow(res, "Gagal menambah soal.");
  },

  deleteQuestion: async (questionId) => {
    const res = await fetch(`${LEARNING_API_URL}/questions/${questionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal menghapus soal.");
    return true;
  },

  submitQuiz: async (bacaanId, data) => {
    const res = await fetch(`${LEARNING_API_URL}/bacaan/${bacaanId}/quiz`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJsonOrThrow(res, "Gagal mengirim jawaban kuis.");
  },

  checkQuizStatus: async (bacaanId, userId) => {
    const res = await fetch(
      `${LEARNING_API_URL}/bacaan/${bacaanId}/quiz/status?userId=${userId}`,
      { headers: getAuthHeaders() },
    );
    return readJsonOrThrow(res, "Gagal mengecek status kuis.");
  },
};
