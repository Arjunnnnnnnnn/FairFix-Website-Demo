/**
 * ALL SIGN-UP DATA LIVES HERE: option lists for the resident and business sign-up forms,
 * in English and Arabic, plus the sample details the "Fill sample details" demo button uses.
 * Form labels and messages are in src/lib/i18n.ts under `auth`.
 * Nothing here is real: sign-up is a front-end prototype with no backend, SMS or uploads.
 */
import type { L } from "./demo";
import { technicians } from "./demo";

/** Qatar's eight municipalities. */
export const AREAS = [
  { id: "doha", label: { en: "Doha", ar: "الدوحة" } },
  { id: "rayyan", label: { en: "Al Rayyan", ar: "الريان" } },
  { id: "wakrah", label: { en: "Al Wakrah", ar: "الوكرة" } },
  { id: "daayen", label: { en: "Al Daayen (Lusail)", ar: "الضعاين (لوسيل)" } },
  { id: "ummsalal", label: { en: "Umm Salal", ar: "أم صلال" } },
  { id: "khor", label: { en: "Al Khor", ar: "الخور" } },
  { id: "shamal", label: { en: "Al Shamal", ar: "الشمال" } },
  { id: "shahaniya", label: { en: "Al Shahaniya", ar: "الشحانية" } },
] as const satisfies readonly { id: string; label: L }[];
export type AreaId = (typeof AREAS)[number]["id"];

export const HOME_TYPES = [
  { id: "apartment", label: { en: "Apartment", ar: "شقة" } },
  { id: "villa", label: { en: "Villa", ar: "فيلا" } },
  { id: "compound", label: { en: "Compound villa", ar: "فيلا في مجمّع" } },
] as const satisfies readonly { id: string; label: L }[];
export type HomeType = (typeof HOME_TYPES)[number]["id"];

/** Trades a partner company can offer. */
export const SERVICES = [
  { id: "ac", label: { en: "AC & refrigeration", ar: "تكييف وتبريد" } },
  { id: "plumb", label: { en: "Plumbing", ar: "سباكة" } },
  { id: "elec", label: { en: "Electrical", ar: "كهرباء" } },
  { id: "appliance", label: { en: "Appliances", ar: "أجهزة منزلية" } },
  { id: "handy", label: { en: "Handyman & carpentry", ar: "صيانة عامة ونجارة" } },
  { id: "paint", label: { en: "Painting", ar: "دهان" } },
  { id: "pest", label: { en: "Pest control", ar: "مكافحة الحشرات" } },
] as const satisfies readonly { id: string; label: L }[];
export type ServiceId = (typeof SERVICES)[number]["id"];

export const TEAM_SIZES = ["1–5", "6–20", "21–50", "50+"] as const;
export const UNIT_COUNTS = ["1–10", "11–50", "51–200", "200+"] as const;

export const ORG_TYPES = [
  { id: "landlord", label: { en: "Landlord", ar: "مالك عقارات" } },
  { id: "manager", label: { en: "Property management", ar: "إدارة عقارات" } },
  { id: "school", label: { en: "School", ar: "مدرسة" } },
  { id: "facilities", label: { en: "Facilities management", ar: "إدارة مرافق" } },
  { id: "other", label: { en: "Other", ar: "أخرى" } },
] as const satisfies readonly { id: string; label: L }[];
export type OrgType = (typeof ORG_TYPES)[number]["id"];

export type BizType = "partner" | "property";
export type DocKey = "cr" | "licence" | "insurance" | "ids";

/** Every field on the business form. Files are kept as names only: nothing is uploaded. */
export type BizForm = {
  type: BizType;
  name: string;
  cr: string;
  licence: string;
  orgType: OrgType | "";
  services: ServiceId[];
  team: string;
  units: string;
  areas: AreaId[];
  insurance: boolean;
  contactName: string;
  role: string;
  email: string;
  mobile: string;
  docs: Partial<Record<DocKey, string>>;
  agree: boolean;
};

export const EMPTY_BIZ: BizForm = {
  type: "partner", name: "", cr: "", licence: "", orgType: "", services: [], team: "", units: "",
  areas: [], insurance: false, contactName: "", role: "", email: "", mobile: "", docs: {}, agree: false,
};

/** Obviously fake sample details for the showcase. The partner reuses a demo company from demo.ts. */
export const SAMPLE_BIZ: Record<BizType, BizForm> = {
  partner: {
    ...EMPTY_BIZ,
    type: "partner",
    name: technicians.ac.company,
    cr: "123456",
    licence: "987654",
    services: ["ac", "plumb", "elec"],
    team: "6–20",
    areas: ["doha", "rayyan", "daayen"],
    insurance: true,
    contactName: technicians.handy.name,
    role: "Operations manager",
    email: "ops@frostbyte.example",
    mobile: "55012345",
    docs: { cr: "cr-certificate-sample.pdf", licence: "trade-licence-sample.pdf", insurance: "insurance-sample.pdf" },
    agree: true,
  },
  property: {
    ...EMPTY_BIZ,
    type: "property",
    name: "Sample Homes Demo Properties",
    cr: "654321",
    orgType: "manager",
    units: "51–200",
    areas: ["doha", "daayen"],
    contactName: technicians.appliance.name,
    role: "Facilities lead",
    email: "facilities@samplehomes.example",
    mobile: "33012345",
    docs: { cr: "cr-certificate-sample.pdf" },
    agree: true,
  },
};

/** Sample partner ID shown on the demo approval card. */
export const SAMPLE_PARTNER_ID = "FF-VP-0042";

/** Qatar mobile numbers: 8 digits starting with 3, 5, 6 or 7. */
export const QA_MOBILE = /^[3567]\d{7}$/;
export const onlyDigits = (s: string) => s.replace(/\D/g, "");
/** "55012345" → "5501 2345" */
export const formatQaMobile = (digits: string) => (digits.length > 4 ? `${digits.slice(0, 4)} ${digits.slice(4, 8)}` : digits);
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
