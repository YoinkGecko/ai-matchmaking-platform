export function buildMapEmbedUrl(address) {
  const q = address?.trim();
  if (!q) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=12&output=embed`;
}

export function buildMapOpenUrl(address) {
  const q = address?.trim();
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
