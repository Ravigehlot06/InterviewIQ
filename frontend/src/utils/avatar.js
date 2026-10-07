// Purely cosmetic, client-side-only avatar preference. Not part of the
// backend data model — stored locally so no API/schema changes are needed
// for a visual feature.
const KEY = "iq_avatar";

export function getAvatar() {
  return localStorage.getItem(KEY) || "boy";
}

export function setAvatar(value) {
  localStorage.setItem(KEY, value);
}
