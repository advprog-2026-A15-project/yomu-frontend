import { API_URL, getAuthHeaders, readJsonOrThrow } from "../../../api/axios";

const LEARNING_API_URL = `${API_URL}/learning`;

const validateId = (id) => {
  const strId = String(id);
  if (!/^[a-zA-Z0-9-_]+$/.test(strId)) {
    throw new Error('Invalid format');
  }
  return strId;
};

export const learningService = {
  listBacaan: async (category, search) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${LEARNING_API_URL}/bacaan${query}`, { headers: getAuthHeaders() });
    return readJsonOrThrow(res, "Gagal memuat daftar bacaan.");
  },

  getBacaan: async (id) => {
    const res = await fetch(`${LEARNING_API_URL}/bacaan/${validateId(id)}`, {
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
    const res = await fetch(`${LEARNING_API_URL}/bacaan/${validateId(id)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJsonOrThrow(res, "Gagal mengupdate bacaan.");
  },

  deleteBacaan: async (id) => {
    const res = await fetch(`${LEARNING_API_URL}/bacaan/${validateId(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal menghapus bacaan.");
    return true;
  },

  getQuestions: async (bacaanId) => {
    const res = await fetch(
      `${LEARNING_API_URL}/bacaan/${validateId(bacaanId)}/questions`,
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
    const res = await fetch(`${LEARNING_API_URL}/questions/${validateId(questionId)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal menghapus soal.");
    return true;
  },

  submitQuiz: async (bacaanId, data) => {
    const res = await fetch(`${LEARNING_API_URL}/bacaan/${validateId(bacaanId)}/quiz`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJsonOrThrow(res, "Gagal mengirim jawaban kuis.");
  },

  checkQuizStatus: async (bacaanId, userId) => {
    const res = await fetch(
      `${LEARNING_API_URL}/bacaan/${validateId(bacaanId)}/quiz/status?userId=${validateId(userId)}`,
      { headers: getAuthHeaders() },
    );
    return readJsonOrThrow(res, "Gagal mengecek status kuis.");
  },
};
