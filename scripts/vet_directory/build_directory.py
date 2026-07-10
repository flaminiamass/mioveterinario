"""Pipeline: OV2 FNOVI → vet_directory_seed.csv + vet_directory_duplicates.csv

Uso:
  py scripts/vet_directory/build_directory.py
  py scripts/vet_directory/build_directory.py --skip-download
  py scripts/vet_directory/build_directory.py --input percorso/file.ov2

Una riga è valida se ha almeno name, lat, lng, sourceType. Le righe non
valide (label vuoto, coordinate fuori dall'Italia) NON vengono scartate
silenziosamente: finiscono nel file duplicati con una reason dedicata.
"""

import argparse
import sys
import urllib.request
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from csvout import write_duplicates_csv, write_seed_csv  # noqa: E402
from dedupe import dedupe  # noqa: E402
from normalize import normalize_record, sanity_coords  # noqa: E402
from ov2 import parse_ov2  # noqa: E402

DEFAULT_URL = "https://www.fnovi.it/cantoni/StruttureVeterinarie.ov2"


def download(url: str, dest: Path) -> bytes:
    print(f"Scarico {url} ...")
    req = urllib.request.Request(url, headers={"User-Agent": "MioVeterinario-seed-pipeline/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    dest.write_bytes(data)
    print(f"Salvato {dest} ({len(data)} byte)")
    return data


def main() -> int:
    ap = argparse.ArgumentParser(description="Genera il seed CSV delle strutture veterinarie dal file OV2 FNOVI")
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--input", help="usa un file .ov2 locale invece di scaricare")
    ap.add_argument("--skip-download", action="store_true", help="riusa il file .ov2 già in outdir se presente")
    ap.add_argument("--outdir", default=str(Path(__file__).parent / "out"))
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    ov2_path = outdir / "StruttureVeterinarie.ov2"

    if args.input:
        data = Path(args.input).read_bytes()
        source_url = f"file://{Path(args.input).resolve()}"
    elif args.skip_download and ov2_path.exists():
        data = ov2_path.read_bytes()
        source_url = args.url
        print(f"Riuso {ov2_path} ({len(data)} byte)")
    else:
        data = download(args.url, ov2_path)
        source_url = args.url

    pois, counts = parse_ov2(data)
    collected_at = date.today().isoformat()

    records, invalid_rows = [], []
    for poi in pois:
        rec = normalize_record(poi, source_url, collected_at)
        if not rec["name"]:
            rec.update({"cluster_id": "", "winner_id": "", "reason": "invalid_missing_name", "distance_m": ""})
            invalid_rows.append(rec)
        elif not sanity_coords(rec["lat"], rec["lng"]):
            rec.update({"cluster_id": "", "winner_id": "", "reason": "bad_coords", "distance_m": ""})
            invalid_rows.append(rec)
        else:
            records.append(rec)

    seed, duplicates = dedupe(records)
    duplicates.extend(invalid_rows)

    seed_path = outdir / "vet_directory_seed.csv"
    dup_path = outdir / "vet_directory_duplicates.csv"
    write_seed_csv(seed, seed_path)
    write_duplicates_csv(duplicates, dup_path)

    strong = sum(1 for d in duplicates if d.get("reason") in ("strong", "exact_id"))
    probable = sum(1 for d in duplicates if d.get("reason") in ("probable_name", "phone_match"))
    with_phone = sum(1 for r in seed if r["phone"])
    with_address = sum(1 for r in seed if r["address"])
    with_city = sum(1 for r in seed if r["city"])
    with_province = sum(1 for r in seed if r["province"])
    with_website = sum(1 for r in seed if r["website"])

    print()
    print("=== REPORT PIPELINE ===")
    print(f"Record OV2 per tipo:        {dict(sorted(counts.items()))}")
    print(f"POI estratti:               {len(pois)}")
    print(f"Righe non valide:           {len(invalid_rows)} (missing_name/bad_coords)")
    print(f"Duplicati forti rimossi:    {strong}")
    print(f"Duplicati probabili flag:   {probable} (restano nel seed, da revisionare)")
    print(f"Righe seed valide:          {len(seed)}")
    print(f"  con telefono:             {with_phone}")
    print(f"  con indirizzo:            {with_address}")
    print(f"  con città:                {with_city}")
    print(f"  con provincia:            {with_province}")
    print(f"  con sito web:             {with_website}")
    print(f"File: {seed_path}")
    print(f"File: {dup_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
