import { useState } from "react";
import { colors, radius } from "../../styles/tokens.js";
import { initialsFromName, isImageSrc } from "../../utils/avatar.js";

export default function AvatarImage({ src, emoji, name, size = 48, rounded = "circle", style }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = !failed && isImageSrc(src) ? src : null;
  const displayEmoji = !imageSrc && (emoji || (!isImageSrc(src) ? src : ""));
  const borderRadius = rounded === "circle" ? radius.circle : radius.lg;

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={name || "Avatar"}
        onError={() => setFailed(true)}
        style={{
          width: size,
          height: size,
          borderRadius,
          objectFit: "cover",
          display: "block",
          background: colors.bgLighter,
          ...style,
        }}
      />
    );
  }

  return (
    <div
      aria-label={name ? `Avatar ${name}` : "Avatar"}
      style={{
        width: size,
        height: size,
        borderRadius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bgTealSel,
        color: colors.teal,
        fontWeight: 900,
        fontSize: displayEmoji ? size * 0.54 : size * 0.32,
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      {displayEmoji || initialsFromName(name)}
    </div>
  );
}
