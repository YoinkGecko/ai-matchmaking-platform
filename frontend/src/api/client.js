import { getToken } from "../utils/storage";

const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      body?.message ||
      (body?.errors && Object.values(body.errors).join(", ")) ||
      `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export const api = {
  health: () => request("/health"),

  requestOtp: (email, role) =>
    request("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),

  verifyOtp: (email, otp, role) =>
    request("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, role }),
    }),

  me: () => request("/api/auth/me"),

  createClient: (data) =>
    request("/api/clients", { method: "POST", body: JSON.stringify(data) }),

  getClient: (id) => request(`/api/clients/${id}`),

  getMyClientProfile: () => request("/api/clients/me/profile"),

  updateMyClientProfile: (data) =>
    request("/api/clients/me/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  createSupplier: (data) =>
    request("/api/suppliers", { method: "POST", body: JSON.stringify(data) }),

  getSupplier: (id) => request(`/api/suppliers/${id}`),

  getMySupplierProfile: () => request("/api/suppliers/me/profile"),

  updateMySupplierProfile: (data) =>
    request("/api/suppliers/me/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getRequirements: (clientId) =>
    request(`/api/clients/${clientId}/requirements`),

  getMarketplaceOfferings: () => request("/api/marketplace/offerings"),

  getMyClientChats: () => request("/api/chats/clients/me/chats"),
  getMySupplierChats: () => request("/api/chats/suppliers/me/chats"),
  getOfferingChat: (offeringId) => request(`/api/chats/offerings/${offeringId}`),
  sendOfferingChatMessage: (offeringId, message) =>
    request(`/api/chats/offerings/${offeringId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  getChatConversation: (conversationId) =>
    request(`/api/chats/conversations/${conversationId}`),
  sendChatMessage: (conversationId, message) =>
    request(`/api/chats/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  createRequirement: (clientId, data) =>
    request(`/api/clients/${clientId}/requirements`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getOfferings: (supplierId) =>
    request(`/api/suppliers/${supplierId}/offerings`),

  createOffering: (supplierId, data, photoFiles = []) => {
    const hasPhotos = photoFiles && photoFiles.length > 0;
    if (!hasPhotos) {
      return request(`/api/suppliers/${supplierId}/offerings`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    }

    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        form.append(key, String(value));
      }
    });
    photoFiles.forEach((file) => form.append("photos", file));

    return request(`/api/suppliers/${supplierId}/offerings`, {
      method: "POST",
      body: form,
    });
  },

  getMatches: (requirementId) =>
    request(`/api/requirements/${requirementId}/matches`),

  getMatchDetail: (requirementId, matchId) =>
    request(`/api/requirements/${requirementId}/matches/${matchId}`),

  runMatching: (requirementId) =>
    request(`/api/requirements/${requirementId}/match`, { method: "POST" }),

  getSupplierMatches: (supplierId) =>
    request(`/api/suppliers/${supplierId}/matches`),

  placeOrder: (requirementId, matchId, data) =>
    request(`/api/requirements/${requirementId}/matches/${matchId}/orders`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyClientOrders: () => request("/api/clients/me/orders"),

  getMySupplierOrders: () => request("/api/suppliers/me/orders"),

  respondToSupplierOrder: (orderId, data) =>
    request(`/api/suppliers/me/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  adminOverview: () => request("/api/admin/overview"),
  adminUsers: () => request("/api/admin/users"),
  adminClients: () => request("/api/admin/clients"),
  adminSuppliers: () => request("/api/admin/suppliers"),
  adminRequirements: () => request("/api/admin/requirements"),
  adminOfferings: () => request("/api/admin/offerings"),
  adminMatches: () => request("/api/admin/matches"),
  adminOrders: () => request("/api/admin/orders"),
};
