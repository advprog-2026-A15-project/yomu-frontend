import { API_URL, getAuthHeaders, readJsonOrThrow } from "../../../api/axios";

const CLAN_API_URL = `${API_URL}/clan`;

const validateId = (id) => {
  const strId = String(id);
  if (!/^[a-zA-Z0-9-_]+$/.test(strId)) {
    throw new Error('Invalid format');
  }
  return strId;
};

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
    const safeId = validateId(id);
    const res = await fetch(`${CLAN_API_URL}/${safeId}`, {
      headers: getAuthHeaders(),
    });
    return readJsonOrThrow(res, "Gagal memuat clan.");
  },

  getLeaderboard: async (tier) => {
    let url = `${CLAN_API_URL}/leaderboard`;
    if (tier) {
      const safeTier = validateId(tier);
      url += `?tier=${safeTier}`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    return readJsonOrThrow(res, "Gagal memuat leaderboard.");
  },

  joinClan: async (clanId, userId) => {
    const safeClanId = validateId(clanId);
    const safeUserId = validateId(userId);
    const res = await fetch(`${CLAN_API_URL}/${safeClanId}/join?userId=${safeUserId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) await readJsonOrThrow(res, "Gagal bergabung clan.");
    return true;
  },

  getMembers: async (clanId) => {
    const safeClanId = validateId(clanId);
    const res = await fetch(`${CLAN_API_URL}/${safeClanId}/members`, {
      headers: getAuthHeaders(),
    });
    return readJsonOrThrow(res, "Gagal memuat anggota.");
  },

  getMembership: async (userId) => {
    const safeUserId = validateId(userId);
    const res = await fetch(`${CLAN_API_URL}/me?userId=${safeUserId}`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 204) return null;
    return readJsonOrThrow(res, "Gagal memuat status keanggotaan.");
  },

  getPendingMembers: async (clanId) => {
    const safeClanId = validateId(clanId);
    const res = await fetch(`${CLAN_API_URL}/${safeClanId}/members/pending`, {
      headers: getAuthHeaders(),
    });
    return readJsonOrThrow(res, "Gagal memuat anggota pending.");
  },

  acceptMember: async (clanId, memberId) => {
    const safeClanId = validateId(clanId);
    const safeMemberId = validateId(memberId);
    const res = await fetch(`${CLAN_API_URL}/${safeClanId}/members/${safeMemberId}/accept`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) await readJsonOrThrow(res, "Gagal menerima anggota.");
    return true;
  },

  rejectMember: async (clanId, memberId) => {
    const safeClanId = validateId(clanId);
    const safeMemberId = validateId(memberId);
    const res = await fetch(`${CLAN_API_URL}/${safeClanId}/members/${safeMemberId}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) await readJsonOrThrow(res, "Gagal menolak anggota.");
    return true;
  },

  deleteClan: async (clanId) => {
    const safeClanId = validateId(clanId);
    const res = await fetch(`${CLAN_API_URL}/${safeClanId}`, {
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
