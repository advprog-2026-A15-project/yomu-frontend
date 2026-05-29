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
    if (!res.ok) await readJsonOrThrow(res, "Gagal bergabung clan.");
    return true;
  },

  getMembers: async (clanId) => {
    const res = await fetch(`${CLAN_API_URL}/${clanId}/members`, {
      headers: getAuthHeaders(),
    });
    return readJsonOrThrow(res, "Gagal memuat anggota.");
  },

  getMembership: async (userId) => {
    const res = await fetch(`${CLAN_API_URL}/me?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 204) return null;
    return readJsonOrThrow(res, "Gagal memuat status keanggotaan.");
  },

  getPendingMembers: async (clanId) => {
    const res = await fetch(`${CLAN_API_URL}/${clanId}/members/pending`, {
      headers: getAuthHeaders(),
    });
    return readJsonOrThrow(res, "Gagal memuat anggota pending.");
  },

  acceptMember: async (clanId, memberId) => {
    const res = await fetch(`${CLAN_API_URL}/${clanId}/members/${memberId}/accept`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) await readJsonOrThrow(res, "Gagal menerima anggota.");
    return true;
  },

  rejectMember: async (clanId, memberId) => {
    const res = await fetch(`${CLAN_API_URL}/${clanId}/members/${memberId}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) await readJsonOrThrow(res, "Gagal menolak anggota.");
    return true;
  },

  deleteClan: async (clanId) => {
    const res = await fetch(`${CLAN_API_URL}/${clanId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) await readJsonOrThrow(res, "Gagal menghapus clan.");
    return true;
  },

  leaveClan: async () => {
    const res = await fetch(`${CLAN_API_URL}/me`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) await readJsonOrThrow(res, "Gagal keluar dari clan.");
    return true;
  },

  endSeason: async () => {
    const res = await fetch(`${CLAN_API_URL}/admin/end-season`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal memproses end of season.");
    return true;
  },

  recalculateTiers: async () => {
    const res = await fetch(`${CLAN_API_URL}/admin/recalculate-tiers`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal recalculate tier.");
    return true;
  },
};
