import { API_URL, getAuthHeaders, readJsonOrThrow } from "../../../api/axios";

const CLAN_API_URL = `${API_URL}/clan`;

export const clanService = {
  createClan: async (data) => {
    const res = await fetch(CLAN_API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return readJsonOrThrow(res, "Gagal membuat clan.");
  },

  getClan: async (id) => {
    const res = await fetch(`${CLAN_API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return readJsonOrThrow(res, "Gagal memuat clan.");
  },

  getLeaderboard: async (tier) => {
    const url = tier
      ? `${CLAN_API_URL}/leaderboard?tier=${tier}`
      : `${CLAN_API_URL}/leaderboard`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return readJsonOrThrow(res, "Gagal memuat leaderboard.");
  },

  joinClan: async (clanId, userId) => {
    const res = await fetch(`${CLAN_API_URL}/${clanId}/join?userId=${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal bergabung clan.");
    return true;
  },

  getMembers: async (clanId) => {
    const res = await fetch(`${CLAN_API_URL}/${clanId}/members`, {
      headers: getAuthHeaders(),
    });
    return readJsonOrThrow(res, "Gagal memuat anggota.");
  },

  endSeason: async () => {
    const res = await fetch(`${CLAN_API_URL}/admin/end-season`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal memproses end of season.");
    return true;
  },
};
