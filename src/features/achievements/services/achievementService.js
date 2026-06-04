import { API_URL } from "../../../api/axios";

const ACHIEVEMENTS_API_URL = `${API_URL}/achievements`;

const getAuthHeaders = () => {
  const storedUser = localStorage.getItem("yomu_user");
  const baseHeaders = {
    "Content-Type": "application/json",
};

const readJsonOrThrow = async (response, fallbackMessage) => {
  if (response.ok) {
    return response.json();
  }

  const errorData = await response.json().catch(() => null);
  throw new Error(errorData?.message || fallbackMessage);
};

export const achievementService = {
  listAchievements: async (userId) => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}?userId=${encodeURIComponent(userId)}`,
      {
        headers: getAuthHeaders(),
      },
    );

    return readJsonOrThrow(response, "Gagal memuat achievement.");
  },

  listCompletedAchievements: async (userId) => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}/users/${encodeURIComponent(userId)}/completed`,
      {
        headers: getAuthHeaders(),
      },
    );

    return readJsonOrThrow(response, "Gagal memuat achievement pelajar.");
  },

  listDailyMissions: async (userId) => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}/daily-missions/active?userId=${encodeURIComponent(userId)}`,
      {
        headers: getAuthHeaders(),
      },
    );

    return readJsonOrThrow(response, "Gagal memuat daily mission.");
  },

  claimDailyMissionReward: async (missionId, userId) => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}/daily-missions/${encodeURIComponent(missionId)}/claim?userId=${encodeURIComponent(userId)}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
    );

    return readJsonOrThrow(response, "Gagal klaim reward.");
  },

  createAchievement: async (payload) => {
    const response = await fetch(`${ACHIEVEMENTS_API_URL}/admin`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return readJsonOrThrow(response, "Gagal membuat achievement.");
  },

  pinAchievement: async (achievementId, userId, pin) => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}/${encodeURIComponent(achievementId)}/pin?userId=${encodeURIComponent(userId)}&pin=${pin}`,
      { method: "PUT", headers: getAuthHeaders() },
    );
    if (response.ok) return true;
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal pin achievement.");
  },

  getTotalClaimedPoints: async (userId) => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}/total-points?userId=${encodeURIComponent(userId)}`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (response.ok) return response.json();
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal memuat total poin.");
  },

  createDailyMission: async (payload) => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}/admin/daily-missions`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );

    return readJsonOrThrow(response, "Gagal membuat daily mission.");
  },

  listAdminDailyMissions: async () => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}/admin/daily-missions`,
      {
        headers: getAuthHeaders(),
      },
    );

    return readJsonOrThrow(response, "Gagal memuat daftar daily mission.");
  },

  updateDailyMission: async (missionId, payload) => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}/admin/daily-missions/${encodeURIComponent(missionId)}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );

    return readJsonOrThrow(response, "Gagal mengubah daily mission.");
  },

  deleteDailyMission: async (missionId) => {
    const response = await fetch(
      `${ACHIEVEMENTS_API_URL}/admin/daily-missions/${encodeURIComponent(missionId)}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
    );

    if (response.ok) return true;
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menghapus daily mission.");
  },
};
