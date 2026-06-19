export function isImageSrc(value) {
  return typeof value === "string" && (value.startsWith("data:image/") || /^https?:\/\//i.test(value));
}

export function initialsFromName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
