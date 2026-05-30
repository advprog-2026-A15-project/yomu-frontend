/**
 * authService.js
 *
 * Implementation of Auth Service connecting to the Spring Boot backend.
 */

import { API_URL } from "../../../api/axios";

const getAuthHeaders = () => {
  const userStr = localStorage.getItem("yomu_user");
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      };
    }
  }
  return {
    "Content-Type": "application/json",
  };
};

export const authService = {
  refreshSession: async (refreshToken) => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Sesi login sudah berakhir.");
    }

    const data = await response.json();
    return {
      token: data.token,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      ...data.user,
    };
  },

  login: async (identifier, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Gagal login. Periksa username dan password.",
        );
      }

      const data = await response.json();
      return {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        ...data.user,
      };
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(
          "Gagal menghubungi server. Pastikan API gateway (`http://localhost:8090`) atau backend service berjalan.",
        );
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            "Pendaftaran gagal. Pastikan data valid atau email/username belum terpakai.",
        );
      }

      const data = await response.json();
      return {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        ...data.user,
      };
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(
          "Gagal menghubungi server. Pastikan API gateway atau backend service berjalan.",
        );
      }
      throw err;
    }
  },

  updateProfile: async (updateData) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal memperbarui profil.");
      }

      const data = await response.json();
      return {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        ...data.user,
      };
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(
          "Gagal menghubungi server. Pastikan API gateway atau backend service berjalan.",
        );
      }
      throw err;
    }
  },

  deleteAccount: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal menghapus akun.");
      }

      return true;
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(
          "Gagal menghubungi server. Pastikan API gateway atau backend service berjalan.",
        );
      }
      throw err;
    }
  },

  googleLogin: async (accessToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        let errorMessage = "Gagal login dengan Google.";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Fallback to default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        ...data.user,
      };
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(
          "Gagal menghubungi server. Pastikan API gateway atau backend service berjalan.",
        );
      }
      throw err;
    }
  },
};
