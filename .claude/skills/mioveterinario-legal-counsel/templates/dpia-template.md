# DPIA template - MioVeterinario

Document version: [version]
Date: [date]
Owner: [name]
Reviewers: [legal/DPO/security/vet/accountant]
Feature/process: [name]
Status: draft / reviewed / approved / blocked

## 1. Executive summary

Processing summary:

Risk rating before mitigation: BLOCKER / HIGH / MEDIUM / LOW
Risk rating after mitigation: BLOCKER / HIGH / MEDIUM / LOW
Decision: proceed / proceed with conditions / do not proceed / consult authority

## 2. Processing description

### Purposes

- [purpose 1]
- [purpose 2]

### Data subjects

- Pet owners
- Veterinarians
- Clinic staff
- Platform staff/admins
- Other: [specify]

### Data categories

- Account data: [fields]
- Contact/location: [fields]
- Pet data: [fields]
- Confidential veterinary data: [fields]
- Fiscal/payment data: [fields]
- Reviews/content: [fields]
- Technical/security logs: [fields]
- AI/video data: [fields]

### Systems and vendors

| System/vendor | Role | Data | Location | DPA | Transfer basis | Notes |
|---|---|---|---|---|---|---|
| [vendor] | controller/processor | [data] | [country] | yes/no | [basis] | [notes] |

### Data flows

1. [User action]
2. [Frontend/backend]
3. [Database/vendor]
4. [Recipient]
5. [Retention/deletion]

Attach diagram if available.

## 3. Roles and legal bases

| Processing activity | Controller/processor | Legal basis Art. 6 | Art. 9? | Notice location | Retention |
|---|---|---|---|---|---|
| [activity] | [role] | [basis] | no/yes + exception | [link] | [period] |

Notes:

- Animal clinical data is treated as confidential veterinary data and personal data when linked to owner/vet.
- If human health or disability data may be inferred or entered, add Art. 9 analysis.

## 4. Necessity and proportionality

For each data field explain why it is necessary.

| Field | Purpose | Is it required? | Less intrusive alternative | Decision |
|---|---|---:|---|---|
| [field] | [purpose] | yes/no | [alternative] | keep/remove/optional |

Questions:

- Can the service work without this field?
- Can the field be optional?
- Can it be collected later?
- Can it be pseudonymized or aggregated?
- Can free text be replaced with structured choices?

## 5. Risks to people and professionals

| Risk | Impact | Likelihood | Initial rating | Controls | Residual rating |
|---|---:|---:|---:|---|---:|
| Unauthorized access to referti | high | medium | HIGH | RBAC, audit logs, encryption | MEDIUM |
| Wrong owner sees invoice/referto | high | low | HIGH | object-level auth tests | LOW |
| Free text reveals human health | high | medium | HIGH | warning, minimization, redaction | MEDIUM |
| Misleading video consult | high | medium | HIGH | vet gate, emergency warning | MEDIUM |
| Fake/defamatory review | medium | medium | MEDIUM | verified reviews, moderation | LOW |
| Non-EEA transfer | medium | medium | MEDIUM | EEA vendor/SCC/TIA | LOW |

Add all feature-specific risks.

## 6. Security and organizational measures

- [ ] TLS everywhere.
- [ ] Encryption at rest/KMS for confidential records.
- [ ] RBAC and object-level authorization.
- [ ] MFA for vets/admins.
- [ ] Audit logs for sensitive access/actions.
- [ ] Secrets management.
- [ ] Backup encryption and retention.
- [ ] Logging redaction.
- [ ] Incident response and breach notification process.
- [ ] Vendor DPA and transfer review.
- [ ] Staff/admin training and access policy.

## 7. Product and UX mitigations

- [ ] Clear privacy notice at collection point.
- [ ] Free-text warning.
- [ ] Consent where needed.
- [ ] Easy opt-out/unsubscribe.
- [ ] Review policy and report button.
- [ ] Telemedicine/emergency disclaimer.
- [ ] Price/fee/cancellation info before booking.
- [ ] Vet verification badge explanation.

## 8. Residual risk and decision

Residual high risks:

- [risk]

Decision:

- [ ] Proceed.
- [ ] Proceed only after required mitigations.
- [ ] Block release.
- [ ] Consult supervisory authority because residual high risk remains.

Approvals:

- Product: [name/date]
- Security: [name/date]
- Legal/DPO: [name/date]
- Veterinary lead: [name/date]
- Accountant/fiscal: [name/date]

## 9. Follow-up review

Next review date: [date]
Triggers for review:

- New vendor.
- New country transfer.
- New AI/video/recording feature.
- New clinical/fiscal data fields.
- New marketing/profiling use.
- Scale threshold reached.
- Data breach or serious complaint.

