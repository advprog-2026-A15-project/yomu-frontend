import { parseApiErrorResponse } from "./errorHandler";

const DEFAULT_API_URL = "http://localhost:8080/api";

const normalizeApiUrl = (value) => value?.replace(/\/$/, "") || DEFAULT_API_URL;

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_BASE_URL);

export const getAuthHeaders = () => {
  const storedUser = localStorage.getItem("yomu_user");
  const baseHeaders = { "Content-Type": "application/json" };
  if (!storedUser) return baseHeaders;
  try {
    const user = JSON.parse(storedUser);
    return user.token
      ? { ...baseHeaders, Authorization: `Bearer ${user.token}` }
      : baseHeaders;
  } catch {
    return baseHeaders;
  }
};

export const readJsonOrThrow = async (response, fallbackMessage) => {
  if (response.ok) return response.json();
  const errorData = await parseApiErrorResponse(response);
  const message = errorData.message || fallbackMessage;
  const error = new Error(message);
  error.status = errorData.status;
  error.errorCode = errorData.errorCode;
  throw error;
};

export default API_URL;
