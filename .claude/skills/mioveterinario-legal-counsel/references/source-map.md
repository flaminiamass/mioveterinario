# Source map and research notes

Research date: 2026-06-17. Use this file as the skill's source memory. Before giving a definitive legal answer for production, verify current law and authority guidance.

## Claude Code / skill format

- Anthropic Claude Code Docs, "Extend Claude with skills": https://code.claude.com/docs/en/skills
  - Use for: where skills live, SKILL.md, invocation, project/personal skills.
- Claude.ai Docs, "Creating custom skills": https://claude.com/docs/skills/how-to
  - Use for: directory structure, SKILL.md frontmatter, references/scripts, packaging ZIP.
- Anthropic skills examples: https://github.com/anthropics/skills
  - Use for: examples of skill layout.

## GDPR, privacy, cookie, DPIA, breach

- Regulation (EU) 2016/679 (GDPR), official text via Garante and EUR-Lex:
  - Garante enriched GDPR text: https://www.garanteprivacy.it/il-testo-del-regolamento
  - EUR-Lex GDPR: https://eur-lex.europa.eu/eli/reg/2016/679/oj
  - Use for: Art. 4 definitions, Art. 5 principles, Art. 6 legal bases, Art. 9 special categories, Art. 12-22 rights, Art. 24 accountability, Art. 25 privacy by design/default, Art. 28 processor, Art. 30 register, Art. 32 security, Art. 33-34 breach, Art. 35 DPIA, Chapter V transfers.
- Italian Privacy Code, D.Lgs. 196/2003 as amended:
  - Normattiva consolidated: https://www.normattiva.it/eli/id/2003/07/29/003G0218/CONSOLIDATED
  - Garante page: https://www.garanteprivacy.it/codice
  - Use for: Italian GDPR adaptation, ePrivacy/marketing provisions including Art. 130.
- Garante, "Chiarimenti sull'applicazione della disciplina per il trattamento dei dati relativi alla salute in ambito sanitario", 7 March 2019, doc. web 9091942:
  - https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9091942
  - Use for: human health-data guidance. For MioVeterinario, do not overextend to animal data, but use for the principle that human health data is special and needs Art. 9 analysis.
- EDPB Guidelines 07/2020 on controller and processor concepts:
  - https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-072020-concepts-controller-and-processor-gdpr_en
  - Use for: role allocation, controller/processor/joint controller analysis.
- EDPB Guidelines 05/2020 on consent under GDPR:
  - https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en
  - Use for: consent validity, withdrawal, granularity, no bundling.
- Garante cookie guidelines, "Linee guida cookie e altri strumenti di tracciamento", Provv. n. 231 of 10 June 2021:
  - https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876
  - Use for: cookie banner, technical vs non-technical cookies, refusal/default off, consent renewal.
- Garante DPIA list, Provv. n. 467 of 11 October 2018:
  - https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9058979
  - Use for: Italian list of processing operations likely requiring DPIA and WP248 criteria.
- Garante DPIA page:
  - https://www.garanteprivacy.it/regolamentoue/DPIA
  - Use for: DPIA as accountability and continuous process.
- Garante register of processing activities (RoPA):
  - https://www.garanteprivacy.it/registro-attivita-trattamento
  - Use for: Art. 30 register, written/electronic register, availability to authority.
- Garante data breach page:
  - https://www.garanteprivacy.it/regolamentoue/databreach
  - Use for: notification and communication duties.
- Garante transfers abroad:
  - https://www.garanteprivacy.it/regolamentoue/trasferimento-dati
  - Use for: adequacy/SCCs/derogations and Chapter V transfer checks.
- EDPB Recommendations on supplementary measures for third-country transfers:
  - https://www.edpb.europa.eu/our-work-tools/our-documents/recommendations/recommendations-012020-measures-supplement-transfer_en
  - Use for: transfer impact assessment and supplementary measures.
- EU-US Data Privacy Framework adequacy decision:
  - https://commission.europa.eu/document/fa09cbad-dd7d-4684-ae60-be03fcb0fddf_en
  - Use for: US transfer adequacy where vendor is certified and scope matches.

## Marketing and soft spam

- Privacy Code Art. 130 (via Normattiva/Garante above).
- GiuriCivile, comment on Cass. ord. n. 15881/2025 about newsletter promotional consent and soft spam limits:
  - https://giuricivile.it/newsletter-promozionali-e-consenso-dellinteressato-i-limiti-del-trattamento-dati-ai-fini-commerciali/
  - Use for: legal blog/jurisprudence context. Main rule: promotional email requires explicit consent; soft spam is narrow and generally tied to an actual sale/customer relationship.
- Garante Provv. 17 July 2024 doc. web 10084158 on soft spam/opposition:
  - https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/10084158
  - Use for: opposition management and Art. 130(4) caution.

## Consumer, e-commerce, DSA, P2B, reviews

- D.Lgs. 206/2005, Codice del Consumo, Normattiva:
  - https://www.normattiva.it/eli/id/2005/10/08/005G0232/CONSOLIDATED
  - Use for: consumer rights, unfair commercial practices, precontractual information, online reviews.
- MIMIT Codice del Consumo page:
  - https://www.mimit.gov.it/it/mercato-e-consumatori/tutela-del-consumatore/codice-del-consumo
  - Use for: official government overview.
- D.Lgs. 70/2003, e-commerce directive implementation, Normattiva:
  - https://www.normattiva.it/eli/id/2003/04/14/003G0095/CONSOLIDATED
  - Use for: information society service/e-commerce information duties and intermediary concepts.
- AGCOM Digital Services Act page:
  - https://www.agcom.it/competenze/piattaforme-online/digital-service-act
  - Use for: DSA measures, content moderation, terms transparency, complaints, ads, recommendations, trader traceability, date of application.
- AGCOM Reg. (EU) 2019/1150 Platform-to-Business page:
  - https://www.agcom.it/competenze/piattaforme-online/platform-to-business/regolamento-ue-20191150
  - Use for: vet-facing marketplace terms, ranking, differentiated treatment, complaint/mediation, applicability to business users.
- AGCM consumer page:
  - https://www.agcm.it/per-i-consumatori/index
  - Use for: unfair commercial practices and misleading advertising context.
- Brocardi Art. 22 Codice del Consumo, reviews transparency:
  - https://www.brocardi.it/codice-del-consumo/parte-ii/titolo-iii/capo-ii/sezione-i/art22.html
  - Use for: text of Art. 22(5-bis) about whether/how reviews are verified.
- DLA Piper / dirittoaldigitale.com note on AGCM false reviews:
  - https://dirittoaldigitale.com/2024/03/11/agcm-false-recensioni/
  - Use for: legal blog context on false reviews as unfair/misleading practice.
- Legal for Digital note on e-commerce reviews and Omnibus:
  - https://legalfordigital.it/e-commerce/recensioni-ecommerce-direttiva-omnibus/
  - Use for: practical review-system transparency checklist. Verify current details before quoting.

## Veterinary profession, telemedicine, prescriptions, microchip

- FNOVI, Codice Deontologico del Medico Veterinario, approved 15 November 2019:
  - https://fnovi.it/sites/default/files/2019%20-%20FNOVI%20-%20Codice%20Deontologico_approvato15%20novembre2019_DEFINITIVO.pdf
  - Key use: Art. 40 remote technologies; Art. 47 certifications; Art. 48 prescriptions; Art. 51 advertising; Art. 52 fees; professional independence.
- FNOVI, telemedicine veterinary guidelines page, 20 February 2023:
  - https://fnovi.it/node/50006
  - Use for: telemedicine responsibilities and general guidance.
- FNOVI article on telemedicine and Art. 40:
  - https://fnovi.it/node/50059
  - Use for: remote relationship cannot replace visit; telemedicine for monitoring/surveillance of subjects already in care.
- Ministry of Health, veterinary electronic prescription / farmacosorveglianza:
  - https://www.ricettaveterinariaelettronica.it/
  - https://www.salute.gov.it/portale/medicinaliVeterinari/homeMedicinaliVeterinari.jsp
  - Use for: REV system and official prescription workflow.
- Ministry of Health, microchip/Anagrafe degli animali d'affezione/SINAC:
  - https://www.salute.gov.it/portale/caniGatti/dettaglioContenutiCaniGatti.jsp?lingua=italiano&id=209&area=cani&menu=anagrafe
  - https://www.salute.gov.it/portale/animaliCompagnia/dettaglioContenutiAnimaliCompagnia.jsp?lingua=italiano&id=6293&area=animaliCompagnia&menu=vuoto
  - Use for: microchip and companion animal registration context.
- Decree 2 November 2023 on SINAC technical modalities, Gazzetta Ufficiale:
  - https://www.gazzettaufficiale.it/eli/id/2023/12/04/23A06593/sg
  - Use for: national companion animal identification database implementation.

## Fatture, fiscal records, Sistema TS, conservation

- Agenzia Entrate, "La fattura elettronica":
  - https://www.agenziaentrate.gov.it/portale/la-fattura-elettronica
  - Use for: e-invoice via SdI, B2B/B2C rules.
- Agenzia Entrate / FiscoOggi, forfettari e-invoice obligation from 1 January 2024:
  - https://www.fiscooggi.it/rubrica/normativa-e-prassi/articolo/forfettari-anche-piccoli-dal-2024-fattura-elettronica
  - Use for: current e-invoice scope for forfait taxpayers.
- Agenzia Entrate / FiscoOggi, B2C e-invoice and customer copy:
  - https://www.fiscooggi.it/rubrica/analisi-e-commenti/articolo/e-fattura-consumatori-finali-compilazione-senza-dubbi
  - Use for: SdI plus paper/PDF courtesy copy to consumer.
- Sistema Tessera Sanitaria, spese sanitarie e veterinarie:
  - https://sistemats1.sanita.finanze.it/portale/spese-sanitarie-e-veterinarie
  - Use for: transmission of veterinary expense data to pre-filled tax return flows.
- Agenzia Entrate, precompilata and medical/veterinary expenses:
  - https://infoprecompilata.agenziaentrate.gov.it/portale/spese-sanitarie
  - Use for: expenses communicated via Sistema TS and opposition/payment traceability context.
- Agenzia Entrate, conservation service for e-invoices:
  - https://www.agenziaentrate.gov.it/portale/web/guest/schede/fabbricatiterreni/conservazione-sostitutiva-gn
  - Use for: official conservation service.
- AgID Guidelines on electronic documents formation, management, and conservation:
  - https://www.agid.gov.it/it/agenzia/stampa-e-comunicazione/notizie/2020/09/11/linee-guida-formazione-gestione-conservazione-documenti-informatici
  - Use for: electronic document rules.

## Payments and card data

- Banca d'Italia PSD2/SCA information:
  - https://www.bancaditalia.it/compiti/sispaga-mercati/psd2/index.html
  - Use for: strong customer authentication and payment security concepts.
- EDPB Recommendations 02/2021 on legal basis for storage of credit card data:
  - https://www.edpb.europa.eu/our-work-tools/our-documents/recommendations/recommendations-022021-legal-basis-storage-credit-card_en
  - Use for: card-on-file legal basis caution.
- EBA RTS under PSD2:
  - https://www.eba.europa.eu/regulation-and-policy/payment-services-and-electronic-money/regulatory-technical-standards-strong-customer-authentication-and-secure-communication-under-psd2
  - Use for: SCA/security standards context.

## Cybersecurity, NIS2, AI

- D.Lgs. 138/2024 implementing NIS2, Normattiva:
  - https://www.normattiva.it/eli/id/2024/10/01/24G00155/CONSOLIDATED
  - Use for: NIS2 Italian implementation if platform later falls into scope.
- ACN NIS/NIS2 pages:
  - https://www.acn.gov.it/portale/nis
  - https://www.acn.gov.it/portale/ambito-di-applicazione
  - Use for: scope sectors and ACN role.
- Regulation (EU) 2024/1689, AI Act:
  - https://eur-lex.europa.eu/eli/reg/2024/1689/oj
  - Use for: AI system duties, especially if using triage, ranking, or decision support.
- Garante Replika enforcement note, 2025:
  - https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/10131826
  - Use for: AI chatbot, minors, emotional fragility, risk controls.

## Practical source hierarchy

When sources conflict or differ in detail, use this priority:

1. EU regulations/directives and Italian law from EUR-Lex, Normattiva, Gazzetta Ufficiale.
2. Authority guidance and enforcement from Garante, EDPB, AGCOM, AGCM, ACN, Agenzia Entrate, Ministry of Health, FNOVI.
3. Case law from official court sources when available.
4. Legal blogs and law firm notes as interpretive support only, never as sole source for a definitive rule.
