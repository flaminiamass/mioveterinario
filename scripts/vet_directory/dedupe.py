"""Deduplica dei record normalizzati.

- Duplicato FORTE (stesso name_core + distanza <= 25 m): il perdente esce
  dal seed e finisce nel file duplicati con reason="strong".
- Duplicato PROBABILE (nome simile + <= 100 m, oppure stesso telefono):
  entrambi restano nel seed; la coppia viene loggata nel file duplicati
  per revisione umana e il perdente riceve una nota in internalNotes.
Niente viene cancellato automaticamente se ambiguo.
"""

import math
from difflib import SequenceMatcher

STRONG_DIST_M = 25.0
PROBABLE_DIST_M = 100.0
NAME_SIMILARITY = 0.85


def haversine_m(lat1, lng1, lat2, lng2) -> float:
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _wins(a: dict, b: dict) -> bool:
    """True se a vince su b: ha telefono > label più lunga > id minore."""
    if bool(a["phone"]) != bool(b["phone"]):
        return bool(a["phone"])
    if len(a["rawLabel"]) != len(b["rawLabel"]):
        return len(a["rawLabel"]) > len(b["rawLabel"])
    return a["id"] < b["id"]


def _cells(lat: float, lng: float):
    """Chiave della cella ~110 m e celle vicine 3x3."""
    clat, clng = round(lat * 1000), round(lng * 1000)
    for dlat in (-1, 0, 1):
        for dlng in (-1, 0, 1):
            yield (clat + dlat, clng + dlng)


def _dup_row(record: dict, winner_id: str, reason: str, distance_m: float) -> dict:
    row = dict(record)
    row["cluster_id"] = winner_id
    row["winner_id"] = winner_id
    row["reason"] = reason
    row["distance_m"] = f"{distance_m:.1f}"
    return row


def dedupe(records: list[dict]) -> tuple[list[dict], list[dict]]:
    """Ritorna (seed_rows, duplicate_rows)."""
    removed: set[str] = set()
    duplicates: list[dict] = []
    flagged_pairs: set[tuple[str, str]] = set()

    # Collassa prima gli id identici (stesso name_core + stesse coordinate):
    # sono copie esatte nel file sorgente, tenerne due romperebbe l'upsert per id.
    by_id: dict[str, dict] = {}
    for rec in records:
        prev = by_id.get(rec["id"])
        if prev is None:
            by_id[rec["id"]] = rec
        else:
            winner, loser = (prev, rec) if _wins(prev, rec) else (rec, prev)
            by_id[rec["id"]] = winner
            duplicates.append(_dup_row(loser, winner["id"], "exact_id", 0.0))
    records = list(by_id.values())

    grid: dict[tuple[int, int], list[dict]] = {}
    for rec in records:
        grid.setdefault((round(rec["lat"] * 1000), round(rec["lng"] * 1000)), []).append(rec)

    by_phone: dict[str, list[dict]] = {}
    for rec in records:
        if rec["phone"]:
            by_phone.setdefault(rec["phone"], []).append(rec)

    def flag_pair(a: dict, b: dict, reason: str, dist: float):
        winner, loser = (a, b) if _wins(a, b) else (b, a)
        key = tuple(sorted((a["id"], b["id"])))
        if key in flagged_pairs:
            return
        flagged_pairs.add(key)
        if reason == "strong":
            removed.add(loser["id"])
            duplicates.append(_dup_row(loser, winner["id"], "strong", dist))
        else:
            note = f"possibile duplicato di {winner['id']}"
            loser["internalNotes"] = (
                f"{loser['internalNotes']}; {note}" if loser["internalNotes"] else note
            )
            duplicates.append(_dup_row(loser, winner["id"], reason, dist))

    # Confronto spaziale (celle 3x3)
    seen_ids: set[str] = set()
    for rec in records:
        if rec["id"] in seen_ids:
            continue
        seen_ids.add(rec["id"])
        for cell in _cells(rec["lat"], rec["lng"]):
            for other in grid.get(cell, []):
                if other["id"] <= rec["id"] or other is rec:
                    continue
                dist = haversine_m(rec["lat"], rec["lng"], other["lat"], other["lng"])
                if dist > PROBABLE_DIST_M:
                    continue
                same_core = rec["_name_core"] == other["_name_core"] and rec["_name_core"]
                if same_core and dist <= STRONG_DIST_M:
                    flag_pair(rec, other, "strong", dist)
                    continue
                if rec["_name_core"] and other["_name_core"]:
                    ratio = SequenceMatcher(None, rec["_name_core"], other["_name_core"]).ratio()
                    if ratio >= NAME_SIMILARITY:
                        flag_pair(rec, other, "probable_name", dist)

    # Telefoni identici (indipendente dalla distanza)
    for phone_records in by_phone.values():
        if len(phone_records) < 2:
            continue
        base = phone_records[0]
        for other in phone_records[1:]:
            dist = haversine_m(base["lat"], base["lng"], other["lat"], other["lng"])
            flag_pair(base, other, "phone_match", dist)

    seed = [r for r in records if r["id"] not in removed]
    return seed, duplicates
