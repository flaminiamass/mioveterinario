"""Normalizzazione prudente dei POI: mai inventare dati.

Regola generale: un campo strutturato (address, city, province, phone,
website) viene valorizzato SOLO se estratto con pattern affidabili dal
label OV2. Tutto ciò che resta ambiguo finisce in internalNotes/rawLabel.
"""

import hashlib
import re
import unicodedata

SOURCE_TYPE = "anagrafe_strutture_poi"

# Bounding box Italia (include isole, esclude coordinate palesemente errate)
ITALY_LAT = (35.2, 47.2)
ITALY_LNG = (6.5, 18.7)

# Sigle province italiane valide (per validare i token "(XX)")
PROVINCES = {
    "AG", "AL", "AN", "AO", "AP", "AQ", "AR", "AT", "AV", "BA", "BG", "BI",
    "BL", "BN", "BO", "BR", "BS", "BT", "BZ", "CA", "CB", "CE", "CH", "CL",
    "CN", "CO", "CR", "CS", "CT", "CZ", "EN", "FC", "FE", "FG", "FI", "FM",
    "FR", "GE", "GO", "GR", "IM", "IS", "KR", "LC", "LE", "LI", "LO", "LT",
    "LU", "MB", "MC", "ME", "MI", "MN", "MO", "MS", "MT", "NA", "NO", "NU",
    "OR", "PA", "PC", "PD", "PE", "PG", "PI", "PN", "PO", "PR", "PT", "PU",
    "PV", "PZ", "RA", "RC", "RE", "RG", "RI", "RM", "RN", "RO", "SA", "SI",
    "SO", "SP", "SR", "SS", "SU", "SV", "TA", "TE", "TN", "TO", "TP", "TR",
    "TS", "TV", "UD", "VA", "VB", "VC", "VE", "VI", "VR", "VT", "VV",
}

# Parole che non identificano la struttura (per confronto/dedup, non per display)
_STOPWORDS = {
    "ambulatorio", "ambulatori", "clinica", "cliniche", "studio", "centro",
    "ospedale", "laboratorio", "veterinario", "veterinaria", "veterinari",
    "veterinarie", "associato", "associati", "associata", "dott", "dottssa",
    "dr", "drssa", "prof", "di", "del", "della", "dei", "delle", "e", "la",
    "il", "snc", "srl", "sas", "spa", "stp",
}

_STREET_RE = re.compile(
    r"\b(via|viale|v\.le|piazza|p\.zza|corso|c\.so|strada|str\.|largo|"
    r"vicolo|contrada|c\.da|localita|località|loc\.|frazione|fraz\.|borgo|"
    r"lungomare|circonvallazione|ss|sp)\b",
    re.IGNORECASE,
)

_PHONE_RE = re.compile(r"(?:\+39[\s./-]?)?(?:0\d{1,3}|3\d{2})[\s./-]?\d{5,8}\b")

_WEBSITE_RE = re.compile(
    r"\b(?:https?://)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+\b",
    re.IGNORECASE,
)

# Parole minuscole nel title-case italiano
_LOWER_WORDS = {"di", "del", "della", "dei", "delle", "e", "da", "in", "a", "al", "san"}


def _collapse_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def _smart_title(s: str) -> str:
    words = s.lower().split()
    out = []
    for i, w in enumerate(words):
        if i > 0 and w in _LOWER_WORDS and w != "san":
            out.append(w)
        elif len(w) == 2 and w.upper() in PROVINCES and s.isupper():
            out.append(w.upper())
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out)


def normalize_name(s: str) -> str:
    s = _collapse_ws(s)
    if not s:
        return ""
    # Il file FNOVI usa quasi sempre TUTTO MAIUSCOLO: riportiamo a title-case
    if s.isupper() or s.islower():
        s = _smart_title(s)
    return s


def normalize_city(s: str) -> str:
    s = _collapse_ws(re.sub(r"[^\w\s'.-]", " ", s))
    if not s or len(s) < 2 or any(ch.isdigit() for ch in s):
        return ""
    return _smart_title(s) if (s.isupper() or s.islower()) else s


def normalize_province(s: str) -> str:
    s = s.strip().upper()
    return s if s in PROVINCES else ""


def normalize_phone(s: str) -> str:
    digits = re.sub(r"[^\d+]", "", s)
    if digits.startswith("+39"):
        digits = digits[3:]
    elif digits.startswith("0039"):
        digits = digits[4:]
    if not re.fullmatch(r"(?:0\d{5,10}|3\d{8,9})", digits):
        return ""
    return "+39" + digits


def normalize_website(s: str) -> str:
    s = s.strip().lower().rstrip("/.,;")
    if not s:
        return ""
    if not re.match(r"https?://", s):
        s = "https://" + s
    m = re.fullmatch(r"https?://[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+(/\S*)?", s)
    return s if m else ""


def parse_possible_phone(label: str) -> str:
    m = _PHONE_RE.search(label)
    if not m:
        return ""
    return normalize_phone(m.group(0))


def parse_possible_address(label: str) -> str:
    """Estrae un indirizzo SOLO se un segmento inizia con un prefisso di via."""
    for seg in re.split(r"[,;|]| - ", label):
        seg = _collapse_ws(seg)
        m = _STREET_RE.match(seg)
        if m and m.start() == 0 and len(seg) > len(m.group(0)) + 2:
            return normalize_name(seg)
    return ""


def parse_possible_website(label: str) -> str:
    for m in _WEBSITE_RE.finditer(label):
        token = m.group(0)
        # Evita falsi positivi tipo "S.R.L." o numeri: serve un TLD alfabetico
        if re.search(r"\.[a-z]{2,}$", token, re.IGNORECASE) and "www" in token.lower():
            return normalize_website(token)
    return ""


def parse_label(label: str) -> dict:
    """Estrazione prudente di name/address/city/province/phone/website.

    Il file OV2 FNOVI ha tipicamente label come:
      "NOME STRUTTURA" oppure "NOME - INDIRIZZO - CITTA (XX)"
    Se un pezzo non matcha pattern affidabili, resta solo in rawLabel.
    """
    label = _collapse_ws(label)
    out = {"name": "", "address": "", "city": "", "province": "", "phone": "", "website": "", "notes": ""}
    if not label:
        return out

    out["phone"] = parse_possible_phone(label)
    out["website"] = parse_possible_website(label)
    out["address"] = parse_possible_address(label)

    segments = [s for s in (x.strip(" ,-;") for x in re.split(r"[,;|]| - ", label)) if s]

    # Provincia: token "(XX)" con sigla valida; la città è il testo che la precede
    prov_m = re.search(r"\(([A-Za-z]{2})\)", label)
    if prov_m and normalize_province(prov_m.group(1)):
        out["province"] = normalize_province(prov_m.group(1))
        before = label[: prov_m.start()].strip(" ,-;")
        # la città è l'ultimo segmento prima della parentesi, MA solo se il
        # label ha più segmenti: altrimenti il candidato sarebbe il nome stesso
        city_candidate = re.split(r"[,;|]| - ", before)[-1].strip(" ,-;")
        city = normalize_city(city_candidate)
        is_own_segment = len(segments) > 1 and city_candidate != segments[0]
        if city and is_own_segment and not _STREET_RE.search(city_candidate) and len(city) <= 40:
            out["city"] = city

    # Nome: primo segmento del label, ripulito; via il telefono e la "(XX)" finale
    first = segments[0] if segments else label
    first = _PHONE_RE.sub("", first)
    first = re.sub(r"\(([A-Za-z]{2})\)\s*$", lambda m: "" if normalize_province(m.group(1)) else m.group(0), first)
    out["name"] = normalize_name(first.strip(" ,-;"))
    if not out["name"]:
        out["name"] = normalize_name(label)

    # Se il label contiene più del solo nome, conserviamo tutto in notes
    if out["name"].lower() != label.lower():
        out["notes"] = f"label originale: {label}"
    return out


def name_core(s: str) -> str:
    """Forma canonica del nome per dedup e id stabile."""
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9\s]", " ", s.lower())
    words = [w for w in s.split() if w not in _STOPWORDS]
    return " ".join(words)


def sanity_coords(lat: float, lng: float) -> bool:
    return ITALY_LAT[0] <= lat <= ITALY_LAT[1] and ITALY_LNG[0] <= lng <= ITALY_LNG[1]


def generate_stable_id(core: str, lat: float, lng: float) -> str:
    key = f"{core}|{lat:.4f}|{lng:.4f}"
    return "dir_" + hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]


def normalize_record(poi, source_url: str, collected_at: str) -> dict:
    parsed = parse_label(poi.label)
    core = name_core(parsed["name"])
    return {
        "id": generate_stable_id(core, poi.lat, poi.lon),
        "entityType": "clinic",
        "name": parsed["name"],
        "clinicName": parsed["name"],
        "vetName": "",
        "address": parsed["address"],
        "city": parsed["city"],
        "province": parsed["province"],
        "phone": parsed["phone"],
        "website": parsed["website"],
        "lat": poi.lat,
        "lng": poi.lon,
        "services": "",
        "species": "",
        "specialties": "",
        "sourceType": SOURCE_TYPE,
        "sourceUrl": source_url,
        "sourceCollectedAt": collected_at,
        "lastVerifiedAt": "",
        "profileStatus": "needs_review",
        "verificationStatus": "not_verified",
        "onlineBookingStatus": "disabled",
        "isPublished": "false",
        "marketingConsent": "false",
        "outreachStatus": "not_contacted",
        "internalNotes": parsed["notes"],
        "rawLabel": poi.label,
        # campo interno, non esportato nel CSV
        "_name_core": core,
    }
