# MioVeterinario compliance checklists

Use these checklists when reviewing features, PRs, launch readiness, or architecture decisions.

## A. Public beta launch checklist

### Legal pages

- [ ] Landing privacy notice exists and is linked near every form.
- [ ] Cookie policy exists or cookie section explains that only technical cookies are used.
- [ ] Cookie banner exists if analytics, pixels, embedded third-party media, session replay, or other non-technical tracking is present.
- [ ] Terms/beta disclaimer explains that the product is in validation and no real booking is active if that is true.
- [ ] Contact for privacy requests exists.
- [ ] Company identity placeholders are resolved before publication.

### Waitlist data

- [ ] Fields are minimized: email, city, animal type only unless justified.
- [ ] Launch notification and marketing are separated.
- [ ] Consent checkbox is not preselected.
- [ ] Consent log records text/version/timestamp/source.
- [ ] Unsubscribe/delete process exists.
- [ ] Retention rule exists, e.g. delete/reconfirm stale leads.

### Vendors

- [ ] Form endpoint vendor reviewed.
- [ ] DPA or processor terms saved.
- [ ] Transfer basis checked if outside EEA.
- [ ] Analytics/tracking disabled or consent-gated.
- [ ] No API keys or secrets in frontend.

### Marketing claims

- [ ] No claim says active booking if only preview.
- [ ] "Verified reviews" is not used unless verification exists.
- [ ] "Referti/libretto/scadenze" claims match real functionality.
- [ ] No emergency or medical outcome claims.

## B. MVP with owner/vet accounts checklist

### Account and access

- [ ] Owner, vet, clinic admin, support, admin roles are defined.
- [ ] Object-level authorization tested for pets, appointments, referti, invoices, reviews.
- [ ] MFA enabled for vet/admin accounts or on roadmap before sensitive data.
- [ ] Passwords hashed server-side with modern algorithm.
- [ ] Session expiration and device revocation exist.

### Data map

- [ ] RoPA entry exists for each processing activity.
- [ ] Each field has purpose, legal basis, retention, recipients, and owner.
- [ ] Free-text fields are minimized and warnings added.
- [ ] Clinical/fiscal fields excluded from analytics/logs.
- [ ] Data export/delete flows designed.

### Roles

- [ ] Controller/processor matrix completed.
- [ ] Vet terms clarify vet controller duties for clinical acts.
- [ ] DPA or processor clauses exist where platform hosts vet clinical records on instructions.
- [ ] Joint-controller cases either avoided or documented.

### Vet onboarding

- [ ] Vet identity and albo/order verification process exists.
- [ ] Clinic authorization process exists.
- [ ] Vet status gates public listing and booking.
- [ ] Specializations/titles are verified or self-declared with review.
- [ ] Suspension/termination process exists.

### Booking

- [ ] Owner sees vet identity, service type, total price/fees, cancellation/no-show, and platform role before confirmation.
- [ ] Owner sees emergency disclaimer.
- [ ] Vet receives only necessary owner/pet details.
- [ ] Cancellation flow records timestamps and policy.

### Referti and pet records

- [ ] Vet-only authoring.
- [ ] Owner read-only access.
- [ ] Version history and audit logs.
- [ ] Admin support access restricted and logged.
- [ ] Download/export controls.

### Reviews

- [ ] Review can be created only after completed appointment if called verified.
- [ ] Review policy shown before submission.
- [ ] Moderation/reporting flow exists.
- [ ] Vet reply flow warns not to disclose confidential data.
- [ ] Sorting/ranking impact documented.

## C. DPIA screening checklist

Perform a DPIA screening for every major feature. Full DPIA is strongly recommended before production if any two or more high-risk factors apply.

High-risk factors:

- [ ] Large scale processing of confidential veterinary/appointment records linked to owners.
- [ ] Systematic monitoring of user behavior, location, or booking patterns.
- [ ] Profiling/ranking that affects visibility of vets or access to services.
- [ ] Processing of geolocation/home visit addresses.
- [ ] Video consultations or recordings.
- [ ] AI analysis of notes/referti/support chats.
- [ ] Data of minors or family/household context.
- [ ] Non-EEA transfers of confidential data.
- [ ] Integration with fiscal/health-like systems such as Sistema TS or e-prescription references.
- [ ] Data matching across sources, e.g. clinic software + platform + payments.

DPIA outputs:

- [ ] Processing description and purposes.
- [ ] Necessity/proportionality assessment.
- [ ] Risk to rights/freedoms.
- [ ] Security and organizational measures.
- [ ] Residual risk and decision.
- [ ] DPO/legal sign-off or reason why no DPO exists.
- [ ] Consultation with authority if residual high risk cannot be mitigated.

## D. Vendor/subprocessor checklist

For each vendor:

- [ ] Vendor name, service, data categories, purposes.
- [ ] Controller/processor status.
- [ ] DPA available and signed/accepted.
- [ ] Subprocessors list reviewed.
- [ ] Data location and transfers checked.
- [ ] SCCs/adequacy/TIA if applicable.
- [ ] Retention/deletion options configured.
- [ ] Security docs reviewed.
- [ ] Sensitive-data logging disabled.
- [ ] AI training/product-improvement use disabled or contractually controlled.
- [ ] Incident notification SLA known.

High-risk vendors requiring extra scrutiny:

- [ ] Formspree or any form backend.
- [ ] Email/SMS/push provider.
- [ ] Analytics, pixels, session replay.
- [ ] Cloud database/object storage.
- [ ] PSP/payment provider.
- [ ] Video provider.
- [ ] AI provider.
- [ ] Support chat/helpdesk.
- [ ] Error reporting/crash analytics.

## E. PR review checklist for Claude Code

When reviewing a PR, look for:

- [ ] New data fields: purpose, notice, legal basis, retention.
- [ ] New vendor/API: DPA, transfers, secret handling.
- [ ] New cookie/tracker: consent gating.
- [ ] New free text: sensitive-data warning and moderation/access controls.
- [ ] New role/endpoint: object-level authorization tests.
- [ ] New referto/invoice/payment feature: high-risk review.
- [ ] New review/ranking/search feature: consumer/P2B/DSA transparency.
- [ ] New video/AI feature: telemedicine/AI review.
- [ ] Marketing copy: no misleading, unsubstantiated, emergency, or medical-outcome claims.
- [ ] Logging: no clinical/fiscal/payment/secret data.
- [ ] Export/delete: updated where data is collected.

Output format for a PR:

```
Verdict: [BLOCKER/HIGH/MEDIUM/LOW]
Files reviewed: [...]
Main risks:
1. ...
Required changes:
- ...
Tests/checks to add:
- ...
Legal sign-off needed:
- ...
```

## F. Telemedicine/video checklist

- [ ] Product copy says remote consult does not replace in-person visit when necessary.
- [ ] Emergency warning is shown before booking and inside video waiting room.
- [ ] Vet confirms remote mode is professionally appropriate.
- [ ] Existing-care relationship is captured where needed.
- [ ] No auto-prescription or auto-diagnosis.
- [ ] No default recording.
- [ ] Video vendor DPA/transfer/security reviewed.
- [ ] Referto after video requires vet approval and timestamp.
- [ ] Owner can understand fees and cancellation before booking.

## G. Fatture/payments checklist

- [ ] Business model documented: vet direct sale, platform merchant, or payment facilitator/agent.
- [ ] Invoice issuer identified.
- [ ] SdI/e-invoice provider or process selected.
- [ ] Customer courtesy copy generated only after fiscal issuance if called invoice.
- [ ] Conservation process defined.
- [ ] VAT/regime/bollo/credit note/refund rules accountant-reviewed.
- [ ] Sistema TS applicability checked.
- [ ] PSP tokenization used; no PAN/CVV stored.
- [ ] SCA/card-on-file/no-show mandate handled.
- [ ] Receipts/invoice PDFs access-controlled.

## H. Review system checklist

- [ ] Verification method documented and displayed.
- [ ] Only completed appointment can leave verified review.
- [ ] One review per appointment.
- [ ] Anti-fraud checks exist.
- [ ] Review policy prohibits false, defamatory, confidential, discriminatory, and illegal content.
- [ ] Report button exists.
- [ ] Moderation reasons and appeal/complaint route exist.
- [ ] Vet reply allowed and moderated.
- [ ] Sponsored/ranking impact disclosed.
- [ ] Audit logs retained.
