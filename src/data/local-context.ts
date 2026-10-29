/**
 * Per-country operating context.
 *
 * These are the facts that change what an invoice, a tax line, a phone number
 * and a business name actually look like in each market. They are not
 * decoration: they are what makes a country-level page useful to a buyer who
 * is actually in that country, and what stops every market's tool page from
 * being the same page with a different place name on it.
 *
 * Every one of the 72 markets has an entry.
 */
export interface LocalContext {
  /** BCP-47 locale used for dates and numbers. */
  locale: string;
  /** What the local consumption tax is called. */
  taxLabel: string;
  /** Typical rate, written the way locals would write it. */
  taxRate: string;
  /** The national identifier a business puts on its paperwork. */
  idLabel: string;
  /** A realistic address line format. */
  address: string;
  /** A realistic phone format. */
  phone: string;
  /** How people in this market actually pay. */
  payments: string;
  /** How local companies tend to be named. */
  naming: string;
  /** Date order used locally. */
  dateFormat: string;
}

export const LOCAL_CONTEXT: Record<string, LocalContext> = {
  US: { locale: 'en-US', taxLabel: 'Sales tax', taxRate: '6–10% state and local', idLabel: 'EIN (Employer Identification Number)', address: '123 Example St, Suite 400, Austin, TX 78701', phone: '+1 (512) 555-0142', payments: 'Card, ACH bank transfer, PayPal, Apple Pay, Google Pay', naming: 'LLC or Inc., usually a short invented brand name', dateFormat: 'MM/DD/YYYY' },
  GB: { locale: 'en-GB', taxLabel: 'VAT', taxRate: '20% standard rate', idLabel: 'Company registration number (CRN)', address: '10 Example Street, London, SW1A 2AA', phone: '+44 20 7946 0958', payments: 'Card, PayPal, Faster Payments bank transfer, direct debit', naming: 'Ltd or LLP, often a surname plus a trade term', dateFormat: 'DD/MM/YYYY' },
  CA: { locale: 'en-CA', taxLabel: 'GST/HST', taxRate: '5% federal GST, 13% HST in Ontario', idLabel: 'BN (Business Number)', address: '150 Elgin Street, Suite 1200, Toronto, ON M5J 2T9', phone: '+1 (416) 555-0198', payments: 'Card, Interac, PayPal, e-Transfer', naming: 'Ltd or Inc, often initials or a short brand', dateFormat: 'YYYY-MM-DD' },
  AU: { locale: 'en-AU', taxLabel: 'GST', taxRate: '10%', idLabel: 'ABN (Australian Business Number)', address: '120 Collins Street, Melbourne VIC 3000', phone: '+61 3 5550 0142', payments: 'Card, PayPal, BPAY, Afterpay', naming: 'Pty Ltd, typically a founder name plus a trade term', dateFormat: 'DD/MM/YYYY' },
  NZ: { locale: 'en-NZ', taxLabel: 'GST', taxRate: '15%', idLabel: 'NZBN', address: '1 Grey Street, Auckland 1010', phone: '+64 9 555 0142', payments: 'Card, POLI, PayPal, bank transfer', naming: 'Limited, usually descriptive', dateFormat: 'DD/MM/YYYY' },
  AE: { locale: 'ar-AE', taxLabel: 'VAT', taxRate: '5%', idLabel: 'TRN (Tax Registration Number)', address: 'Office 1201, Marina Gate, Dubai', phone: '+971 4 555 0142', payments: 'Card, Tabby, Apple Pay, local bank transfer', naming: 'LLC, FZ-LLC or PJSC', dateFormat: 'DD/MM/YYYY' },
  SA: { locale: 'ar-SA', taxLabel: 'VAT', taxRate: '15%', idLabel: 'CR (Commercial Registration)', address: 'King Fahd Road, Riyadh 12271', phone: '+966 11 555 0142', payments: 'Mada, Apple Pay, SADAD, bank transfer', naming: 'LLC, Co. or Est.', dateFormat: 'DD/MM/YYYY' },
  QA: { locale: 'ar-QA', taxLabel: 'VAT', taxRate: '5%', idLabel: 'CR and Tax Card number', address: 'Al Sadd, Doha', phone: '+974 4 555 0142', payments: 'Card, NAPS, bank transfer', naming: 'W.L.L.', dateFormat: 'DD/MM/YYYY' },
  BH: { locale: 'ar-BH', taxLabel: 'VAT', taxRate: '10%', idLabel: 'CR (Commercial Registration)', address: 'Juffair, Manama', phone: '+973 1 555 0142', payments: 'Card, BenefitPay, bank transfer', naming: 'W.L.L. or Est.', dateFormat: 'DD/MM/YYYY' },
  KW: { locale: 'ar-KW', taxLabel: 'VAT', taxRate: '0% (zero-rated)', idLabel: 'CR (Commercial Registration)', address: 'Al-Mubarakiya, Kuwait City', phone: '+965 2 555 0142', payments: 'Card, KNet, bank transfer', naming: 'W.L.L. or Co.', dateFormat: 'DD/MM/YYYY' },
  OM: { locale: 'ar-OM', taxLabel: 'VAT', taxRate: '5%', idLabel: 'CR (Commercial Registration)', address: 'Al Khuwair, Muscat', phone: '+968 2 555 0142', payments: 'Card, bank transfer', naming: 'LLC', dateFormat: 'DD/MM/YYYY' },
  IQ: { locale: 'ar-IQ', taxLabel: 'VAT', taxRate: '0% in practice', idLabel: 'CR (Commercial Registration)', address: 'Al Mansoor, Baghdad', phone: '+964 1 555 0142', payments: 'Card, bank transfer', naming: 'Co. or LLC', dateFormat: 'DD/MM/YYYY' },
  PK: { locale: 'en-PK', taxLabel: 'Sales tax (GST)', taxRate: '17%', idLabel: 'NTN (National Tax Number) or STRN', address: 'Office 5, Gulberg III, Lahore 54660', phone: '+92 42 3555 0142', payments: 'Card, JazzCash, Easypaisa, SadaPay, bank transfer', naming: 'Pvt Ltd, often the family name', dateFormat: 'DD/MM/YYYY' },
  IN: { locale: 'en-IN', taxLabel: 'GST', taxRate: '18% (5%, 12% and 18% slabs)', idLabel: 'GSTIN', address: '4th Floor, BKC, Mumbai 400051', phone: '+91 22 5555 0142', payments: 'Card, UPI, netbanking, Paytm', naming: 'Pvt Ltd or LLP', dateFormat: 'DD/MM/YYYY' },
  BD: { locale: 'bn-BD', taxLabel: 'VAT', taxRate: '15%', idLabel: 'BIN or TIN', address: 'Level 5, Gulshan Avenue, Dhaka 1212', phone: '+880 2 9555 0142', payments: 'Card, bKash, Nagad, Rocket, bank transfer', naming: 'Ltd or PLC, usually a trade name', dateFormat: 'DD/MM/YYYY' },
  SG: { locale: 'en-SG', taxLabel: 'GST', taxRate: '9%', idLabel: 'UEN and GST Registration No.', address: '1 Raffles Place, Singapore 048616', phone: '+65 6555 0142', payments: 'PayNow, card, PayPal, GrabPay', naming: 'Pte Ltd', dateFormat: 'DD/MM/YYYY' },
  MY: { locale: 'ms-MY', taxLabel: 'GST and SST', taxRate: '6% or 8%', idLabel: 'SSM business registration number', address: 'Menara Hap Seng, Jalan P. Ramlee, Kuala Lumpur 50250', phone: '+60 3 5555 0142', payments: 'DuitNow, card, PayPal, Touch n Go eWallet', naming: 'Sdn Bhd or Enterprise', dateFormat: 'DD/MM/YYYY' },
  ID: { locale: 'id-ID', taxLabel: 'PPN (VAT)', taxRate: '11–12%', idLabel: 'NPWP (tax identification number)', address: 'Menara Astra, Jakarta 12950', phone: '+62 21 555 0142', payments: 'GoPay, OVO, DANA, card, virtual account', naming: 'PT, CV or TBK', dateFormat: 'DD/MM/YYYY' },
  PH: { locale: 'en-PH', taxLabel: 'VAT', taxRate: '12%', idLabel: 'TIN and RDO code', address: '25th Floor, BGC, Taguig 1634', phone: '+63 2 5555 0142', payments: 'Card, GCash, Maya, bank transfer', naming: 'Inc, Corp or LLC', dateFormat: 'MM/DD/YYYY' },
  EG: { locale: 'ar-EG', taxLabel: 'VAT', taxRate: '14% (5% reduced)', idLabel: 'Tax Card and TIN', address: 'Smart Village, Cairo', phone: '+20 2 555 0142', payments: 'Card, Vodafone Cash, InstaPay, bank transfer', naming: 'Co. or LLC', dateFormat: 'DD/MM/YYYY' },
  NG: { locale: 'en-NG', taxLabel: 'VAT', taxRate: '7.5%', idLabel: 'TIN', address: 'Victoria Island, Lagos', phone: '+234 1 555 0142', payments: 'Card, bank transfer, USSD', naming: 'Ltd or Nigeria Ltd', dateFormat: 'DD/MM/YYYY' },
  ZA: { locale: 'en-ZA', taxLabel: 'VAT', taxRate: '15%', idLabel: 'VAT number and CIPC registration number', address: '1 Foreshore Street, Cape Town 8001', phone: '+27 21 555 0142', payments: 'Card, PayFast, EFT, SnapScan', naming: 'Pty Ltd or CC', dateFormat: 'YYYY-MM-DD' },
  KE: { locale: 'en-KE', taxLabel: 'VAT', taxRate: '16%', idLabel: 'PIN (KRA taxpayer number)', address: 'Westlands, Nairobi', phone: '+254 20 555 0142', payments: 'Card, M-Pesa, bank transfer', naming: 'Ltd or Co.', dateFormat: 'DD/MM/YYYY' },
  DE: { locale: 'de-DE', taxLabel: 'USt (Mehrwertsteuer)', taxRate: '19% (7% reduced)', idLabel: 'USt-IdNr. and Steuernummer', address: 'Torstraße 140, 10119 Berlin', phone: '+49 30 5550 142', payments: 'Card, PayPal, SEPA direct debit, Sofort', naming: 'GmbH, UG or AG, usually descriptive', dateFormat: 'DD.MM.YYYY' },
  FR: { locale: 'fr-FR', taxLabel: 'TVA', taxRate: '20% (5.5% and 10% reduced)', idLabel: 'SIRET and VAT number', address: '12 rue de Rivoli, 75001 Paris', phone: '+33 1 55 50 14 20', payments: 'Card, PayPal, SEPA, Apple Pay', naming: 'SAS, SARL or EI', dateFormat: 'DD/MM/YYYY' },
  ES: { locale: 'es-ES', taxLabel: 'IVA', taxRate: '21% (10% and 4% reduced)', idLabel: 'NIF, CIF or VAT number', address: 'Carrer de Balmes 12, 08007 Barcelona', phone: '+34 93 555 0142', payments: 'Card, Bizum, PayPal, SEPA', naming: 'SL, SA or S.L.U.', dateFormat: 'DD/MM/YYYY' },
  IT: { locale: 'it-IT', taxLabel: 'IVA', taxRate: '22% (10% and 5% reduced)', idLabel: 'Partita IVA', address: 'Via Montenapoleone 8, 20121 Milano', phone: '+39 02 5550 142', payments: 'Card, PayPal, SEPA, bonifico', naming: 'S.r.l. or S.p.A.', dateFormat: 'DD/MM/YYYY' },
  NL: { locale: 'nl-NL', taxLabel: 'BTW', taxRate: '21% (9% reduced)', idLabel: 'BTW-id and KvK number', address: 'Herengracht 182, 1016 BR Amsterdam', phone: '+31 20 555 0142', payments: 'Card, iDEAL, PayPal, SEPA', naming: 'B.V. or V.O.F.', dateFormat: 'DD-MM-YYYY' },
  CH: { locale: 'de-CH', taxLabel: 'MWST (VAT)', taxRate: '8.1% (3.8% reduced)', idLabel: 'MWST number and UID', address: 'Bahnhofstrasse 25, 8001 Zürich', phone: '+41 44 555 01 42', payments: 'Card, PayPal, TWINT, PostFinance', naming: 'GmbH, AG or Kollektivgesellschaft', dateFormat: 'DD.MM.YYYY' },
  SE: { locale: 'sv-SE', taxLabel: 'Moms', taxRate: '25% (12% and 6% reduced)', idLabel: 'Momsregistreringsnummer and org.nr', address: 'Sveavägen 44, 111 34 Stockholm', phone: '+46 8 555 014 20', payments: 'Card, Swish, Klarna, SEPA', naming: 'AB, HB or KB', dateFormat: 'YYYY-MM-DD' },
  PL: { locale: 'pl-PL', taxLabel: 'VAT', taxRate: '23% (8% and 5% reduced)', idLabel: 'NIP and REGON', address: 'Chmielna 22, 00-020 Warsaw', phone: '+48 22 555 0142', payments: 'Card, BLIK, PayPal, SEPA', naming: 'sp. z o.o. or S.A.', dateFormat: 'DD.MM.YYYY' },
  IE: { locale: 'en-IE', taxLabel: 'VAT', taxRate: '23% (13.5% and 9% reduced)', idLabel: 'VAT number and CRO number', address: '2 Grand Canal Square, Dublin 2', phone: '+353 1 555 0142', payments: 'Card, PayPal, SEPA, Google Pay', naming: 'Ltd, DAC or PLC', dateFormat: 'DD/MM/YYYY' },
  TR: { locale: 'tr-TR', taxLabel: 'KDV', taxRate: '20% (10% reduced)', idLabel: 'VKN and MERSIS number', address: 'Levent Mahallesi, Istanbul', phone: '+90 212 555 0142', payments: 'Card, Papara, bank transfer', naming: 'Ltd. Şti. or A.Ş.', dateFormat: 'DD.MM.YYYY' },
  BR: { locale: 'pt-BR', taxLabel: 'ICMS and ISS', taxRate: 'ICMS 12–18% by state, ISS 2–5%', idLabel: 'CNPJ and state registration', address: 'Av. Paulista 1000, São Paulo', phone: '+55 11 5555 0142', payments: 'Card, Pix, boleto, PayPal', naming: 'LTDA, MEI or S.A.', dateFormat: 'DD/MM/YYYY' },
  MX: { locale: 'es-MX', taxLabel: 'IVA', taxRate: '16%', idLabel: 'RFC', address: 'Av. Álvaro Obregón 121, Mexico City', phone: '+52 55 5555 0142', payments: 'Card, SPEI, OXXO, Mercado Pago', naming: 'S.A. de C.V. or S. de R.L.', dateFormat: 'DD/MM/YYYY' },
  AR: { locale: 'es-AR', taxLabel: 'IVA', taxRate: '21%', idLabel: 'CUIT', address: 'Av. Corrientes 800, Buenos Aires', phone: '+54 11 5555 0142', payments: 'Card, Mercado Pago, transfer, Rapipago', naming: 'S.R.L., S.A. or S.A.S.', dateFormat: 'DD/MM/YYYY' },
  CO: { locale: 'es-CO', taxLabel: 'IVA', taxRate: '19%', idLabel: 'NIT', address: 'Carrera 7 # 32-16, Bogotá', phone: '+57 1 555 0142', payments: 'Card, Nequi, PSE, Wompi', naming: 'S.A.S. or Ltda.', dateFormat: 'DD/MM/YYYY' },
  CL: { locale: 'es-CL', taxLabel: 'IVA', taxRate: '19%', idLabel: 'RUT', address: 'Av. Andrés Bello 10, Santiago', phone: '+56 2 2555 0142', payments: 'Card, Mercado Pago, transfer', naming: 'SpA or Ltda.', dateFormat: 'DD-MM-YYYY' },
  PT: { locale: 'pt-PT', taxLabel: 'IVA', taxRate: '23% (13% and 6% reduced)', idLabel: 'NIF', address: 'Av. da Liberdade 110, Lisbon', phone: '+351 21 555 0142', payments: 'Card, MB Way, PayPal, SEPA', naming: 'Lda., Unipessoal Lda. or S.A.', dateFormat: 'DD/MM/YYYY' },
  GR: { locale: 'el-GR', taxLabel: 'ΦΠΑ (VAT)', taxRate: '24% (13% and 6% reduced)', idLabel: 'ΑΦΜ (tax number)', address: 'Leoforos Vasilissis Sofias 64, Athens', phone: '+30 21 5550 0142', payments: 'Card, Viva Wallet, PayPal, bank transfer', naming: 'Α.Ε., Ε.Π.Ε. or Ι.Κ.Ε.', dateFormat: 'DD/MM/YYYY' },
  NO: { locale: 'nb-NO', taxLabel: 'MVA (VAT)', taxRate: '25% (12% and 6% reduced)', idLabel: 'Organisasjonsnummer', address: 'Karl Johans gate 12, 0159 Oslo', phone: '+47 22 55 50 14', payments: 'Card, Vipps, PayPal, Klarna', naming: 'AS, ENK or ANS', dateFormat: 'DD.MM.YYYY' },
  DK: { locale: 'da-DK', taxLabel: 'Moms', taxRate: '25%', idLabel: 'CVR-nummer', address: 'Strøget 8, 1160 Copenhagen', phone: '+45 32 55 50 14', payments: 'Card, MobilePay, PayPal, SEPA', naming: 'A/S, ApS or I/S', dateFormat: 'DD-MM-YYYY' },
  FI: { locale: 'fi-FI', taxLabel: 'ALV', taxRate: '25.5% (14% and 10% reduced)', idLabel: 'Y-tunnus (business ID)', address: 'Mannerheimintie 4, 00100 Helsinki', phone: '+358 9 555 0142', payments: 'Card, MobilePay, PayPal, SEPA', naming: 'Oy, Oyj or Ky', dateFormat: 'DD.MM.YYYY' },
  AT: { locale: 'de-AT', taxLabel: 'USt', taxRate: '20% (13% and 10% reduced)', idLabel: 'UID and Firmenbuchnummer', address: 'Ringstraße 14, 1010 Vienna', phone: '+43 1 555 0142', payments: 'Card, PayPal, Klarna, SEPA', naming: 'GmbH, OG or Ges.m.b.H.', dateFormat: 'DD.MM.YYYY' },
  BE: { locale: 'nl-BE', taxLabel: 'BTW / TVA', taxRate: '21% (12% and 6% reduced)', idLabel: 'BTW-nummer and enterprise number', address: 'Meir 42, 2000 Antwerp', phone: '+32 3 555 01 42', payments: 'Card, Bancontact, PayPal, SEPA', naming: 'BVBA, NV or SA', dateFormat: 'DD/MM/YYYY' },
  CZ: { locale: 'cs-CZ', taxLabel: 'DPH', taxRate: '21% (12% reduced)', idLabel: 'IČO and DIČ', address: 'Na Příkopě 18, 110 00 Prague', phone: '+420 2 2555 0142', payments: 'Card, payment gateway, PayPal', naming: 's.r.o. or a.s.', dateFormat: 'DD.MM.YYYY' },
  RO: { locale: 'ro-RO', taxLabel: 'TVA', taxRate: '21% (11% reduced)', idLabel: 'CUI and fiscal registration', address: 'Bulevardul Unirii 12, Bucharest', phone: '+40 21 555 0142', payments: 'Card, PayPal, bank transfer', naming: 'SRL, SA or PFA', dateFormat: 'DD.MM.YYYY' },
  JO: { locale: 'ar-JO', taxLabel: 'VAT', taxRate: '16%', idLabel: 'Sales tax registration number', address: 'Abdali, Amman', phone: '+962 6 555 0142', payments: 'Card, Apple Pay, bank transfer', naming: 'LLC', dateFormat: 'DD/MM/YYYY' },
  LB: { locale: 'ar-LB', taxLabel: 'VAT', taxRate: '11%', idLabel: 'Commercial register number', address: 'Badaro, Beirut', phone: '+961 1 555 0142', payments: 'Card, OMT, bank transfer', naming: 'S.A.L.', dateFormat: 'DD/MM/YYYY' },
  MA: { locale: 'ar-MA', taxLabel: 'TVA', taxRate: '20% (14% and 7% reduced)', idLabel: 'ICE (tax number)', address: 'Boulevard Mohammed V, Casablanca', phone: '+212 5 22 55 01 42', payments: 'Card, Wafacash, bank transfer', naming: 'SARL or SA', dateFormat: 'DD/MM/YYYY' },
  DZ: { locale: 'ar-DZ', taxLabel: 'TVA', taxRate: '19% (9% reduced)', idLabel: 'NIF', address: 'Boulevard Krim Belkacem, Algiers', phone: '+213 21 555 01 42', payments: 'Card, Edahabia CIB, bank transfer', naming: 'SARL or SPA', dateFormat: 'DD/MM/YYYY' },
  TN: { locale: 'ar-TN', taxLabel: 'TVA', taxRate: '19% (13% and 7% reduced)', idLabel: 'Matricule fiscal', address: 'Avenue Habib Bourguiba, Tunis', phone: '+216 71 555 014', payments: 'Card, e-Dinar, bank transfer', naming: 'SARL, SUARL or SA', dateFormat: 'DD/MM/YYYY' },
  GH: { locale: 'en-GH', taxLabel: 'VAT', taxRate: '15%', idLabel: 'TIN and VAT registration', address: 'Airport City, Accra', phone: '+233 30 555 0142', payments: 'Card, Mobile Money, bank transfer', naming: 'Ltd', dateFormat: 'DD/MM/YYYY' },
  TZ: { locale: 'sw-TZ', taxLabel: 'VAT', taxRate: '18%', idLabel: 'TIN', address: 'Othman Tower, Dar es Salaam', phone: '+255 22 555 0142', payments: 'Card, M-Pesa, Tigo Pesa, bank transfer', naming: 'Co. Ltd', dateFormat: 'DD/MM/YYYY' },
  UG: { locale: 'en-UG', taxLabel: 'VAT', taxRate: '18%', idLabel: 'TIN', address: 'Kampala Road, Kampala', phone: '+256 41 555 0142', payments: 'Card, Mobile Money, bank transfer', naming: 'Ltd', dateFormat: 'DD/MM/YYYY' },
  ET: { locale: 'am-ET', taxLabel: 'VAT', taxRate: '15%', idLabel: 'TIN', address: 'Bole Road, Addis Ababa', phone: '+251 11 555 0142', payments: 'Card, Telebirr, bank transfer', naming: 'PLC or PLC', dateFormat: 'DD/MM/YYYY' },
  HK: { locale: 'zh-HK', taxLabel: 'Profits tax (no VAT or GST)', taxRate: '8.25% (5% on the first HK$2M)', idLabel: 'Business registration (BR) number', address: '8 Queens Road Central, Hong Kong', phone: '+852 2555 0142', payments: 'Card, PayPal, FPS, AlipayHK', naming: 'Limited', dateFormat: 'DD/MM/YYYY' },
  TW: { locale: 'zh-TW', taxLabel: 'Business tax', taxRate: '5%', idLabel: 'Uniform business number', address: '101 Taipei Road, Taipei 100', phone: '+886 2 5555 0142', payments: 'Card, LINE Pay, bank transfer', naming: '有限公司 or 股份有限公司', dateFormat: 'YYYY/MM/DD' },
  NP: { locale: 'ne-NP', taxLabel: 'VAT', taxRate: '13%', idLabel: 'PAN and VAT number', address: 'Lazimpat, Kathmandu 44600', phone: '+977 1 555 0142', payments: 'Card, eSewa, Khalti, bank transfer', naming: 'Pvt Ltd', dateFormat: 'DD/MM/YYYY' },
  LK: { locale: 'si-LK', taxLabel: 'VAT', taxRate: '18%', idLabel: 'TIN and VAT registration number', address: '295 Galle Road, Colombo 03', phone: '+94 11 555 0142', payments: 'Card, PayHere, bank transfer', naming: '(Pvt) Ltd or PLC', dateFormat: 'DD/MM/YYYY' },
  KH: { locale: 'km-KH', taxLabel: 'VAT', taxRate: '10%', idLabel: 'TIN (tax identification number)', address: 'Preah Norodom Blvd, Phnom Penh', phone: '+855 23 555 0142', payments: 'Card, PiPay, Wing, bank transfer', naming: 'Co., Ltd.', dateFormat: 'DD/MM/YYYY' },
  KZ: { locale: 'kk-KZ', taxLabel: 'НДС (VAT)', taxRate: '12%', idLabel: 'BIN (business identification number)', address: '18 Dostyk Avenue, Almaty', phone: '+7 727 555 0142', payments: 'Card, Kaspi, bank transfer', naming: 'ТОО or АО', dateFormat: 'DD.MM.YYYY' },
  UZ: { locale: 'uz-UZ', taxLabel: 'QQS (VAT)', taxRate: '12%', idLabel: 'STIR (tax identification number)', address: 'Tashkent City, Tashkent', phone: '+998 71 555 0142', payments: 'Card, Humo, Uzcard, bank transfer', naming: 'MCHJ or LLC', dateFormat: 'DD.MM.YYYY' },
  PE: { locale: 'es-PE', taxLabel: 'IGV (VAT)', taxRate: '18%', idLabel: 'RUC', address: 'Av. Javier Prado Este 4200, Lima', phone: '+51 1 555 0142', payments: 'Card, Yape, Plin, bank transfer', naming: 'S.A.C. or E.I.R.L.', dateFormat: 'DD/MM/YYYY' },
  CR: { locale: 'es-CR', taxLabel: 'IVA', taxRate: '13%', idLabel: 'Cédula jurídica', address: 'Avenida Central, San José', phone: '+506 2 555 0142', payments: 'Card, SINPE Móvil, bank transfer', naming: 'S.A. or S.R.L.', dateFormat: 'DD/MM/YYYY' },
  PA: { locale: 'es-PA', taxLabel: 'ITBMS', taxRate: '7%', idLabel: 'RUC', address: 'Avenida Balboa, Panama City', phone: '+507 500 0142', payments: 'Card, Yappi, bank transfer', naming: 'S.A. or S.R.L.', dateFormat: 'DD/MM/YYYY' },
  DO: { locale: 'es-DO', taxLabel: 'ITBIS', taxRate: '18%', idLabel: 'RNC (national taxpayer registry)', address: 'Av. Independencia, Santo Domingo', phone: '+1 809 555 0142', payments: 'Card, internet banking, bank transfer', naming: 'S.A. or S.R.L.', dateFormat: 'DD/MM/YYYY' },
  EC: { locale: 'es-EC', taxLabel: 'IVA', taxRate: '15%', idLabel: 'RUC', address: 'Av. República del Salvador, Quito', phone: '+593 2 555 0142', payments: 'Card, PayPal, transfer', naming: 'Cía. Ltda. or S.A.', dateFormat: 'DD/MM/YYYY' },
  FJ: { locale: 'en-FJ', taxLabel: 'VAT', taxRate: '9%', idLabel: 'TIN and FICA number', address: 'Victoria Parade, Suva', phone: '+679 555 0142', payments: 'Card, bank transfer, cash', naming: 'Pty Ltd or Ltd', dateFormat: 'DD/MM/YYYY' },
  IS: { locale: 'is-IS', taxLabel: 'VSK (VAT)', taxRate: '24% (14% reduced)', idLabel: 'VSK and kennitala', address: 'Laugavegur 12, 101 Reykjavík', phone: '+354 555 0142', payments: 'Card, PayPal, bank transfer', naming: 'ehf., hf. or slf.', dateFormat: 'DD.MM.YYYY' },
  UY: { locale: 'es-UY', taxLabel: 'IVA', taxRate: '22%', idLabel: 'RUT', address: 'Avenida 18 de Julio 1000, Montevideo', phone: '+598 2 555 0142', payments: 'Card, Mercado Pago, transfer', naming: 'S.A. or S.R.L.', dateFormat: 'DD/MM/YYYY' },
  PY: { locale: 'es-PY', taxLabel: 'IVA', taxRate: '10%', idLabel: 'RUC', address: 'Av. Eusebio Ayala 2000, Asunción', phone: '+595 21 555 0142', payments: 'Card, bank transfer', naming: 'S.A. or S.R.L.', dateFormat: 'DD/MM/YYYY' },
};

/** Local context for a country, falling back to a US-shaped default. */
export function localContext(code: string): LocalContext {
  return (
    LOCAL_CONTEXT[code] || {
      locale: 'en-US',
      taxLabel: 'Local consumption tax',
      taxRate: 'market rate',
      idLabel: 'Business registration number',
      address: '1 Example Street, City',
      phone: '+00 000 000 000',
      payments: 'Card, PayPal, bank transfer',
      naming: 'Ltd or equivalent local form',
      dateFormat: 'DD/MM/YYYY',
    }
  );
}
