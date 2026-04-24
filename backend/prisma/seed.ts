import {
  PrismaClient,
  BuildingBlock,
  Pillar,
  IndustryGroup,
  SizeClassification,
  FactoryStatus,
  AssessmentStatus,
  GapSeverity,
  RoadmapStatus,
  PhaseStatus,
  InitiativeStatus,
  MilestoneStatus,
  RecommendationType,
  NotificationType,
  NotificationPriority,
  GovAlertType,
  GovAlertSeverity,
  GovOrganization,
  GovRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID, randomBytes, createHash } from 'crypto';

const prisma = new PrismaClient();

// ----- SIRI dimensions (16) -----

type SeedDimension = {
  code: string;
  nameAr: string;
  nameEn: string;
  block: BuildingBlock;
  pillar: Pillar;
  questionAr: string;
  questionEn: string;
};

const DIMENSIONS: SeedDimension[] = [
  { code: 'OPS-1', nameAr: 'تخطيط العمليات', nameEn: 'Operations Planning', block: 'PROCESS', pillar: 'OPERATIONS',
    questionAr: 'إلى أي مدى تخطط عملياتك التشغيلية بشكل رقمي ومتكامل؟',
    questionEn: 'How digitally and holistically is your operations planning executed?' },
  { code: 'OPS-2', nameAr: 'تنفيذ العمليات', nameEn: 'Operations Execution', block: 'PROCESS', pillar: 'OPERATIONS',
    questionAr: 'ما مدى أتمتة تنفيذ العمليات في الإنتاج؟',
    questionEn: 'How automated is the execution of operations on the shop floor?' },
  { code: 'SC-1', nameAr: 'سلسلة الإمداد الرقمية', nameEn: 'Digital Supply Chain', block: 'PROCESS', pillar: 'SUPPLY_CHAIN',
    questionAr: 'ما مدى رقمنة سلسلة التوريد لديك وتكاملها مع الموردين؟',
    questionEn: 'How digital and integrated is your supply chain with suppliers?' },
  { code: 'SC-2', nameAr: 'تتبع سلسلة التوريد', nameEn: 'Supply Chain Visibility', block: 'PROCESS', pillar: 'SUPPLY_CHAIN',
    questionAr: 'ما مستوى الرؤية اللحظية عبر سلسلة التوريد الكاملة؟',
    questionEn: 'What real-time visibility exists across your end-to-end supply chain?' },
  { code: 'PLC-1', nameAr: 'تطوير المنتج', nameEn: 'Product Development', block: 'PROCESS', pillar: 'PRODUCT_LIFECYCLE',
    questionAr: 'ما مستوى الرقمنة في تصميم وتطوير المنتجات؟',
    questionEn: 'How digital is your product design and development workflow?' },
  { code: 'PLC-2', nameAr: 'إدارة دورة حياة المنتج', nameEn: 'Product Lifecycle Management', block: 'PROCESS', pillar: 'PRODUCT_LIFECYCLE',
    questionAr: 'هل لديك نظام متكامل لإدارة دورة حياة المنتج (PLM)؟',
    questionEn: 'Is there an integrated Product Lifecycle Management (PLM) system in place?' },
  { code: 'AUTO-1', nameAr: 'أتمتة المصنع', nameEn: 'Shop Floor Automation', block: 'TECHNOLOGY', pillar: 'AUTOMATION',
    questionAr: 'ما مستوى الأتمتة في خطوط الإنتاج؟',
    questionEn: 'What level of automation exists on the production lines?' },
  { code: 'AUTO-2', nameAr: 'أتمتة المكاتب والعمليات', nameEn: 'Enterprise Automation', block: 'TECHNOLOGY', pillar: 'AUTOMATION',
    questionAr: 'ما مدى أتمتة العمليات المكتبية والإدارية؟',
    questionEn: 'How automated are your back-office and enterprise processes?' },
  { code: 'CONN-1', nameAr: 'ربط الآلات والأنظمة', nameEn: 'Machine & System Connectivity', block: 'TECHNOLOGY', pillar: 'CONNECTIVITY',
    questionAr: 'ما مستوى ربط الآلات والأنظمة ببعضها البعض؟',
    questionEn: 'How well are machines and systems interconnected?' },
  { code: 'CONN-2', nameAr: 'البنية التحتية للبيانات', nameEn: 'Data Infrastructure', block: 'TECHNOLOGY', pillar: 'CONNECTIVITY',
    questionAr: 'ما جودة البنية التحتية للبيانات والشبكات الصناعية؟',
    questionEn: 'What is the maturity of your data and industrial network infrastructure?' },
  { code: 'INT-1', nameAr: 'تحليلات البيانات', nameEn: 'Data Analytics', block: 'TECHNOLOGY', pillar: 'INTELLIGENCE',
    questionAr: 'ما مستوى تحليلات البيانات المستخدمة لاتخاذ القرار؟',
    questionEn: 'What level of data analytics supports decision-making?' },
  { code: 'INT-2', nameAr: 'الذكاء الاصطناعي', nameEn: 'AI & Advanced Intelligence', block: 'TECHNOLOGY', pillar: 'INTELLIGENCE',
    questionAr: 'هل يُستخدم الذكاء الاصطناعي في عمليات الإنتاج أو اتخاذ القرار؟',
    questionEn: 'Is AI deployed in production, quality, or decision-making processes?' },
  { code: 'TAL-1', nameAr: 'جاهزية المواهب', nameEn: 'Workforce Learning & Development', block: 'ORGANIZATION', pillar: 'TALENT_READINESS',
    questionAr: 'ما مستوى برامج تطوير مهارات القوى العاملة الرقمية؟',
    questionEn: 'How mature are your digital workforce upskilling programs?' },
  { code: 'TAL-2', nameAr: 'التعاون بين الفرق', nameEn: 'Cross-functional Collaboration', block: 'ORGANIZATION', pillar: 'TALENT_READINESS',
    questionAr: 'ما مدى التعاون بين فرق العمليات وتقنية المعلومات والأعمال؟',
    questionEn: 'How well do OT/IT and business teams collaborate across functions?' },
  { code: 'STR-1', nameAr: 'القيادة والحوكمة', nameEn: 'Leadership & Governance', block: 'ORGANIZATION', pillar: 'STRUCTURE_MANAGEMENT',
    questionAr: 'هل لديك حوكمة واضحة للتحول الرقمي على مستوى القيادة؟',
    questionEn: 'Is there clear leadership and governance for digital transformation?' },
  { code: 'STR-2', nameAr: 'استراتيجية التحول', nameEn: 'Transformation Strategy', block: 'ORGANIZATION', pillar: 'STRUCTURE_MANAGEMENT',
    questionAr: 'هل لديك استراتيجية موثقة للتحول الرقمي مع مؤشرات أداء؟',
    questionEn: 'Is there a documented digital transformation strategy with KPIs?' },
];

const LEVEL_LABELS = [
  { ar: 'غير محدد — لا توجد عمليات موثقة', en: 'Undefined — no documented processes' },
  { ar: 'محدد — عمليات موثقة لكن يدوية', en: 'Defined — documented but manual processes' },
  { ar: 'رقمي — أنظمة رقمية أساسية موجودة', en: 'Digital — basic digital systems in place' },
  { ar: 'متكامل — الأنظمة متصلة وتتبادل البيانات', en: 'Integrated — connected systems exchanging data' },
  { ar: 'آلي — عمليات مؤتمتة من طرف إلى طرف', en: 'Automated — end-to-end automated processes' },
  { ar: 'ذكي — أنظمة ذكية تتحسن ذاتيًا', en: 'Intelligent — self-optimizing, AI-driven systems' },
];

// ----- Factories demo set (15 factories, Saudi-wide) -----

type FactorySeed = {
  cr: string;
  nameAr: string;
  nameEn: string;
  industry: IndustryGroup;
  size: SizeClassification;
  employees: number;
  region: string;
  city: string;
  governorate: string;
  lat: number;
  lng: number;
  profile: 'leader' | 'average' | 'laggard' | 'emerging';
  sidfFinanced: boolean;
  sidfAmount?: number;
  revenue: number;
};

const FACTORIES: FactorySeed[] = [
  { cr: '1010200001', nameAr: 'أرامكو الرقمية للبتروكيماويات', nameEn: 'Aramco Digital Petrochemicals',
    industry: 'OIL_GAS', size: 'LARGE', employees: 2400, region: 'Eastern Province', city: 'Dhahran', governorate: 'Dhahran',
    lat: 26.2885, lng: 50.1500, profile: 'leader', sidfFinanced: true, sidfAmount: 120_000_000, revenue: 5_400_000_000 },
  { cr: '1010200002', nameAr: 'سابك الذكية للكيماويات', nameEn: 'SABIC Smart Chemicals',
    industry: 'ENERGY_CHEMICALS', size: 'LARGE', employees: 1850, region: 'Eastern Province', city: 'Jubail', governorate: 'Jubail',
    lat: 27.0174, lng: 49.6225, profile: 'leader', sidfFinanced: true, sidfAmount: 90_000_000, revenue: 3_900_000_000 },
  { cr: '1010200003', nameAr: 'المراعي للأغذية المتقدمة', nameEn: 'Almarai Advanced Foods',
    industry: 'FOOD_BEVERAGE', size: 'LARGE', employees: 3200, region: 'Riyadh', city: 'Al Kharj', governorate: 'Al Kharj',
    lat: 24.1554, lng: 47.3100, profile: 'leader', sidfFinanced: true, sidfAmount: 75_000_000, revenue: 4_200_000_000 },
  { cr: '1010200004', nameAr: 'الطيران السعودي للتصنيع المتقدم', nameEn: 'Saudi Aero Advanced Manufacturing',
    industry: 'AEROSPACE', size: 'LARGE', employees: 950, region: 'Riyadh', city: 'Riyadh', governorate: 'Riyadh',
    lat: 24.7136, lng: 46.6753, profile: 'average', sidfFinanced: true, sidfAmount: 45_000_000, revenue: 1_800_000_000 },
  { cr: '1010200005', nameAr: 'الأدوية المتقدمة', nameEn: 'Advanced Pharma Manufacturing',
    industry: 'PHARMACEUTICALS', size: 'MEDIUM', employees: 210, region: 'Riyadh', city: 'Sudair', governorate: 'Majmaah',
    lat: 25.9031, lng: 45.5656, profile: 'average', sidfFinanced: true, sidfAmount: 25_000_000, revenue: 450_000_000 },
  { cr: '1010200006', nameAr: 'مصنع جدة للسيارات', nameEn: 'Jeddah Automotive Assembly',
    industry: 'AUTOMOTIVE', size: 'LARGE', employees: 680, region: 'Makkah', city: 'Jeddah', governorate: 'Jeddah',
    lat: 21.4858, lng: 39.1925, profile: 'average', sidfFinanced: false, revenue: 1_100_000_000 },
  { cr: '1010200007', nameAr: 'إلكترونيات الشرق', nameEn: 'Eastern Electronics Co.',
    industry: 'ELECTRONICS', size: 'MEDIUM', employees: 140, region: 'Eastern Province', city: 'Dammam', governorate: 'Dammam',
    lat: 26.4207, lng: 50.0888, profile: 'emerging', sidfFinanced: false, revenue: 180_000_000 },
  { cr: '1010200008', nameAr: 'مكة للمنسوجات', nameEn: 'Makkah Textiles',
    industry: 'TEXTILE_CLOTHING', size: 'SMALL', employees: 42, region: 'Makkah', city: 'Makkah', governorate: 'Makkah',
    lat: 21.3891, lng: 39.8579, profile: 'laggard', sidfFinanced: false, revenue: 28_000_000 },
  { cr: '1010200009', nameAr: 'قطع الدقة السعودية', nameEn: 'Saudi Precision Parts',
    industry: 'PRECISION_PARTS', size: 'SMALL', employees: 38, region: 'Qassim', city: 'Buraidah', governorate: 'Buraidah',
    lat: 26.3260, lng: 43.9750, profile: 'emerging', sidfFinanced: false, revenue: 22_000_000 },
  { cr: '1010200010', nameAr: 'الآلات الثقيلة للصناعة', nameEn: 'Heavy Machinery Industries',
    industry: 'MACHINERY_EQUIPMENT', size: 'MEDIUM', employees: 180, region: 'Eastern Province', city: 'Al Ahsa', governorate: 'Al Ahsa',
    lat: 25.3463, lng: 49.5848, profile: 'average', sidfFinanced: true, sidfAmount: 18_000_000, revenue: 320_000_000 },
  { cr: '1010200011', nameAr: 'جازان اللوجستية', nameEn: 'Jazan Logistics Hub',
    industry: 'LOGISTICS', size: 'MEDIUM', employees: 95, region: 'Jazan', city: 'Jazan', governorate: 'Jazan',
    lat: 16.8892, lng: 42.5511, profile: 'emerging', sidfFinanced: false, revenue: 140_000_000 },
  { cr: '1010200012', nameAr: 'التقنيات الطبية المتقدمة', nameEn: 'Advanced Medical Devices',
    industry: 'MEDICAL_TECHNOLOGY', size: 'SMALL', employees: 28, region: 'Riyadh', city: 'Riyadh', governorate: 'Riyadh',
    lat: 24.7743, lng: 46.7386, profile: 'average', sidfFinanced: false, revenue: 65_000_000 },
  { cr: '1010200013', nameAr: 'أشباه الموصلات الوطنية', nameEn: 'National Semiconductors',
    industry: 'SEMICONDUCTORS', size: 'MEDIUM', employees: 155, region: 'Riyadh', city: 'Riyadh', governorate: 'Riyadh',
    lat: 24.6877, lng: 46.7219, profile: 'average', sidfFinanced: true, sidfAmount: 35_000_000, revenue: 290_000_000 },
  { cr: '1010200014', nameAr: 'تبوك للتصنيع العام', nameEn: 'Tabuk General Manufacturing',
    industry: 'GENERAL_MANUFACTURING', size: 'SMALL', employees: 62, region: 'Tabuk', city: 'Tabuk', governorate: 'Tabuk',
    lat: 28.3835, lng: 36.5662, profile: 'laggard', sidfFinanced: false, revenue: 35_000_000 },
  { cr: '1010200015', nameAr: 'النفط والغاز العربي', nameEn: 'Arabian Oil & Gas Services',
    industry: 'OIL_GAS', size: 'LARGE', employees: 520, region: 'Eastern Province', city: 'Ras Tanura', governorate: 'Ras Tanura',
    lat: 26.6963, lng: 50.1580, profile: 'average', sidfFinanced: true, sidfAmount: 55_000_000, revenue: 950_000_000 },
];

const PROFILE_BASE: Record<string, [number, number]> = {
  leader: [3.8, 4.6],
  average: [2.4, 3.4],
  emerging: [1.5, 2.6],
  laggard: [0.6, 1.8],
};

function scoreFor(profile: string, dimCode: string): number {
  const [lo, hi] = PROFILE_BASE[profile];
  // deterministic pseudo-random using dim code hash
  const h = Array.from(dimCode).reduce((a, c) => a + c.charCodeAt(0), 0);
  const frac = ((h * 9301 + 49297) % 233280) / 233280;
  return Math.round(Math.max(0, Math.min(5, lo + (hi - lo) * frac)));
}

const SIDF_RELEVANT = new Set(['CONN-1', 'CONN-2', 'INT-1', 'AUTO-1', 'AUTO-2', 'OPS-1', 'SC-1']);

function classify(score: number): GapSeverity {
  if (score <= 1) return 'CRITICAL';
  if (score <= 2) return 'MODERATE';
  if (score <= 3) return 'MINOR';
  return 'ON_TRACK';
}

// ----- Recommendation templates per dimension -----

const RECS: Record<string, { titleEn: string; titleAr: string; descEn: string; descAr: string; type: RecommendationType; cost: number }[]> = {
  'OPS-1': [
    { titleEn: 'Deploy MES/APS for production scheduling', titleAr: 'نشر نظام تنفيذ التصنيع للجدولة',
      descEn: 'Implement a Manufacturing Execution System with Advanced Planning for end-to-end operations planning.',
      descAr: 'تنفيذ نظام لتنفيذ التصنيع مع تخطيط متقدم لعمليات شاملة.', type: 'TECHNOLOGY', cost: 1_800_000 },
  ],
  'OPS-2': [
    { titleEn: 'Introduce SPC on critical lines', titleAr: 'تطبيق ضبط العمليات الإحصائي',
      descEn: 'Add statistical process control to the top 3 production lines with automated defect capture.',
      descAr: 'أضف ضبط العمليات الإحصائي لأعلى 3 خطوط إنتاج مع التقاط العيوب تلقائيًا.', type: 'ACTION', cost: 420_000 },
  ],
  'SC-1': [
    { titleEn: 'EDI + supplier portal', titleAr: 'بوابة الموردين مع تبادل البيانات',
      descEn: 'Stand up a supplier portal with EDI integration for top 80% spend suppliers.',
      descAr: 'إنشاء بوابة موردين مع تكامل EDI لأعلى 80٪ من الموردين.', type: 'TECHNOLOGY', cost: 1_100_000 },
  ],
  'SC-2': [
    { titleEn: 'Real-time track & trace', titleAr: 'تتبع لحظي عبر سلسلة التوريد',
      descEn: 'IoT-based track and trace across inbound, WIP, and outbound logistics with a single pane of glass.',
      descAr: 'تتبع قائم على إنترنت الأشياء عبر اللوجستيات الواردة والصادرة.', type: 'TECHNOLOGY', cost: 950_000 },
  ],
  'PLC-1': [
    { titleEn: 'CAD/PLM integration', titleAr: 'تكامل CAD/PLM',
      descEn: 'Integrate engineering CAD with a PLM backbone for revision control and BoM sync.',
      descAr: 'دمج CAD الهندسي مع PLM لإدارة الإصدارات ومزامنة قائمة المواد.', type: 'TECHNOLOGY', cost: 1_400_000 },
  ],
  'PLC-2': [
    { titleEn: 'Adopt Windchill or Teamcenter', titleAr: 'اعتماد منصة PLM',
      descEn: 'Deploy an enterprise PLM platform tied to ERP with lifecycle gates.',
      descAr: 'نشر منصة PLM مؤسسية مع بوابات دورة الحياة.', type: 'VENDOR', cost: 2_200_000 },
  ],
  'AUTO-1': [
    { titleEn: 'Collaborative robots on pick & pack', titleAr: 'روبوتات تعاونية للاختيار والتعبئة',
      descEn: 'Deploy cobots to reduce manual handling on final assembly.',
      descAr: 'نشر روبوتات تعاونية لتقليل المناولة اليدوية.', type: 'TECHNOLOGY', cost: 650_000 },
  ],
  'AUTO-2': [
    { titleEn: 'RPA for finance & procurement', titleAr: 'الأتمتة الآلية للمالية والمشتريات',
      descEn: 'Implement RPA to automate invoice matching and PO approvals.',
      descAr: 'تنفيذ الأتمتة الآلية لمطابقة الفواتير واعتماد أوامر الشراء.', type: 'TECHNOLOGY', cost: 280_000 },
  ],
  'CONN-1': [
    { titleEn: 'OT/IT convergence + unified namespace', titleAr: 'توحيد OT/IT ومساحة الأسماء',
      descEn: 'Deploy a unified namespace broker (MQTT/Sparkplug) connecting PLCs, SCADA, ERP.',
      descAr: 'نشر وسيط مساحة الأسماء الموحد (MQTT) لربط PLC/SCADA/ERP.', type: 'TECHNOLOGY', cost: 780_000 },
  ],
  'CONN-2': [
    { titleEn: 'Industrial Wi-Fi 6 + 5G-ready LAN', titleAr: 'شبكة صناعية Wi-Fi 6 جاهزة للجيل الخامس',
      descEn: 'Harden the industrial network with redundant industrial switches and private 5G readiness.',
      descAr: 'تعزيز الشبكة الصناعية مع مبدلات متكررة وجاهزية 5G.', type: 'TECHNOLOGY', cost: 1_300_000 },
  ],
  'INT-1': [
    { titleEn: 'Factory data lake + BI', titleAr: 'بحيرة بيانات المصنع مع BI',
      descEn: 'Consolidate shop-floor data into a time-series data lake with Power BI/Looker dashboards.',
      descAr: 'توحيد بيانات الأرضية في بحيرة بيانات مع لوحات BI.', type: 'TECHNOLOGY', cost: 900_000 },
  ],
  'INT-2': [
    { titleEn: 'AI predictive maintenance pilot', titleAr: 'تجربة صيانة تنبؤية بالذكاء الاصطناعي',
      descEn: 'Pilot ML-based predictive maintenance on top 5 critical assets.',
      descAr: 'تجربة صيانة تنبؤية قائمة على التعلم الآلي لأكثر 5 أصول حرجة.', type: 'ACTION', cost: 550_000 },
  ],
  'TAL-1': [
    { titleEn: 'SIRI awareness training for all staff', titleAr: 'تدريب الوعي بإطار SIRI لكل الموظفين',
      descEn: 'Enroll all managers in the SIRI Foundation course and certify the top 10%.',
      descAr: 'تسجيل جميع المديرين في دورة SIRI الأساسية واعتماد 10٪ الأعلى.', type: 'LEARNING', cost: 180_000 },
  ],
  'TAL-2': [
    { titleEn: 'Form a cross-functional digital squad', titleAr: 'تشكيل فريق رقمي متعدد التخصصات',
      descEn: 'Create a 6–8 person squad with OT, IT, Ops, Quality, and Finance.',
      descAr: 'إنشاء فريق 6-8 أشخاص يشمل OT و IT والعمليات والجودة والمالية.', type: 'INITIATIVE', cost: 120_000 },
  ],
  'STR-1': [
    { titleEn: 'Appoint a Chief Digital Officer', titleAr: 'تعيين رئيس التحول الرقمي',
      descEn: 'Create a C-level role reporting to the CEO with digital P&L accountability.',
      descAr: 'إنشاء منصب تنفيذي يتبع الرئيس التنفيذي لمساءلة التحول الرقمي.', type: 'INITIATIVE', cost: 900_000 },
  ],
  'STR-2': [
    { titleEn: 'Publish 3-year digital strategy with KPIs', titleAr: 'نشر استراتيجية رقمية ثلاثية السنوات مع مؤشرات أداء',
      descEn: 'Document a board-approved digital strategy with 12 measurable KPIs.',
      descAr: 'توثيق استراتيجية رقمية معتمدة من المجلس مع 12 مؤشر أداء.', type: 'ACTION', cost: 230_000 },
  ],
};

// ----- Main seed -----

async function main() {
  console.log('==> Wiping existing demo data...');
  // Clear in dependency order
  await prisma.notification.deleteMany({});
  await prisma.govAlert.deleteMany({});
  await prisma.benchmarkSnapshot.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.roadmapInitiative.deleteMany({});
  await prisma.roadmapPhase.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.documentFolder.deleteMany({});
  await prisma.dimensionGap.deleteMany({});
  await prisma.gapAnalysis.deleteMany({});
  await prisma.dimensionResponse.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.factoryCertification.deleteMany({});
  await prisma.factoryUser.deleteMany({});
  await prisma.factory.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.governmentUser.deleteMany({});
  await prisma.questionBank.deleteMany({ where: { industryGroup: null } });

  // ---- Question bank ----
  console.log('==> Seeding SIRI question bank (16 dimensions)...');
  for (const d of DIMENSIONS) {
    await prisma.questionBank.create({
      data: {
        dimensionCode: d.code,
        dimensionNameAr: d.nameAr,
        dimensionNameEn: d.nameEn,
        buildingBlock: d.block,
        pillar: d.pillar,
        industryGroup: null,
        questionAr: d.questionAr,
        questionEn: d.questionEn,
        level0DescriptorAr: LEVEL_LABELS[0].ar, level0DescriptorEn: LEVEL_LABELS[0].en,
        level1DescriptorAr: LEVEL_LABELS[1].ar, level1DescriptorEn: LEVEL_LABELS[1].en,
        level2DescriptorAr: LEVEL_LABELS[2].ar, level2DescriptorEn: LEVEL_LABELS[2].en,
        level3DescriptorAr: LEVEL_LABELS[3].ar, level3DescriptorEn: LEVEL_LABELS[3].en,
        level4DescriptorAr: LEVEL_LABELS[4].ar, level4DescriptorEn: LEVEL_LABELS[4].en,
        level5DescriptorAr: LEVEL_LABELS[5].ar, level5DescriptorEn: LEVEL_LABELS[5].en,
        weight: 1.0,
      },
    });
  }

  // ---- Demo user (shared across factories for convenience) ----
  console.log('==> Creating demo user...');
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@veesiri.sa',
      passwordHash: await bcrypt.hash('demo12345', 10),
      nameAr: 'مستخدم تجريبي',
      nameEn: 'Demo User',
      phone: '+966500000000',
    },
  });

  // ---- Government users ----
  console.log('==> Creating government portal users...');
  const govPass = await bcrypt.hash('gov12345', 10);
  await prisma.governmentUser.createMany({
    data: [
      { email: 'minister@mimr.gov.sa', passwordHash: govPass, nameAr: 'وزير الصناعة', nameEn: 'Industry Minister', organization: 'MIMR', role: 'MINISTER' },
      { email: 'analyst@sidf.gov.sa', passwordHash: govPass, nameAr: 'محلل تمويل', nameEn: 'SIDF Analyst', organization: 'SIDF', role: 'ANALYST' },
      { email: 'riyadh@mimr.gov.sa', passwordHash: govPass, nameAr: 'مسؤول الرياض', nameEn: 'Riyadh Regional Officer', organization: 'REGIONAL_AUTHORITY', regionScope: 'Riyadh', role: 'DIRECTOR' },
    ],
  });

  // ---- Factories loop ----
  console.log(`==> Seeding ${FACTORIES.length} demo factories...`);
  const now = new Date();

  for (const f of FACTORIES) {
    const factory = await prisma.factory.create({
      data: {
        crNumber: f.cr,
        nameAr: f.nameAr,
        nameEn: f.nameEn,
        industryGroup: f.industry,
        sizeClassification: f.size,
        employeeCount: f.employees,
        annualRevenueSar: f.revenue,
        foundingYear: 1990 + Math.floor(Math.random() * 30),
        region: f.region,
        city: f.city,
        governorate: f.governorate,
        gpsLat: f.lat,
        gpsLng: f.lng,
        addressAr: `${f.region} — المنطقة الصناعية`,
        addressEn: `${f.region} — Industrial Zone`,
        contactEmail: `ops@${f.nameEn.toLowerCase().replace(/[^a-z]/g, '')}.sa`,
        contactPhone: '+9661' + Math.floor(10000000 + Math.random() * 89999999),
        sidfEligible: f.profile !== 'laggard' && f.size !== 'MICRO',
        sidfFinanced: f.sidfFinanced,
        sidfAmountSar: f.sidfAmount ?? null,
        onboardingStep: 6,
        onboardingCompleted: true,
        status: 'ACTIVE',
        subscriptionTier: f.size === 'LARGE' ? 'ENTERPRISE' : f.size === 'MEDIUM' ? 'PROFESSIONAL' : 'BASIC',
        ownerId: demoUser.id,
        users: { create: { userId: demoUser.id, role: 'ADMIN', acceptedAt: now } },
      },
    });

    // Assessment + responses
    const assessment = await prisma.assessment.create({
      data: {
        factoryId: factory.id,
        industryGroup: f.industry,
        status: 'SUBMITTED',
        submittedAt: new Date(now.getTime() - Math.random() * 90 * 24 * 3600_000),
        expiresAt: new Date(now.getTime() + 365 * 24 * 3600_000),
        version: 1,
      },
    });

    const scores: number[] = [];
    const blockScores = { PROCESS: [] as number[], TECHNOLOGY: [] as number[], ORGANIZATION: [] as number[] };
    for (const d of DIMENSIONS) {
      const score = scoreFor(f.profile, d.code + f.cr);
      scores.push(score);
      blockScores[d.block].push(score);
      await prisma.dimensionResponse.create({
        data: {
          assessmentId: assessment.id,
          dimensionCode: d.code,
          buildingBlock: d.block,
          pillar: d.pillar,
          rawScore: score,
          weightedScore: score,
          respondedById: demoUser.id,
        },
      });
    }
    const avg = (arr: number[]) => Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
    const processS = avg(blockScores.PROCESS);
    const technology = avg(blockScores.TECHNOLOGY);
    const organization = avg(blockScores.ORGANIZATION);
    const overall = Math.round(((processS + technology + organization) / 3) * 100) / 100;

    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { overallScore: overall, processScore: processS, technologyScore: technology, organizationScore: organization, certifiedAt: now, status: 'CERTIFIED' },
    });

    // Certificate
    const verificationCode = randomBytes(6).toString('hex').toUpperCase();
    const signature = createHash('sha256').update(`${factory.id}:${assessment.id}:${overall}:${verificationCode}`).digest('hex');
    await prisma.certificate.create({
      data: {
        factoryId: factory.id,
        assessmentId: assessment.id,
        verificationCode,
        siriLevelAchieved: overall,
        expiryDate: new Date(now.getTime() + 365 * 24 * 3600_000),
        digitalSignature: signature,
        isValid: true,
      },
    });

    // Gap analysis
    const target = 3.5;
    const gap = await prisma.gapAnalysis.create({
      data: {
        factoryId: factory.id,
        assessmentId: assessment.id,
        overallGap: Math.max(0, target - overall),
        processGap: Math.max(0, target - processS),
        technologyGap: Math.max(0, target - technology),
        organizationGap: Math.max(0, target - organization),
        targetOverallScore: target,
        targetAchievementDate: new Date(now.getTime() + 18 * 30 * 24 * 3600_000),
      },
    });

    const sortedDims = [...DIMENSIONS].map((d, i) => ({ d, score: scores[i] }))
      .sort((a, b) => (target - b.score) - (target - a.score));

    for (let i = 0; i < sortedDims.length; i++) {
      const { d, score } = sortedDims[i];
      const g = Math.max(0, target - score);
      await prisma.dimensionGap.create({
        data: {
          gapAnalysisId: gap.id,
          dimensionCode: d.code,
          currentScore: score,
          targetScore: target,
          gapMagnitude: g,
          priorityRank: i + 1,
          severity: classify(score),
          estimatedEffortMonths: g <= 1 ? 3 : g <= 2 ? 9 : 18,
          estimatedCostSar: Math.round(g * 150_000),
          estimatedRoiSar: Math.round(g * 420_000),
          isQuickWin: g > 0 && g <= 1 && score >= 2,
          isSidfRelevant: SIDF_RELEVANT.has(d.code),
          peerMedianScore: Math.round((score + 0.2) * 10) / 10,
          peerTop25Score: Math.min(5, Math.round((score + 0.8) * 10) / 10),
          narrativeEn: g === 0 ? `${d.code} meets or exceeds the target maturity level.` :
            g <= 1 ? `Small gap at ${d.code} — quick-win improvements are feasible.` :
            g <= 2 ? `Moderate gap at ${d.code} — requires a planned investment.` :
            `Critical gap at ${d.code} — a full transformation initiative is recommended.`,
          narrativeAr: g === 0 ? `الأداء في ${d.code} يلبي الهدف.` :
            g <= 1 ? `فجوة صغيرة في ${d.code} — تحسينات سريعة ممكنة.` :
            g <= 2 ? `فجوة متوسطة في ${d.code} — تتطلب استثمارًا مخططًا.` :
            `فجوة حرجة في ${d.code} — يوصى بمبادرة تحول شاملة.`,
        },
      });
    }

    // Recommendations (top 6 gaps)
    const topGaps = sortedDims.slice(0, 6);
    for (const { d, score } of topGaps) {
      const g = Math.max(0, target - score);
      if (g <= 0) continue;
      const templates = RECS[d.code] ?? [];
      for (const tpl of templates) {
        await prisma.recommendation.create({
          data: {
            factoryId: factory.id,
            gapAnalysisId: gap.id,
            dimensionCode: d.code,
            recommendationType: tpl.type,
            titleEn: tpl.titleEn,
            titleAr: tpl.titleAr,
            descriptionEn: tpl.descEn,
            descriptionAr: tpl.descAr,
            rationaleEn: `Current level ${score}, target ${target}. Closing this gap contributes ~${(g * 0.8).toFixed(1)} points to overall SIRI.`,
            rationaleAr: `المستوى الحالي ${score} والهدف ${target}. إغلاق هذه الفجوة يساهم بـ~${(g * 0.8).toFixed(1)} نقطة في SIRI.`,
            estimatedImpactScore: g * 0.8,
            estimatedCostSar: tpl.cost,
            confidenceScore: 0.78 + Math.random() * 0.15,
          },
        });
      }
    }

    // Roadmap with 3 phases and initiatives
    const roadmap = await prisma.roadmap.create({
      data: {
        factoryId: factory.id,
        gapAnalysisId: gap.id,
        status: f.profile === 'laggard' ? 'DRAFT' : 'APPROVED',
        titleEn: 'Digital Transformation Roadmap',
        titleAr: 'خارطة طريق التحول الرقمي',
        startDate: now,
        endDate: new Date(now.getTime() + 540 * 24 * 3600_000),
        totalBudgetSar: topGaps.reduce((acc, { d }) => acc + (RECS[d.code]?.[0]?.cost ?? 0), 0),
        approvedById: f.profile === 'laggard' ? null : demoUser.id,
        approvedAt: f.profile === 'laggard' ? null : now,
      },
    });

    const phaseDefs = [
      { n: 1, nameEn: 'Foundation', nameAr: 'التأسيس', months: 6 },
      { n: 2, nameEn: 'Acceleration', nameAr: 'التسريع', months: 9 },
      { n: 3, nameEn: 'Optimization', nameAr: 'التحسين', months: 3 },
    ];
    let cursor = new Date(now);
    for (const p of phaseDefs) {
      const phaseEnd = new Date(cursor.getTime() + p.months * 30 * 24 * 3600_000);
      const phase = await prisma.roadmapPhase.create({
        data: {
          roadmapId: roadmap.id,
          phaseNumber: p.n,
          nameEn: p.nameEn,
          nameAr: p.nameAr,
          startDate: cursor,
          endDate: phaseEnd,
          targetOverallScore: Math.min(5, overall + 0.3 + p.n * 0.3),
          status: p.n === 1 ? 'ACTIVE' : 'PLANNED',
        },
      });

      const gapsForPhase = topGaps.slice((p.n - 1) * 2, p.n * 2);
      for (const { d, score } of gapsForPhase) {
        const tpl = RECS[d.code]?.[0];
        if (!tpl) continue;
        const initEnd = new Date(cursor.getTime() + (p.months - 1) * 30 * 24 * 3600_000);
        const init = await prisma.roadmapInitiative.create({
          data: {
            phaseId: phase.id,
            dimensionCode: d.code,
            titleEn: tpl.titleEn,
            titleAr: tpl.titleAr,
            descriptionEn: tpl.descEn,
            descriptionAr: tpl.descAr,
            startDate: cursor,
            endDate: initEnd,
            budgetSar: tpl.cost,
            sidfEligible: SIDF_RELEVANT.has(d.code),
            ownerUserId: demoUser.id,
            vendorName: tpl.type === 'VENDOR' ? 'Certified Transformation Partner' : null,
            status: p.n === 1 ? 'IN_PROGRESS' : 'PLANNED',
            completionPercentage: p.n === 1 ? 25 + Math.floor(Math.random() * 40) : 0,
          },
        });
        // 3 milestones per initiative
        for (let m = 0; m < 3; m++) {
          const due = new Date(cursor.getTime() + (m + 1) * (p.months / 3) * 30 * 24 * 3600_000);
          await prisma.milestone.create({
            data: {
              initiativeId: init.id,
              titleEn: `${tpl.titleEn} — Milestone ${m + 1}`,
              titleAr: `${tpl.titleAr} — معلم ${m + 1}`,
              dueDate: due,
              status: p.n === 1 && m === 0 ? 'COMPLETED' : 'PENDING',
              completedAt: p.n === 1 && m === 0 ? now : null,
            },
          });
        }
      }
      cursor = phaseEnd;
    }

    // Documents — system folders + a couple of demo uploads
    const processFolder = await prisma.documentFolder.create({
      data: { factoryId: factory.id, nameEn: 'Process', nameAr: 'العملية', isSystemFolder: true, dimensionCode: null },
    });
    await prisma.documentFolder.create({
      data: { factoryId: factory.id, nameEn: 'Technology', nameAr: 'التقنية', isSystemFolder: true },
    });
    await prisma.documentFolder.create({
      data: { factoryId: factory.id, nameEn: 'Organization', nameAr: 'المنظمة', isSystemFolder: true },
    });
    await prisma.document.create({
      data: {
        factoryId: factory.id,
        folderId: processFolder.id,
        nameEn: 'ISO 9001:2015 Certificate.pdf',
        nameAr: 'شهادة الأيزو 9001:2015.pdf',
        fileUrl: 'https://demo.veesiri.sa/docs/iso9001.pdf',
        fileType: 'pdf',
        fileSizeBytes: 245_000,
        documentType: 'CERTIFICATION',
        expiryDate: new Date(now.getTime() + 300 * 24 * 3600_000),
        dimensionTags: ['OPS-1', 'STR-1'],
        uploadedById: demoUser.id,
      },
    });
    await prisma.document.create({
      data: {
        factoryId: factory.id,
        folderId: processFolder.id,
        nameEn: 'Operations Process Map v3.pdf',
        nameAr: 'خريطة العمليات v3.pdf',
        fileUrl: 'https://demo.veesiri.sa/docs/opsmap.pdf',
        fileType: 'pdf',
        fileSizeBytes: 1_250_000,
        documentType: 'EVIDENCE',
        dimensionTags: ['OPS-1', 'OPS-2'],
        uploadedById: demoUser.id,
      },
    });

    // Notifications
    await prisma.notification.createMany({
      data: [
        {
          recipientUserId: demoUser.id, factoryId: factory.id,
          type: 'CERTIFICATE_ISSUED', priority: 'HIGH',
          titleEn: 'SIRI Certificate Issued', titleAr: 'إصدار شهادة SIRI',
          bodyEn: `Your SIRI Level ${overall.toFixed(1)} certificate for ${f.nameEn} has been issued and is valid for 12 months.`,
          bodyAr: `تم إصدار شهادة SIRI بمستوى ${overall.toFixed(1)} لـ ${f.nameAr} وسارية لـ 12 شهرًا.`,
          actionUrl: `/factories/${factory.id}/certificate`, readAt: null,
        },
        {
          recipientUserId: demoUser.id, factoryId: factory.id,
          type: 'RECOMMENDATION', priority: 'MEDIUM',
          titleEn: `${topGaps.length} prioritized recommendations ready`, titleAr: 'توصيات مرتبة جاهزة',
          bodyEn: `Based on your latest gap analysis, ${topGaps.length} priority actions have been identified for ${f.nameEn}.`,
          bodyAr: `بناءً على آخر تحليل فجوات، تم تحديد ${topGaps.length} إجراءات ذات أولوية.`,
          actionUrl: `/factories/${factory.id}/recommendations`, readAt: null,
        },
      ],
    });
    if (f.profile === 'laggard') {
      await prisma.notification.create({
        data: {
          recipientUserId: demoUser.id, factoryId: factory.id,
          type: 'COMPLIANCE_ALERT', priority: 'CRITICAL',
          titleEn: 'Low SIRI score — action required', titleAr: 'نتيجة SIRI منخفضة — إجراء مطلوب',
          bodyEn: `Overall SIRI score for ${f.nameEn} is ${overall.toFixed(1)}, below the MIMR recommended floor of 2.0.`,
          bodyAr: `نتيجة SIRI الإجمالية لـ ${f.nameAr} هي ${overall.toFixed(1)}، أقل من الحد الموصى به.`,
          actionUrl: `/factories/${factory.id}/gap-analysis`,
        },
      });
    }

    // Gov alerts for laggards
    if (f.profile === 'laggard' || overall < 2.0) {
      await prisma.govAlert.create({
        data: {
          factoryId: factory.id,
          alertType: 'SIDF_NON_COMPLIANCE',
          severity: 'HIGH',
          descriptionEn: `${f.nameEn} scored ${overall.toFixed(1)} — below SIDF minimum threshold of 2.0.`,
          descriptionAr: `حصل ${f.nameAr} على ${overall.toFixed(1)} — أقل من حد SIDF.`,
        },
      });
    }
  }

  // Benchmark snapshots per industry × dimension
  console.log('==> Computing benchmark snapshots...');
  const allResponses = await prisma.dimensionResponse.findMany({
    include: { assessment: { select: { industryGroup: true } } },
  });
  const grouped = new Map<string, number[]>();
  for (const r of allResponses) {
    const key = `${r.assessment.industryGroup}::${r.dimensionCode}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r.rawScore);
  }
  const pct = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor((sorted.length - 1) * p);
    return sorted[idx];
  };
  for (const [key, scores] of grouped) {
    const [industry, dim] = key.split('::');
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    await prisma.benchmarkSnapshot.create({
      data: {
        industryGroup: industry as IndustryGroup,
        dimensionCode: dim,
        sampleSize: scores.length,
        meanScore: Math.round(mean * 100) / 100,
        medianScore: pct(scores, 0.5),
        p25Score: pct(scores, 0.25),
        p75Score: pct(scores, 0.75),
        p90Score: pct(scores, 0.9),
      },
    });
  }

  console.log('==> Seed complete!');
  console.log(`   Factories:        ${FACTORIES.length}`);
  console.log('   Demo login:       demo@veesiri.sa / demo12345');
  console.log('   Gov portal login: minister@mimr.gov.sa / gov12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
