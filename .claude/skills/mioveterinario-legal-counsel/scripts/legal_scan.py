#!/usr/bin/env python3
"""
MioVeterinario legal/privacy quick scanner.

This script is intentionally dependency-free. It does not replace legal review; it surfaces
files and lines that often create GDPR, veterinary, consumer, fiscal, payment, cookie,
review, DSA/P2B, or security risk.

Usage:
  python3 legal_scan.py /path/to/repo
  python3 legal_scan.py /path/to/repo --json
"""

from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, List

TEXT_EXTENSIONS = {
    ".js", ".jsx", ".ts", ".tsx", ".html", ".htm", ".css", ".scss",
    ".json", ".md", ".txt", ".py", ".rb", ".php", ".java", ".kt",
    ".swift", ".go", ".rs", ".sql", ".yaml", ".yml", ".env", ".toml",
}

SKIP_DIRS = {
    ".git", "node_modules", "dist", "build", ".next", ".nuxt", "coverage",
    "vendor", ".venv", "venv", "__pycache__", ".idea", ".vscode",
}

@dataclass
class Finding:
    risk: str
    category: str
    file: str
    line: int
    match: str
    why: str
    fix: str

PATTERNS = [
    # Secrets and keys
    ("BLOCKER", "security/secrets", r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*['\"][^'\"]{8,}",
     "Possible hardcoded secret or credential.",
     "Move secrets to server-side env/secrets manager; rotate if exposed."),
    ("BLOCKER", "payments", r"(?i)\b(cvv|cvc|cardNumber|card_number|pan)\b",
     "Payment card sensitive field detected. Full PAN/CVV must not be stored or logged by the app.",
     "Use PSP-hosted checkout/tokenization; store only PSP token, brand, last4, expiry if needed."),

    # External vendors and tracking
    ("HIGH", "vendor/form", r"(?i)formspree|formspark|typeform|tally\.so|googleforms|airtable",
     "External form/vendor may process waitlist or user data.",
     "Add privacy notice, DPA/subprocessor review, transfer check, retention and deletion process."),
    ("BLOCKER", "cookies/tracking", r"(?i)gtag\(|google-analytics|googletagmanager|facebook\.net|fbq\(|tiktok|hotjar|fullstory|segment\.com|posthog|mixpanel",
     "Analytics/marketing/session tracking detected.",
     "Gate non-technical tracking behind consent; document cookie policy and consent logs."),
    ("HIGH", "cookies/tracking", r"document\.cookie|localStorage|sessionStorage",
     "Browser storage detected. It may store personal/confidential data or tracking identifiers.",
     "Check contents; never store referti, invoices, tokens, secrets, or clinical/fiscal data in browser storage."),

    # Personal/contact/location data
    ("MEDIUM", "personal-data", r"(?i)email|e-mail|phone|telefono|address|indirizzo|city|citta|nome|surname|cognome",
     "Personal/contact data field or copy detected.",
     "Ensure notice, purpose, legal basis, minimization, retention, and access controls."),
    ("HIGH", "location", r"(?i)geolocation|navigator\.geolocation|latitude|longitude|lat\b|lng\b|home visit|domicilio|indirizzo",
     "Location or home-visit data can reveal home and habits.",
     "Use minimization, clear notice, explicit user action, retention limits, and restricted access."),

    # Pet/veterinary records
    ("HIGH", "pet-record", r"(?i)\b(microchip|chip|breed|razza|species|specie|vaccin\w*|libretto)\b|(?<!-)\b(weight|peso)\s*[:=]",
     "Pet data linked to an owner is personal data and may be confidential.",
     "Minimize fields, secure access, and document purpose/retention."),
    ("HIGH", "clinical/referto", r"(?i)referto|diagnos|treatment|trattament|farmac|drug|therapy|terapia|prescri|ricetta|anamnes|symptom|sintom",
     "Clinical/referto/prescription-like data detected.",
     "Vet-only authoring, audit logs, no analytics/log leakage, no auto-prescription, clear role allocation."),
    ("BLOCKER", "clinical/automation", r"(?i)(auto.*prescri|automatic.*prescri|diagnos.*automat|ai.*diagnos|generate.*prescri|dosage.*ai|dose.*ai)",
     "Automation of diagnosis/prescription/dosage is a veterinary/professional blocker.",
     "Require vet review and final approval; do not provide owner-facing diagnosis or prescriptions automatically."),

    # Booking/video/telemedicine
    ("HIGH", "booking", r"(?i)appointment|prenot|booking|slot|agenda|cancel|disdic|no-show",
     "Booking workflow detected.",
     "Show vet identity, price/fees, cancellation/no-show, emergency limits, platform role, and data sharing notice."),
    ("HIGH", "telemedicine", r"(?i)video|telemed|remote consult|consulenza.*distanza|visita.*online|diagnosi.*online",
     "Remote/video consultation feature or claim detected.",
     "Add vet appropriateness gate, emergency disclaimer, no default recording, no automatic prescription/diagnosis."),

    # Invoices/fiscal/payments
    ("HIGH", "fiscal/invoice", r"(?i)\b(invoice|fattur\w*|ricevut\w*|sdi|xml|vat|iva|codice fiscale|p\.iva|partita iva|sistema ts|tessera sanitaria)\b",
     "Invoice/fiscal data or flow detected.",
     "Identify issuer, SdI/fiscal provider, conservation, Sistema TS applicability, accountant sign-off."),
    ("HIGH", "payments", r"(?i)stripe|paypal|adyen|nexi|satispay|checkout|payment|pagament|refund|rimborso",
     "Payment flow/vendor detected.",
     "Use PSP tokenization, SCA/card-on-file flow, no PAN/CVV, clear refund/no-show terms."),

    # Reviews/marketplace/content
    ("HIGH", "reviews", r"(?i)review|recension|rating|stars|stelle|reply|risposta",
     "Reviews or replies detected.",
     "If called verified, enforce completed appointment; add moderation, report flow, vet reply confidentiality warning."),
    ("HIGH", "marketplace/p2b", r"(?i)ranking|sponsored|sponsor|promoted|featured|ordina|sort|filter|commission|fee|prezzo|price",
     "Ranking/pricing/marketplace indicator detected.",
     "Document ranking criteria, sponsored labels, price/fees, P2B vet terms, consumer transparency."),

    # Marketing/consent
    ("HIGH", "marketing", r"(?i)newsletter|marketing|promo|consent|consenso|unsubscribe|opt[-_ ]?in|spam",
     "Marketing/consent flow detected.",
     "Use granular opt-in, proof of consent, easy unsubscribe; be cautious with soft spam."),

    # AI
    ("HIGH", "ai", r"(?i)\b(openai|anthropic|claude|gpt|llm|ai|machine learning|embedding|vector)\b",
     "AI/LLM feature or vendor detected.",
     "Do not send clinical/fiscal data to AI vendor without DPA, transfer review, training opt-out, and product safeguards."),
]


def iter_files(root: Path) -> Iterable[Path]:
    for current_root, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            path = Path(current_root) / name
            if path.suffix.lower() in TEXT_EXTENSIONS or path.name.startswith(".env"):
                yield path


def scan_file(path: Path, root: Path) -> List[Finding]:
    findings: List[Finding] = []
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return findings

    rel = str(path.relative_to(root))
    for i, line in enumerate(text.splitlines(), start=1):
        short_line = line.strip()
        if not short_line:
            continue
        for risk, category, pattern, why, fix in PATTERNS:
            if re.search(pattern, line):
                findings.append(Finding(
                    risk=risk,
                    category=category,
                    file=rel,
                    line=i,
                    match=short_line[:220],
                    why=why,
                    fix=fix,
                ))
    return findings


def summarize(findings: List[Finding]) -> str:
    counts = {}
    for f in findings:
        counts[f.risk] = counts.get(f.risk, 0) + 1
    order = ["BLOCKER", "HIGH", "MEDIUM", "LOW"]
    lines = []
    lines.append("MioVeterinario legal/privacy scan")
    lines.append("===================================")
    if not findings:
        lines.append("No legal-risk markers found. This does not prove compliance.")
        return "\n".join(lines)
    lines.append("Findings by risk: " + ", ".join(f"{k}={counts.get(k,0)}" for k in order))
    lines.append("")

    grouped = {}
    for f in findings:
        grouped.setdefault((f.risk, f.category), []).append(f)

    for risk in order:
        for (r, category), items in sorted(grouped.items()):
            if r != risk:
                continue
            lines.append(f"[{risk}] {category} ({len(items)} hits)")
            lines.append(f"Why: {items[0].why}")
            lines.append(f"Fix: {items[0].fix}")
            for item in items[:8]:
                lines.append(f"  - {item.file}:{item.line}: {item.match}")
            if len(items) > 8:
                lines.append(f"  - ... {len(items) - 8} more")
            lines.append("")

    lines.append("Next steps:")
    lines.append("- Review BLOCKER and HIGH findings before ship.")
    lines.append("- Map every new data field to purpose, legal basis, retention, recipients, and role.")
    lines.append("- Check source-map.md and compliance-checklists.md in the skill for legal context.")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Scan a repo for MioVeterinario legal/privacy risk markers.")
    parser.add_argument("root", nargs="?", default=".", help="Repository root to scan")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if not root.exists():
        raise SystemExit(f"Path does not exist: {root}")

    findings: List[Finding] = []
    for path in iter_files(root):
        findings.extend(scan_file(path, root))

    if args.json:
        print(json.dumps([asdict(f) for f in findings], indent=2, ensure_ascii=True))
    else:
        print(summarize(findings))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
