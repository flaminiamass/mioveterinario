# mioveterinario-legal-counsel

Claude Code skill for legal/privacy/product compliance review of MioVeterinario.

## Install as a project skill

From your project root:

```bash
mkdir -p .claude/skills
unzip mioveterinario-legal-counsel.zip -d .claude/skills
```

Expected structure:

```text
.claude/skills/mioveterinario-legal-counsel/
  SKILL.md
  references/
  templates/
  scripts/
```

Invoke in Claude Code:

```text
/mioveterinario-legal-counsel
```

Or ask naturally, for example:

```text
Rivedi questa PR dal punto di vista GDPR, referti, fatture, recensioni e telemedicina.
```

## What it contains

- `SKILL.md`: operating instructions and legal risk rules.
- `references/legal-playbook.md`: detailed legal/product playbook.
- `references/compliance-checklists.md`: launch, PR, DPIA, vendor, telemedicine, invoice, review checklists.
- `references/source-map.md`: official sources, authority guidance, and legal blogs used in the research.
- `templates/`: DPIA, RoPA, privacy notice, terms, DPA, cookie consent, review policy, vet verification.
- `scripts/legal_scan.py`: dependency-free code scanner for common legal/privacy risk markers.

## Scanner usage

From repo root after installing as project skill:

```bash
python3 .claude/skills/mioveterinario-legal-counsel/scripts/legal_scan.py .
```

JSON mode:

```bash
python3 .claude/skills/mioveterinario-legal-counsel/scripts/legal_scan.py . --json
```

## Important limitation

This skill is a structured legal-risk assistant. It does not replace advice from an Italian lawyer, DPO, accountant, or licensed veterinarian. Use it to find issues, draft requirements, and prepare sign-off packages.

