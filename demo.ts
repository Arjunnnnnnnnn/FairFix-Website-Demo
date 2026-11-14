/**
 * ALL DEMO DATA LIVES HERE — edit prices, technicians and diagnoses freely.
 * Every price is a SAMPLE for the hackathon prototype, not real market data.
 */
import acImg from "@/assets/problem-ac.jpg";
import sinkImg from "@/assets/problem-sink.jpg";
import breakerImg from "@/assets/problem-breaker.jpg";
import drainImg from "@/assets/problem-drain.jpg";

export const APP_NAME = "FairFix";
export const APP_NAME_AR = "FairFix";
export const TEAM = {
  name: "Team FairFix",
  school: "DPS-Modern Indian School, Doha",
  hackathon: "School Hackathon 2026 · Public Services & Government Systems",
};

export type L = { en: string; ar: string };
export type Urgency = "safe" | "today" | "danger";

export type Technician = {
  id: string;
  name: string;
  initials: string;
  company: string;
  trades: L[];
  rating: number;
  jobs: number;
  licence: string;
};

export const technicians = {
  ac: { id: "QA-TEC-20431", name: "Ravi Example", initials: "RE", company: "Frostbyte Demo Cooling Co.", trades: [{ en: "AC & refrigeration", ar: "تكييف وتبريد" }], rating: 4.9, jobs: 312, licence: "Sample licence DEMO-0001" },
  plumb: { id: "QA-TEC-18820", name: "Joey Sampleton", initials: "JS", company: "Drippy Fixers Sample Plumbing", trades: [{ en: "Plumbing", ar: "سباكة" }, { en: "Drainage", ar: "تصريف" }], rating: 4.8, jobs: 204, licence: "Sample licence DEMO-0002" },
  elec: { id: "QA-TEC-21907", name: "Omar Demo", initials: "OD", company: "Sparkplug Imaginary Electrical", trades: [{ en: "Electrical (licensed)", ar: "كهرباء (مرخّص)" }], rating: 4.9, jobs: 268, licence: "Sample licence DEMO-0003" },
  appliance: { id: "QA-TEC-22514", name: "Lina Testcase", initials: "LT", company: "Whirr Sample Appliance Repairs", trades: [{ en: "Home appliances", ar: "أجهزة منزلية" }], rating: 4.7, jobs: 157, licence: "Sample licence DEMO-0004" },
  handy: { id: "QA-TEC-19376", name: "Sam Placeholder", initials: "SP", company: "Toolbox Demo Handyman Services", trades: [{ en: "General maintenance", ar: "صيانة عامة" }], rating: 4.8, jobs: 389, licence: "Sample licence DEMO-0005" },
} satisfies Record<string, Technician>;

export type Trade = keyof typeof technicians;

/**
 * SAMPLE fair-price table (QAR, labour + typical minor parts) used by the AI scan.
 * The AI only picks the job type; the price shown comes from here, so these
 * ranges are what to edit before presenting. Not real market data.
 * `hint` tells the AI when to choose the job type (English only, not shown on the site).
 */
export const jobPrices = {
  ac_filter_service: { label: { en: "AC cleaning / general service", ar: "تنظيف المكيّف / صيانة عامة" }, trade: "ac", min: 120, max: 200, hint: "dirty filters or coils, weak airflow, routine AC service" },
  ac_gas_refill: { label: { en: "AC refrigerant leak / gas top-up", ar: "تسرّب غاز المكيّف / تعبئة" }, trade: "ac", min: 180, max: 260, hint: "AC runs but blows warm air, ice on pipes or coils" },
  ac_drain_leak: { label: { en: "AC water leak / blocked drain line", ar: "تسريب ماء من المكيّف / انسداد التصريف" }, trade: "ac", min: 80, max: 150, hint: "water dripping from an indoor AC unit, stains below it" },
  ac_major_fault: { label: { en: "AC major fault (compressor / fan motor)", ar: "عطل كبير في المكيّف (ضاغط / محرك)" }, trade: "ac", min: 600, max: 1500, hint: "outdoor unit dead, burnt smell, loud grinding, compressor failure" },
  plumbing_minor_leak: { label: { en: "Minor plumbing leak (tap, trap, hose)", ar: "تسرّب سباكة بسيط (حنفية، سيفون، خرطوم)" }, trade: "plumb", min: 60, max: 120, hint: "dripping tap, leaking sink trap, flexible hose, washer" },
  plumbing_pipe_leak: { label: { en: "Pipe leak / burst pipe", ar: "تسرّب أو انفجار أنبوب" }, trade: "plumb", min: 200, max: 600, hint: "leak from a wall, ceiling or main pipe, water pooling" },
  toilet_repair: { label: { en: "Toilet / flush repair", ar: "إصلاح المرحاض / السيفون" }, trade: "plumb", min: 80, max: 180, hint: "running cistern, broken flush, leaking toilet base" },
  water_heater: { label: { en: "Water heater repair", ar: "إصلاح سخان الماء" }, trade: "plumb", min: 150, max: 350, hint: "no hot water, leaking or rusted geyser/water heater" },
  drain_minor_clog: { label: { en: "Blocked sink / shower drain", ar: "انسداد مصرف مغسلة / دش" }, trade: "plumb", min: 80, max: 150, hint: "standing water in one sink, shower or floor drain" },
  drain_main_blockage: { label: { en: "Main drain / sewage blockage", ar: "انسداد التصريف الرئيسي / الصرف الصحي" }, trade: "plumb", min: 200, max: 450, hint: "several drains backing up, sewage smell, overflowing manhole" },
  electrical_breaker: { label: { en: "Tripping breaker / power loss", ar: "قاطع يفصل / انقطاع الكهرباء" }, trade: "elec", min: 150, max: 350, hint: "breaker or RCD keeps tripping, part of the home has no power" },
  electrical_socket_switch: { label: { en: "Socket or switch repair", ar: "إصلاح مقبس أو مفتاح" }, trade: "elec", min: 60, max: 150, hint: "loose, cracked, scorched or dead socket or switch" },
  electrical_lighting: { label: { en: "Light fitting repair", ar: "إصلاح وحدة إضاءة" }, trade: "elec", min: 60, max: 180, hint: "flickering or dead light fitting, ceiling light, fan light" },
  electrical_wiring_fault: { label: { en: "Wiring fault / burning smell", ar: "عطل في الأسلاك / رائحة احتراق" }, trade: "elec", min: 250, max: 700, hint: "exposed or melted wires, scorch marks, sparking, burning smell" },
  appliance_washer: { label: { en: "Washing machine / dryer repair", ar: "إصلاح غسالة / مجفف" }, trade: "appliance", min: 150, max: 400, hint: "washing machine or dryer not draining, spinning or starting" },
  appliance_fridge: { label: { en: "Fridge / freezer repair", ar: "إصلاح ثلاجة / فريزر" }, trade: "appliance", min: 150, max: 450, hint: "fridge not cooling, leaking, frosting up" },
  appliance_other: { label: { en: "Other appliance repair", ar: "إصلاح جهاز منزلي آخر" }, trade: "appliance", min: 100, max: 300, hint: "oven, cooker, dishwasher, microwave or other appliance fault" },
  door_lock_carpentry: { label: { en: "Door, lock or cabinet repair", ar: "إصلاح باب أو قفل أو خزانة" }, trade: "handy", min: 60, max: 180, hint: "stuck or broken door, lock, hinge, cabinet or drawer" },
  wall_paint_patch: { label: { en: "Wall crack / patch and paint", ar: "تشقق جدار / ترميم ودهان" }, trade: "handy", min: 150, max: 600, hint: "cosmetic cracks, holes, peeling paint, minor plaster damage" },
  damp_mould: { label: { en: "Damp or mould treatment", ar: "معالجة الرطوبة أو العفن" }, trade: "handy", min: 200, max: 800, hint: "damp patches, mould or mildew on walls or ceilings" },
  pest_control: { label: { en: "Pest control", ar: "مكافحة الحشرات" }, trade: "handy", min: 150, max: 350, hint: "cockroaches, ants, bed bugs, rodents or their signs" },
} satisfies Record<string, { label: L; trade: Trade; min: number; max: number; hint: string }>;

export type JobKey = keyof typeof jobPrices;
export const JOB_KEYS = Object.keys(jobPrices) as JobKey[];

export type Problem = {
  id: string;
  label: L;
  image: string;
  diagnosis: L;
  detail: L;
  confidence: number;
  urgency: Urgency;
  priceMin: number;
  priceMax: number;
  diy: boolean;
  tips: L[];
  technician: Technician;
};

export const problems: Problem[] = [
  {
    id: "ac", label: { en: "AC not cooling", ar: "المكيّف لا يبرّد" }, image: acImg,
    diagnosis: { en: "Likely low refrigerant", ar: "على الأرجح نقص في غاز التبريد" },
    detail: { en: "Warm airflow with water staining below the unit suggests a refrigerant leak and a blocked drain line.", ar: "الهواء الدافئ مع آثار الماء أسفل الوحدة يشير إلى تسرّب في الغاز وانسداد خط التصريف." },
    confidence: 87, urgency: "today", priceMin: 180, priceMax: 260, diy: false,
    tips: [
      { en: "Clean or replace the air filter while you wait", ar: "نظّف فلتر الهواء أثناء الانتظار" },
      { en: "Set the unit to fan-only to avoid ice build-up", ar: "شغّل وضع المروحة فقط لتجنّب التجمّد" },
    ],
    technician: technicians.ac,
  },
  {
    id: "sink", label: { en: "Leaking sink", ar: "تسرّب تحت المغسلة" }, image: sinkImg,
    diagnosis: { en: "Loose slip-joint nut on P-trap", ar: "صامولة وصلة السيفون مرتخية" },
    detail: { en: "Droplets form at the trap joint. Usually a loose nut or worn washer — a simple fix.", ar: "تتكوّن القطرات عند وصلة السيفون. غالباً صامولة مرتخية أو جلدة تالفة — إصلاح بسيط." },
    confidence: 91, urgency: "safe", priceMin: 60, priceMax: 120, diy: true,
    tips: [
      { en: "Close the water valve under the sink", ar: "أغلق محبس الماء تحت المغسلة" },
      { en: "Hand-tighten the slip nut a quarter turn", ar: "اربط الصامولة باليد ربع لفّة" },
      { en: "If it still drips, replace the rubber washer (≈5 QAR)", ar: "إذا استمر التنقيط، استبدل الجلدة المطاطية (≈٥ ريال)" },
    ],
    technician: technicians.plumb,
  },
  {
    id: "breaker", label: { en: "Tripping breaker", ar: "قاطع كهرباء يفصل" }, image: breakerImg,
    diagnosis: { en: "Overloaded or faulty circuit", ar: "دائرة محمّلة زيادة أو معطوبة" },
    detail: { en: "A breaker that keeps tripping can mean a short circuit or failing wiring. Do not keep resetting it.", ar: "القاطع الذي يفصل باستمرار قد يعني تماساً أو أسلاكاً تالفة. لا تُعِد تشغيله مراراً." },
    confidence: 79, urgency: "danger", priceMin: 150, priceMax: 350, diy: false,
    tips: [
      { en: "Switch off and unplug appliances on that circuit", ar: "افصل الأجهزة على هذه الدائرة" },
      { en: "Do not open the panel yourself", ar: "لا تفتح لوحة الكهرباء بنفسك" },
    ],
    technician: technicians.elec,
  },
  {
    id: "drain", label: { en: "Clogged drain", ar: "مصرف مسدود" }, image: drainImg,
    diagnosis: { en: "Grease and food build-up in trap", ar: "تراكم دهون وبقايا طعام في السيفون" },
    detail: { en: "Standing water with food particles points to a partial blockage close to the drain.", ar: "الماء الراكد مع بقايا الطعام يشير إلى انسداد جزئي قريب من المصرف." },
    confidence: 88, urgency: "safe", priceMin: 80, priceMax: 150, diy: true,
    tips: [
      { en: "Pour hot (not boiling) water down the drain", ar: "اسكب ماءً ساخناً (غير مغلي) في المصرف" },
      { en: "Use a plunger for 30 seconds with firm strokes", ar: "استخدم الشفّاط لمدة ٣٠ ثانية بقوة" },
      { en: "Avoid chemical cleaners — they damage pipes", ar: "تجنّب المنظّفات الكيميائية فهي تتلف الأنابيب" },
    ],
    technician: technicians.plumb,
  },
];

/** Sample partner pricing — clearly labelled as sample on the site. Resident plans live in src/data/pricing.ts. */
export const pricing = {
  partnerMonthly: 299,
  commission: "10–15%",
};
