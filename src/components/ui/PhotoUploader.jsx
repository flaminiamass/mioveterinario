import { useRef, useState } from "react";
import { colors, fontSize, radius } from "../../styles/tokens.js";
import Btn from "./Btn.jsx";
import AvatarImage from "./AvatarImage.jsx";

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function compressImage(file, maxSize = 512, quality = 0.82) {
  const img = await loadImage(file);
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function PhotoUploader({ value, emoji, name, onChange, onRemove, rounded = "circle", size = 82 }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const hasPhoto = typeof value === "string" && value.startsWith("data:image/");

  const pickFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Seleziona un file immagine.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Immagine troppo grande: massimo 2 MB prima della compressione.");
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch {
      setError("Non sono riuscito a leggere l'immagine.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <AvatarImage src={value} emoji={emoji} name={name} size={size} rounded={rounded} />
      <div style={{ display: "grid", gap: 6, flex: 1 }}>
        <input ref={inputRef} type="file" accept="image/*" onChange={pickFile} style={{ display: "none" }} />
        <Btn small variant="light" type="button" onClick={() => inputRef.current?.click()}>
          {hasPhoto ? "Cambia foto" : "Carica foto"}
        </Btn>
        {(hasPhoto || value) && (
          <Btn small variant="ghost" type="button" onClick={onRemove || (() => onChange(""))}>
            Rimuovi foto
          </Btn>
        )}
        {error && (
          <div
            style={{
              color: colors.dangerFg,
              fontSize: fontSize.sm,
              background: colors.dangerBg,
              padding: 8,
              borderRadius: radius.sm,
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
