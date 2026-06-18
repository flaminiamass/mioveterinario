# MioVeterinario legal playbook

Last research update: 2026-06-17. Jurisdiction focus: Italy and EU. This playbook is a product/legal operating manual for Claude Code. It is not a final legal opinion. Use it to identify issues, draft product requirements, and prepare materials for lawyer, DPO, accountant, and veterinary sign-off.

## 1. Product assumptions

The product is a pet-owner/veterinarian app and potential online marketplace. The current prototype/landing suggests:

- Owner side: search vets by city, animal, specialization, visit type; view prices, reviews, profiles; book clinic/home/video visits; manage pets; see vaccines, reports/referti, invoices; cancel visits; write reviews.
- Vet side: agenda, pending/confirmed/completed visits, patient list, referti, invoices, profile, reviews and replies.
- Beta landing: email, city, animal type, waitlist, Formspree-style external form endpoint.
- Future risk features: real payments, e-invoicing, electronic veterinary prescription, video consultation, AI summaries, reminders by email/SMS/push, ranking/sponsored results, marketplace commissions, integrations with clinic management systems.

Treat this as a regulated-ish digital health-adjacent marketplace even if animal health is not human health. The app can create legal exposure through privacy, consumer law, professional rules, DSA/P2B, tax, payments, and unfair-commercial-practices law.

## 2. One-page legal architecture

### 2.1 The app should be structured as three layers

1. Platform services layer: account, search, booking, payments facilitation, reviews, notifications, security, analytics, customer support. Usually controlled by MioVeterinario.
2. Professional services layer: veterinary visit, diagnosis, referto, prescription, certification, clinical advice. Usually controlled and legally owned by the vet/clinic.
3. Software/hosting layer for vets: agenda, patient records, referti, invoice drafting. MioVeterinario may act as processor for the vet for some processing operations.

Do not collapse these layers. Many legal mistakes come from treating the whole app as one simple SaaS or one simple marketplace.

### 2.2 Primary legal documents needed

Public beta minimum:

- Landing privacy notice for waitlist.
- Cookie policy and banner or a clear no-non-technical-cookie setup.
- Terms for beta/website use.
- Vendor list and DPA status.

Closed MVP with owner/vet accounts:

- Owner privacy notice.
- Vet/professional privacy notice.
- Marketplace owner terms.
- Vet/clinic terms.
- Review policy/moderation terms.
- Cookie/tracking policy.
- Data Processing Agreement or clauses for vet-as-controller/platform-as-processor use cases.
- Controller/joint-controller allocation table.
- RoPA/register of processing activities.
- DPIA or at least DPIA screening.
- Data breach runbook.
- Retention schedule.
- Security policy and access-control policy.

Production with payments/fatture/referti/video:

- Fiscal flow memo by accountant.
- E-invoicing/SdI and conservation flow.
- Sistema TS flow if applicable to veterinary expenses.
- PSP terms and card-on-file notices.
- Telemedicine policy and vet professional responsibility policy.
- Vet verification/KYB/KYC policy.
- DSA/P2B compliance documents.
- Subprocessor list and transfer impact assessment for non-EEA vendors.

## 3. Data classification

### 3.1 Key GDPR distinction

GDPR protects data relating to natural persons. A dog's diagnosis is not automatically a special-category human health datum. But in this product most animal records are tied to a human account, home address, payment, vet, appointment, or location. They are therefore at least personal data of the owner/vet. They may also reveal information about the human, such as disability, household, income, home address, family status, or health in free-text notes.

Product rule: classify animal clinical records as `confidential veterinary data` with security close to health data, even if the legal basis analysis distinguishes Article 6 from Article 9.

### 3.2 Data categories in MioVeterinario

| Category | Examples | Typical risk | Notes |
|---|---|---:|---|
| Account identity | name, email, phone, password hash, role | Medium | Basic personal data. |
| Location/contact | city, address, home visit address, IP, geolocation | High | Home visit data can reveal home and routine. |
| Pet identity | name, species, breed, date of birth, sex, weight, microchip | Medium/High | Linked to owner; microchip can identify owner through registries. |
| Veterinary clinical | appointment notes, diagnosis, treatments, drugs, advice, referti, vaccines | High | Confidential; may be professional record and personal data. |
| Professional vet data | name, clinic, address, albo, titles, specialization, fees, reviews | Medium/High | Professional and reputation data. |
| Booking/agenda | date/time/status, cancellation, no-show, reminders | Medium | Contractual and operational. |
| Fiscal | invoices, amounts, tax details, payment status, CF/P.IVA if collected | High | Legal retention and confidentiality. |
| Payments | PSP customer id, token, last4, transaction id | High | Never store PAN/CVV. |
| Reviews/content | ratings, comments, replies, moderation logs | High | Defamation, confidentiality, DSA, consumer transparency. |
| Marketing/tracking | newsletter consent, campaign source, cookies, analytics id | Medium/High | Consent/cookie/ePrivacy rules. |
| Support/security | tickets, logs, admin actions, IP, device data | Medium/High | Data minimization and retention needed. |
| AI inputs/outputs | summaries, triage text, support bot logs | High | Risk of sending confidential records to AI vendors. |

## 4. Privacy/GDPR operating rules

### 4.1 Legal basis matrix

| Processing | Likely legal basis | Owner/controller note | Product requirement |
|---|---|---|---|
| Owner account creation | Contract or pre-contract | Platform controller | Privacy notice at signup. |
| Vet account/KYB | Contract, legal obligation, legitimate interest | Platform controller | Verify identity/albo; keep evidence. |
| Search and booking | Contract, legitimate interest | Platform controller; vet may be independent controller for booking received | Show service info before booking. |
| Sharing appointment details with vet | Contract; legitimate interest; maybe legal/professional necessity | Platform + vet roles must be mapped | Limit to necessary fields. |
| Referti hosted for vet | Often vet controller, platform processor; sometimes platform controller for account delivery | Need Art. 28 DPA if processor | RBAC, audit logs, retention by vet instruction. |
| Owner view of referti/invoices | Contract, legal obligation where applicable | Platform/vet role split | Access only to correct owner. |
| Vaccination reminders | Contract/service; legitimate interest if expected | Platform or vet depending source | Opt-out for non-essential reminders. |
| Marketing/newsletter | Consent, or soft spam only in narrow cases | Platform controller | Separate checkbox; unsubscribe in every email. |
| Non-technical cookies/profiling | Consent | Platform controller | Reject all as easy as accept all. |
| Security logs/fraud | Legitimate interest; legal obligation | Platform controller | Retention, access restriction. |
| Fiscal records | Legal obligation; contract | Vet and/or platform depending issuer | Accountant sign-off. |
| Reviews publication | Contract/legitimate interest; content moderation obligations | Platform controller for review system | Disclosure, moderation, verification. |
| AI-assisted drafting | Contract/legitimate interest only after privacy/security review | Platform/vet roles depend on use | No AI vendor without DPA/TIA; vet final approval. |

### 4.2 Article 9 / special categories

Animal data is not Article 9 by default. Still, Article 9 can be triggered if:

- The owner writes human health details in appointment notes or support chat.
- The pet is an assistance animal and the record reveals disability.
- A billing/subsidy/insurance workflow reveals human health or economic vulnerability.
- AI or analytics infer human health or disability from animal/service patterns.

Mitigation:

- Add inline copy near free-text fields: "Inserisci solo informazioni utili per la visita dell'animale. Non inserire dati sanitari tuoi o di altre persone se non strettamente necessario." Adjust language for UI.
- Prefer structured fields over free text.
- Add redaction tools for support/admin.
- Exclude notes/referti from analytics and AI by default.

### 4.3 Controller/processor decision tree

For each feature ask:

1. Who decides why data is processed?
2. Who decides essential means (which data, retention, recipients, access)?
3. Is the platform merely hosting/processing on vet instructions?
4. Does the platform reuse the data for its own purposes (analytics, ranking, support, product improvement, review verification, fraud prevention)?
5. Is the owner relationship direct with platform, vet, or both?

Default mapping:

- Platform as independent controller: account, waitlist, owner onboarding, vet onboarding, search/ranking, booking UX, customer support, security, reviews, platform invoices/commission, marketing/cookies.
- Vet/clinic as independent controller: clinical examination, diagnosis, referto content, prescriptions, certificates, professional advice, vet invoices to owner, Sistema TS duties where applicable.
- Platform as processor for vet: hosting clinical record/referto/agenda strictly for vet's clinical record purposes, if no independent reuse beyond security and service operation.
- Joint controllers: possible for integrated booking/notifications/review verification where both define purposes and means. Avoid unless intentional; if used, document Article 26 arrangement and transparent summary to users.

### 4.4 Required privacy artifacts

- RoPA: create per processing activity, not per feature only.
- DPIA screening: mandatory before production; full DPIA likely if scale, clinical records, systematic monitoring, profiling/ranking, geolocation, video, or AI are introduced.
- Privacy notices: separate owner, vet, landing, cookie, maybe support/admin.
- DPA/subprocessor list: all vendors, especially Formspree, hosting, email/SMS, analytics, PSP, video, AI, support chat.
- Transfer mechanism: EEA vendors preferred; for non-EEA use adequacy, SCCs, and transfer assessment where needed.
- Data breach runbook: 72-hour authority assessment, processor-to-controller notice, user communication when high risk.

### 4.5 Retention baseline

These are product defaults, not final legal advice:

| Data | Suggested default | Sign-off |
|---|---:|---|
| Waitlist leads | delete or reconfirm after 12-18 months | privacy/marketing |
| Account data | account life + limited limitation period | legal |
| Booking records | 24 months after visit unless needed for dispute/accounting | legal |
| Referti/clinical records | vet-defined professional retention; do not delete without vet/owner legal analysis | vet/legal |
| Invoices/accounting | statutory fiscal retention; accountant to confirm exact term | accountant |
| Reviews | while public profile active + moderation/dispute retention | legal |
| Security logs | 6-12 months typical, longer for security incidents | security/legal |
| Consent logs | as long as needed to prove consent + limitation period | privacy |
| Deleted account backups | fixed backup rotation, e.g. 30-90 days | security/privacy |

Never use indefinite retention without justification.

## 5. Cookie, tracking, and marketing rules

### 5.1 Cookie/tracking

- Technical cookies: no consent, but disclose.
- Non-technical analytics, ads, profiling, retargeting, social pixels, session replay: consent before activation unless a strict privacy-preserving exemption is validated.
- Banner must make refusal as easy as acceptance. Closing the banner should leave non-technical cookies off. No pre-ticked boxes.
- Keep consent log: user id or pseudonymous id, choices, timestamp, policy version, UI version.
- Separate cookie policy from privacy notice or include a clear dedicated section.

### 5.2 Beta form and waitlist

For email/city/animal waitlist:

- Add privacy notice link next to submit button.
- Make marketing optional and separate from launch notification if possible.
- Do not say "no spam" unless there is an actual unsubscribe/deletion process.
- If Formspree or another external endpoint is used, verify DPA, transfer basis, retention, security, and where data is stored.
- Do not use waitlist data for profiling, ads, lookalike audiences, or vet targeting without new consent.

### 5.3 Email marketing

- General rule: promotional emails need opt-in consent.
- Soft spam is narrow: usually only for similar products/services after an actual sale/customer relationship, with notice and easy opt-out. Do not rely on soft spam for a free beta waitlist unless legal signs off.
- Each email needs unsubscribe or opposition link.
- Consent records must show source, text, version, timestamp, and user action.

## 6. Veterinary and professional rules

### 6.1 Vet verification

Before a vet profile can be bookable:

- Verify identity, professional title, registration/order/albo status, clinic/structure, address, VAT/tax data, insurance if required by contract, and authority to represent clinic.
- Keep evidence and re-check periodically.
- Do not allow unverified vets to publish specializations, prescriptions, referti, or paid services.
- Add vet status states: `draft`, `pending_verification`, `verified`, `suspended`, `terminated`.

### 6.2 Advertising/profile rules

Vet profiles may show title, specialization, services, clinic, fees, and availability, but content must be:

- truthful;
- transparent;
- not misleading;
- not comparative in a way that suggests superiority over named competitors;
- not suggestive or exploiting fear/emotion;
- not hidden advertising.

Risky copy examples:

- "Il miglior veterinario di Roma" -> avoid unless objectively substantiated and still likely problematic.
- "Diagnosi immediata online" -> blocker.
- "Antibiotico senza visita" -> blocker.
- "Risultato garantito" -> blocker.
- "Prezzi piu bassi di tutti" -> high risk comparative claim.

Safer copy:

- "Profilo verificato: iscrizione professionale controllata da MioVeterinario il [date]."
- "Visita video disponibile solo quando professionalmente appropriata. Il veterinario puo richiedere una visita in presenza."
- "Prezzo indicativo/da confermare" only if not final; otherwise show total price and fees.

### 6.3 Telemedicine/video consultation

Build these rules into product design:

- Separate `video_consult` from `video_visit` if possible. Use terminology carefully.
- Require vet confirmation that remote mode is appropriate.
- For new pet/new owner/new clinical problem, default to in-person unless vet marks exception.
- No emergency reliance: include an emergency warning and route to local emergency clinic/phone.
- Do not allow auto-prescription from video flow.
- Store video metadata minimally; do not record video by default. If recording is added, require separate legal review, notice, consent/legal basis, retention, access control, and vendor review.
- Keep audit trail of vet decision and owner acknowledgement.

Suggested UI acknowledgement:

"La consulenza a distanza non sostituisce una visita clinica quando necessaria. Il veterinario puo interrompere la consulenza e richiedere una visita in presenza o indirizzarti a un pronto soccorso veterinario."

### 6.4 Referti and prescriptions

- Referto templates may help the vet write, but final text must be intentionally approved by the vet.
- The system must display author, timestamp, version, and edit history.
- Owner must not be able to alter referto content.
- Admins should not access referti unless necessary for support/security and logged.
- Prescriptions must remain in official veterinary prescription systems or explicit integrations. The app can store a reference/copy only if legally allowed and secured.
- AI must not produce final prescriptions, dosage, or therapy recommendations to owners.

## 7. Fatture, payments, and tax

### 7.1 Invoice role model

Possible models:

1. Vet direct sale: owner buys veterinary service from vet/clinic. Vet issues invoice/receipt to owner. Platform charges vet a commission/subscription and invoices vet.
2. Platform merchant of record: platform sells service to owner and engages vets. Higher regulatory/professional/tax risk; requires legal/accountant redesign.
3. Payment facilitator/agent: platform collects on behalf of vet through PSP. Requires PSP terms, agency clauses, payout records, invoices from vet, and accounting sign-off.

Default recommendation: start with model 1 for legal clarity unless business requires otherwise.

### 7.2 E-invoicing and copies

- Italian B2B/B2C e-invoicing generally uses SdI. For B2C, the customer can receive a courtesy PDF/paper copy while the e-invoice goes through SdI.
- If the app generates invoice drafts, label them correctly until the fiscal provider/SdI confirms issuance.
- Invoice XML, conservation, VAT regime, bollo, reverse charge, commissions, refunds, no-shows, and credit notes must be accountant-reviewed.
- Do not call a document "fattura" if it is only a receipt/preview/proforma.

### 7.3 Sistema TS and veterinary expenses

Veterinary expenses may be relevant to tax pre-filled return flows through Sistema Tessera Sanitaria. Before implementing:

- Determine who is legally required/allowed to submit data (usually professionals/structures, not the marketplace by default).
- Determine required fields, payment traceability, opposition rights, timelines, and retention.
- Do not submit or store CF/tax health expense data without legal/accounting basis.
- Add owner notice about tax data processing and opposition if applicable.

### 7.4 Payments

- Use PSP-hosted checkout or SDK tokenization.
- Store only PSP customer id, payment method token, brand, last4, expiry if needed, and transaction status.
- Never store CVV or full card number.
- Card-on-file: separate consent/mandate UX, clear future charges/no-show policy, cancellation, and SCA flow.
- Refund/no-show policies must be shown before booking/payment.

## 8. Consumer, e-commerce, marketplace, DSA, and P2B

### 8.1 Owner terms and precontractual info

Before booking/payment show:

- Vet/clinic identity and contact/address.
- Platform identity and role.
- Service type: clinic, home, video/remote consult.
- Main characteristics and limitations.
- Price, taxes, platform fees, travel fees, payment method, cancellation/no-show terms.
- Whether price is fixed, starting price, or estimate.
- Complaint/support channel.
- Emergency disclaimer.
- Right of withdrawal/cancellation analysis for services and timing; validate with lawyer.

### 8.2 Vet terms / P2B

Vet/clinic terms should cover:

- Eligibility and verification.
- Fees/commissions/subscription.
- Ranking parameters: distance, availability, rating, specialization, price, sponsored placement, platform quality/safety factors.
- Data access: what vet sees, exports, retention after termination.
- Suspension/termination grounds and notice.
- Complaints handling and mediation if required.
- Vet responsibility for clinical services, referti, prescriptions, tax invoices, and professional compliance.
- Review response and moderation rules.
- Platform audit rights and security requirements.

### 8.3 DSA/content moderation

If the app stores or publishes vet profiles, reviews, replies, photos, or user comments:

- Terms must restrict illegal, defamatory, discriminatory, misleading, fake, confidential, or privacy-violating content.
- Provide a notice-and-action channel for illegal content.
- Give reasons when removing/restricting content or suspending accounts.
- Provide complaint/appeal flow where required.
- Keep moderation logs.
- Disclose ads/sponsored profiles and main ranking/recommendation logic.
- For marketplace/trader traceability, collect and verify vet/trader data before allowing services.

### 8.4 Reviews

Minimum compliant review system:

- Only completed appointments can generate a verified review.
- One review per appointment, editable for limited time or with version history.
- Review form warns not to include diagnosis, third-party data, insults, or confidential details.
- Vet can reply, but reply is also moderated and must not disclose clinical confidential information.
- Display: "Recensione verificata: pubblicata da un utente che ha prenotato e completato una visita tramite MioVeterinario." Only use this if technically true.
- Display review sorting criteria and sponsored/ranking effects if reviews affect ranking.
- Preserve audit trail: appointment id, author id, vet id, timestamp, moderation actions.

## 9. Security and engineering controls

### 9.1 Minimum controls for MVP with referti/fatture

- TLS everywhere.
- Password hashing with modern algorithm; MFA for vets/admins.
- Role-based access control: owner, vet, clinic admin, platform support, platform admin.
- Object-level authorization tests for every pet/referto/invoice/appointment endpoint.
- Clinical/fiscal data encrypted at rest or protected with equivalent cloud KMS controls.
- Secrets never in frontend, repo, logs, or client bundle.
- Audit logs for referto view/edit/download, invoice view/download, admin access, role changes, vet verification, payment events.
- No clinical/fiscal data in analytics, crash reports, support screenshots, or logs unless redacted.
- Data export/delete workflows.
- Backups encrypted and tested; backup deletion/rotation documented.
- Incident response and data breach runbook.

### 9.2 Admin and support controls

- Support should have least-privilege access and redaction by default.
- Break-glass access for referti/invoices requires reason, ticket id, timestamp, and logging.
- Admin UI should never expose full payment details or secrets.
- Admins should not edit clinical records; only vets can author/update referti.

### 9.3 Vendor review

For every vendor ask:

- What data is sent?
- Is vendor controller or processor?
- Is there a DPA?
- EEA or third-country transfer?
- Security certifications?
- Retention/deletion controls?
- Subprocessors?
- Does the vendor use data for AI training, ads, or product improvement?
- Can we disable sensitive logging?

High-risk vendors: Formspree-like forms, Google/Meta pixels, analytics, session replay, email/SMS/push, PSP, video, AI, support chat, cloud database, object storage, error reporting.

## 10. AI features

Potential AI uses:

- Owner triage chatbot.
- Vet referto drafting.
- Summaries of visits.
- Search/ranking recommendations.
- Support replies.

Rules:

- No owner-facing diagnosis or treatment plan without vet review.
- No prescription/dosage automation.
- No AI training on production clinical/fiscal data without separate legal review and explicit contractual controls.
- Use AI vendors only after DPA, transfer review, logging retention review, and opt-out/training disablement.
- Label AI assistance internally and keep vet final approval trail.
- If AI materially influences ranking/access to vets, disclose logic and check fairness/consumer law.

## 11. Feature-by-feature guidance

### Landing page / beta

Risks: consent, Formspree vendor, marketing copy, misleading beta claims.

Must have:

- Privacy notice link.
- Optional marketing checkbox.
- Form endpoint vendor review.
- No non-technical trackers before consent.
- Clear copy: waitlist only, no real booking if not available.

### Search and ranking

Risks: P2B transparency, consumer deception, professional advertising.

Must have:

- Ranking criteria documented.
- Sponsored/paid placement labels.
- Accurate prices/availability.
- Vet verification before listing as bookable.

### Booking

Risks: consumer precontractual info, cancellation, sharing data with vet.

Must have:

- Service summary before confirm.
- Price/taxes/fees/cancellation/no-show.
- Vet identity and platform role.
- Emergency warning.
- Data sharing notice.

### Pet profile

Risks: excessive data, microchip, free text, minors/household info.

Must have:

- Minimize required fields.
- Warn against human sensitive data in notes.
- Access control and export/delete.

### Referti

Risks: confidentiality, professional responsibility, unauthorized access.

Must have:

- Vet-only authoring and final approval.
- Version/audit log.
- Owner read-only access.
- No analytics/log leakage.

### Vaccines/reminders

Risks: inaccurate medical reminders, vet responsibility, notifications.

Must have:

- Source of vaccine data.
- Reminder not as medical advice.
- Opt-out for non-essential reminders.

### Video consult

Risks: telemedicine limitation, emergency, recordings, prescription.

Must have:

- Appropriate-use acknowledgement.
- Vet decision gate.
- No default recording.
- No auto-prescription.

### Fatture

Risks: wrong issuer, SdI, conservation, Sistema TS.

Must have:

- Invoice issuer model documented.
- Accountant sign-off.
- Correct labels: draft/proforma/fattura.
- No full card data.

### Reviews

Risks: fake/defamatory/confidential reviews, DSA, consumer law.

Must have:

- Verified appointment link if claimed.
- Moderation/reporting/appeal.
- Vet reply without confidentiality breach.
- Disclosure of verification method.

## 12. Common blocker patterns in code

Mark as BLOCKER or HIGH when found:

- `localStorage` or console logs containing referti, diagnosis, drugs, invoices, tokens, addresses, or payment details.
- Frontend-only authorization checks for owner/vet data.
- Public endpoints returning all pets/referti/invoices without owner/vet scoping.
- Free-text notes sent to analytics, AI, or error reporting.
- Formspree/external form endpoint without privacy notice and vendor review.
- `document.cookie`, pixels, GA, Meta, TikTok, session replay active before consent.
- "verified reviews" claim without completed-appointment enforcement.
- "video visit/diagnosis" copy without telemedicine limitations.
- Prescription/referto auto-generation without vet approval.
- Fattura generated in frontend as final fiscal document without SdI/fiscal workflow.
- Hardcoded API keys, tokens, endpoints, or credentials.

