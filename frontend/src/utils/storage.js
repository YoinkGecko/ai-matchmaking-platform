const TOKEN_KEY = "wm_token";
const USER_KEY = "wm_user";
const PROFILE_PREFIX = "wm_profile";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function profileKey(role, email) {
  return `${PROFILE_PREFIX}_${role}_${email.toLowerCase()}`;
}

export function setProfileId(role, email, profileId) {
  localStorage.setItem(profileKey(role, email), profileId);
}

export function getProfileId(role, email) {
  return localStorage.getItem(profileKey(role, email));
}

export function clearProfileId(role, email) {
  localStorage.removeItem(profileKey(role, email));
}
