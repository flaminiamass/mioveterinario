"""Scrittura dei CSV di output (utf-8 senza BOM, newline unix-safe)."""

import csv
from pathlib import Path

COLUMNS = [
    "id", "entityType", "name", "clinicName", "vetName", "address", "city",
    "province", "phone", "website", "lat", "lng", "services", "species",
    "specialties", "sourceType", "sourceUrl", "sourceCollectedAt",
    "lastVerifiedAt", "profileStatus", "verificationStatus",
    "onlineBookingStatus", "isPublished", "marketingConsent",
    "outreachStatus", "internalNotes", "rawLabel",
]

DUP_COLUMNS = ["cluster_id", "winner_id", "reason", "distance_m"] + COLUMNS


def _clean(row: dict, columns: list[str]) -> dict:
    out = {}
    for col in columns:
        v = row.get(col, "")
        if col in ("lat", "lng") and isinstance(v, float):
            v = f"{v:.5f}"
        out[col] = v
    return out


def write_seed_csv(rows: list[dict], path: Path) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        for row in rows:
            w.writerow(_clean(row, COLUMNS))


def write_duplicates_csv(rows: list[dict], path: Path) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=DUP_COLUMNS)
        w.writeheader()
        for row in rows:
            w.writerow(_clean(row, DUP_COLUMNS))
