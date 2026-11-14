/**
 * ALL PRICING DATA LIVES HERE: plan names, prices, features and the comparison table,
 * in English and Arabic. Every price is a SAMPLE for the hackathon prototype.
 * Section labels (headline, toggle, notes) are in src/lib/i18n.ts under `pricing`.
 */
import type { L } from "./demo";

export type Billing = "monthly" | "yearly";
export type PlanId = "free" | "plus" | "apartment" | "villa";
export type CtaStyle = "primary" | "outline" | "onMaroon";

export type Plan = {
  id: PlanId;
  name: L;
  /** Brand names (e.g. "FairFix Plus") stay in Latin letters in Arabic too. */
  brandName?: boolean;
  subtitle: L;
  /** QAR. Free stays 0 for both. */
  price: Record<Billing, number>;
  features: L[];
  cta: L;
  ctaStyle: CtaStyle;
  href: string;
  popular?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: { en: "Free", ar: "مجاني" },
    subtitle: { en: "For every resident", ar: "لكل مقيم" },
    price: { monthly: 0, yearly: 0 },
    features: [
      { en: "Unlimited AI diagnosis", ar: "تشخيص غير محدود بالذكاء الاصطناعي" },
      { en: "Fair price ranges", ar: "نطاقات أسعار عادلة" },
      { en: "Book verified technicians", ar: "حجز فنيين موثّقين" },
      { en: "30-day re-fix guarantee", ar: "ضمان إعادة الإصلاح ٣٠ يوماً" },
    ],
    cta: { en: "Start free", ar: "ابدأ مجاناً" },
    ctaStyle: "primary",
    href: "/signup?plan=free",
  },
  {
    id: "plus",
    name: { en: "FairFix Plus", ar: "FairFix Plus" },
    brandName: true,
    subtitle: { en: "Whole-home membership", ar: "عضوية للمنزل بالكامل" },
    price: { monthly: 25, yearly: 249 },
    features: [
      { en: "Everything in Free", ar: "كل ما في الخطة المجانية" },
      { en: "No call-out or visit fees", ar: "بدون رسوم استدعاء أو زيارة" },
      { en: "10% off every job (plumbing, electrical, appliances and more)", ar: "خصم ١٠٪ على كل عمل (سباكة، كهرباء، أجهزة والمزيد)" },
      { en: "Priority booking", ar: "أولوية في الحجز" },
      { en: "90-day re-fix guarantee", ar: "ضمان إعادة الإصلاح ٩٠ يوماً" },
      { en: "1 free home check-up per year", ar: "فحص منزلي مجاني واحد سنوياً" },
    ],
    cta: { en: "Join Plus", ar: "انضم إلى Plus" },
    ctaStyle: "outline",
    href: "/signup?plan=plus",
  },
  {
    id: "apartment",
    name: { en: "Apartment Care", ar: "رعاية الشقة" },
    subtitle: { en: "Up to 3 AC units", ar: "حتى ٣ وحدات تكييف" },
    price: { monthly: 55, yearly: 549 },
    features: [
      { en: "Everything in Plus", ar: "كل ما في Plus" },
      { en: "2 AC services per year", ar: "صيانتان للمكيّفات سنوياً" },
      { en: "Filter & gas checks", ar: "فحص الفلتر والغاز" },
      { en: "Pre-summer plumbing & electrical check", ar: "فحص السباكة والكهرباء قبل الصيف" },
      { en: "Lower energy bills", ar: "فواتير طاقة أقل" },
    ],
    cta: { en: "Get Apartment Care", ar: "احصل على رعاية الشقة" },
    ctaStyle: "onMaroon",
    href: "/signup?plan=apartment",
    popular: true,
  },
  {
    id: "villa",
    name: { en: "Villa Care", ar: "رعاية الفيلا" },
    subtitle: { en: "Up to 7 AC units", ar: "حتى ٧ وحدات تكييف" },
    price: { monthly: 99, yearly: 999 },
    features: [
      { en: "Everything in Apartment Care", ar: "كل ما في رعاية الشقة" },
      { en: "Covers up to 7 AC units", ar: "تغطية حتى ٧ وحدات تكييف" },
      { en: "Water heater & water tank check", ar: "فحص سخان الماء وخزان المياه" },
      { en: "Dedicated booking line in peak season", ar: "خط حجز مخصص في موسم الذروة" },
    ],
    cta: { en: "Get Villa Care", ar: "احصل على رعاية الفيلا" },
    ctaStyle: "outline",
    href: "/signup?plan=villa",
  },
];

export const businessPlan = {
  name: { en: "Business", ar: "الأعمال" },
  subtitle: { en: "Landlords, property managers, schools", ar: "الملّاك ومديرو العقارات والمدارس" },
  features: [
    { en: "Multi-property dashboard", ar: "لوحة متعددة العقارات" },
    { en: "Bulk job scheduling", ar: "جدولة جماعية للأعمال" },
    { en: "Compliance reports", ar: "تقارير الامتثال" },
    { en: "Dedicated support", ar: "دعم مخصص" },
  ],
  cta: { en: "Contact us", ar: "تواصل معنا" },
  href: "/signup/business?type=property",
} satisfies { name: L; subtitle: L; features: L[]; cta: L; href: string };

/** Default billing period shown first. */
export const DEFAULT_BILLING: Billing = "yearly";

/**
 * Comparison table, columns in the same order as `plans` (Free, Plus, Apartment Care, Villa Care).
 * true = included (maroon check), false = not included (dash), or a short label.
 */
export type CompareCell = boolean | L;
const v = (en: string, ar: string): L => ({ en, ar });

export const planComparison: { label: L; cells: [CompareCell, CompareCell, CompareCell, CompareCell] }[] = [
  { label: v("AI diagnosis", "التشخيص بالذكاء الاصطناعي"), cells: [true, true, true, true] },
  { label: v("Verified technicians", "فنيون موثّقون"), cells: [true, true, true, true] },
  { label: v("Visit fees", "رسوم الزيارة"), cells: [v("Standard", "عادية"), v("None", "بدون"), v("None", "بدون"), v("None", "بدون")] },
  { label: v("Discount on jobs", "خصم على الأعمال"), cells: [false, v("10%", "١٠٪"), v("10%", "١٠٪"), v("10%", "١٠٪")] },
  { label: v("Re-fix guarantee", "ضمان إعادة الإصلاح"), cells: [v("30 days", "٣٠ يوماً"), v("90 days", "٩٠ يوماً"), v("90 days", "٩٠ يوماً"), v("90 days", "٩٠ يوماً")] },
  { label: v("AC services / year", "صيانة المكيّفات سنوياً"), cells: [false, false, v("2", "٢"), v("2", "٢")] },
  { label: v("AC units covered", "وحدات التكييف المشمولة"), cells: [false, false, v("Up to 3", "حتى ٣"), v("Up to 7", "حتى ٧")] },
  { label: v("Home check-up", "فحص المنزل"), cells: [false, v("1 / year", "مرة سنوياً"), v("1 / year + pre-summer", "مرة سنوياً + قبل الصيف"), v("1 / year + pre-summer", "مرة سنوياً + قبل الصيف")] },
  { label: v("Priority booking", "أولوية الحجز"), cells: [false, true, true, true] },
];
