/**
 * API Error handling utilities.
 * Menangani berbagai tipe error dari API response.
 */

export const handleApiError = (error) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      errorCode: "UNKNOWN_ERROR",
    };
  }

  return {
    message: "Terjadi kesalahan yang tidak diketahui",
    status: 500,
    errorCode: "UNKNOWN_ERROR",
  };
};

/**
 * Parse error response dari API gateway.
 * Expected format:
 * {
 *   message: string,
 *   errorCode: string,
 *   status: number,
 *   timestamp: number
 * }
 */
export const parseApiErrorResponse = async (response) => {
  try {
    const data = await response.json();
    if (data.message && data.errorCode) {
      return {
        message: data.message,
        errorCode: data.errorCode,
        status: data.status || response.status,
      };
    }
  } catch (e) {
    // If response is not JSON, return generic error
  }

  return {
    message: response.statusText || "Terjadi kesalahan",
    errorCode: "HTTP_ERROR",
    status: response.status,
  };
};

/**
 * Check jika error adalah authorization error (403 atau access denied).
 */
export const isAuthorizationError = (errorCode, status) => {
  return status === 403 || errorCode === "AUTHORIZATION_DENIED";
};

/**
 * Get user-friendly error message.
 */
export const getErrorMessage = (errorCode) => {
  const messages = {
    AUTHORIZATION_DENIED:
      "Anda tidak memiliki izin untuk melakukan aksi ini. Hanya Admin atau pemilik konten yang bisa melakukan perubahan.",
    NOT_FOUND: "Konten yang dicari tidak ditemukan.",
    HTTP_ERROR: "Terjadi kesalahan pada server.",
    INTERNAL_ERROR: "Terjadi kesalahan internal pada server.",
  };

  return messages[errorCode] || "Terjadi kesalahan yang tidak diketahui.";
};
