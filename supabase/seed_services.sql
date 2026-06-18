-- ============================================================
-- MioVeterinario — Inserimento 27 servizi nel catalogo
-- ============================================================
-- Incolla questo nel SQL Editor di Supabase e clicca "Run"
-- ============================================================

-- Prima svuota la tabella (nel caso ci siano dati parziali)
delete from service_catalog;

-- Inserisci i 27 servizi
insert into service_catalog (id, category, name, description, price, duration, emoji, sort_order) values
('sv1',  'Visite',      'Visita generale',                       'Controllo salute completo con auscultazione e palpazione',        50,  30, '🩺',  1),
('sv2',  'Visite',      'Prima visita cucciolo/gattino',          'Primo controllo, consigli su alimentazione e vaccinazioni',       50,  30, '🐣',  2),
('sv3',  'Visite',      'Visita dermatologica',                   'Esame cute, pelo, prurito, allergie e dermatiti',                 65,  40, '🔬',  3),
('sv4',  'Visite',      'Visita oculistica',                      'Controllo occhi, pressione intraoculare, fondo oculare',          90,  45, '👁️',  4),
('sv5',  'Visite',      'Visita ortopedica',                      'Valutazione articolazioni, zoppia, displasia',                    65,  40, '🦴',  5),
('sv6',  'Visite',      'Visita a domicilio',                     'Il veterinario viene a casa tua',                                 80,  45, '🏠',  6),
('sv7',  'Visite',      'Video consulto',                         'Consulenza online per dubbi e controlli rapidi',                  35,  20, '📹',  7),
('sv8',  'Visite',      'Visita di urgenza',                      'Per situazioni urgenti che richiedono attenzione immediata',      85,  30, '🚨',  8),
('sv9',  'Vaccini',     'Vaccino polivalente cane',               'Protezione da cimurro, parvovirosi, epatite, leptospirosi',      55,  20, '💉',  9),
('sv10', 'Vaccini',     'Vaccino trivalente gatto',               'Protezione da panleucopenia, calicivirus, herpesvirus',          60,  20, '💉', 10),
('sv11', 'Vaccini',     'Vaccino antirabbica',                    'Obbligatorio per viaggi e passaporto europeo',                   65,  20, '💉', 11),
('sv12', 'Vaccini',     'Vaccino coniglio Mixo-RHD',              'Protezione da mixomatosi e malattia emorragica',                 85,  20, '💉', 12),
('sv13', 'Analisi',     'Analisi sangue (emocromo + biochimico)', 'Esame completo del sangue con profilo biochimico',              110,  20, '🩸', 13),
('sv14', 'Analisi',     'Test leishmania',                        'Screening anticorpi per leishmaniosi canina',                    50,  15, '🧪', 14),
('sv15', 'Analisi',     'Test FIV/FeLV',                          'Test immunodeficienza felina e leucemia felina',                 50,  15, '🧪', 15),
('sv16', 'Analisi',     'Esame urine',                            'Analisi chimico-fisica e sedimento urinario',                    35,  15, '🧫', 16),
('sv17', 'Analisi',     'Esame filaria',                          'Test antigene per filariosi cardiopolmonare',                    35,  15, '🧪', 17),
('sv18', 'Analisi',     'Check-up completo',                      'Visita + analisi sangue + urine per un quadro completo',       110,  30, '📋', 18),
('sv19', 'Diagnostica', 'Radiografia',                            'Immagine radiografica di torace, addome o arti',                 55,  20, '📷', 19),
('sv20', 'Diagnostica', 'Ecografia addominale',                   'Visualizzazione organi addominali con ultrasuoni',               85,  30, '📡', 20),
('sv21', 'Diagnostica', 'Ecocardiografia',                        'Ecografia del cuore per valutare funzionalita cardiaca',        130,  40, '❤️', 21),
('sv22', 'Chirurgia',   'Sterilizzazione gatta',                  'Ovariectomia o ovarioisterectomia in anestesia generale',       180,  60, '🏥', 22),
('sv23', 'Chirurgia',   'Castrazione gatto',                      'Orchiectomia in anestesia generale',                            135,  45, '🏥', 23),
('sv24', 'Chirurgia',   'Ablazione tartaro',                      'Pulizia dentale professionale con ultrasuoni in sedazione',     200,  60, '🦷', 24),
('sv25', 'Altro',       'Inserimento microchip',                  'Impianto microchip identificativo e registrazione anagrafe',     40,  15, '📟', 25),
('sv26', 'Altro',       'Certificato sanitario',                  'Certificato di buona salute per viaggi o adozione',              30,  15, '📋', 26),
('sv27', 'Altro',       'Passaporto europeo',                     'Documenti per viaggiare con animale in UE',                      50,  20, '🛂', 27);

-- Verifica: mostra quanti servizi sono stati inseriti
select count(*) as totale_servizi from service_catalog;
