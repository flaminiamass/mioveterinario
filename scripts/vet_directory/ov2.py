"""Parser per il formato binario TomTom OV2 (file POI).

Formato record (little-endian):
- type 0 (deleted): u8 type + u32 lunghezza totale record → skip
- type 1 (skipper): 21 byte fissi (u8 + u32 + 4×s32 bounding box) → skip
- type 2 (POI semplice): u8 + u32 totale + s32 lon + s32 lat + label
  null-terminated (totale-13 byte, incluso il \\x00 finale)
- type 3 (POI esteso): come il type 2, la label è la prima stringa
  null-terminated; il resto del record viene ignorato

Le coordinate sono int(gradi * 100000).
"""

from dataclasses import dataclass


@dataclass
class Poi:
    lon: float
    lat: float
    label: str


def decode_label(raw: bytes) -> str:
    # Il file FNOVI è UTF-8 con label terminate da "\n\x00"
    raw = raw.split(b"\x00", 1)[0]
    try:
        return raw.decode("utf-8").strip()
    except UnicodeDecodeError:
        return raw.decode("cp1252", errors="replace").strip()


def parse_ov2(data: bytes) -> tuple[list[Poi], dict[int, int]]:
    """Ritorna (lista POI, conteggio record per type)."""
    pois: list[Poi] = []
    counts: dict[int, int] = {}
    i, n = 0, len(data)
    while i < n:
        rtype = data[i]
        counts[rtype] = counts.get(rtype, 0) + 1
        if rtype == 0:
            total = int.from_bytes(data[i + 1 : i + 5], "little")
            if total < 5 or i + total > n:
                raise ValueError(f"record type 0 corrotto all'offset {i} (total={total})")
            i += total
        elif rtype == 1:
            if i + 21 > n:
                raise ValueError(f"record skipper troncato all'offset {i}")
            i += 21
        elif rtype in (2, 3):
            total = int.from_bytes(data[i + 1 : i + 5], "little")
            if total < 14 or i + total > n:
                raise ValueError(f"record type {rtype} corrotto all'offset {i} (total={total})")
            lon = int.from_bytes(data[i + 5 : i + 9], "little", signed=True) / 100000.0
            lat = int.from_bytes(data[i + 9 : i + 13], "little", signed=True) / 100000.0
            label = decode_label(data[i + 13 : i + total])
            pois.append(Poi(lon=lon, lat=lat, label=label))
            i += total
        else:
            raise ValueError(f"record type sconosciuto {rtype} all'offset {i}")
    return pois, counts
