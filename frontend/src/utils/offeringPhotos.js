import { pick } from "./format";

const API_BASE = import.meta.env.VITE_API_URL || "";

export function resolveUploadUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getOfferingPhotoUrls(record) {
  const raw =
    pick(record, "offeringPhotoUrls", "offering_photo_urls") ??
    pick(record, "photoUrls", "photo_urls");

  if (!raw) return [];

  let list = raw;
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(list)) return [];

  return list.map(resolveUploadUrl).filter(Boolean);
}
