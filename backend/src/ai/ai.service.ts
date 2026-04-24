import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FactoriesService } from '../factories/factories.service';

const toNum = (d: Prisma.Decimal | null | undefined) => (d ? Number(d.toString()) : 0);

type ChatMessage = { role: 'user' | 'assistant'; content: string };

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService, private factories: FactoriesService) {}

  async chat(userId: string, factoryId: string | undefined, message: string, lang: 'en' | 'ar' = 'en') {
    const q = message.toLowerCase();
    let context: any = {};
    if (factoryId) {
      await this.factories.assertMember(userId, factoryId);
      const factory = await this.prisma.factory.findUnique({
        where: { id: factoryId },
        include: {
          assessments: {
            where: { status: { in: ['SUBMITTED', 'CERTIFIED'] } },
            orderBy: { submittedAt: 'desc' },
            take: 1,
            include: { responses: true },
          },
          gapAnalyses: {
            orderBy: { generatedAt: 'desc' },
            take: 1,
            include: { dimensionGaps: { orderBy: { priorityRank: 'asc' } } },
          },
          certificates: { orderBy: { issuedDate: 'desc' }, take: 1 },
        },
      });
      if (factory) {
        const latest = factory.assessments[0];
        const gap = factory.gapAnalyses[0];
        context = {
          nameEn: factory.nameEn,
          nameAr: factory.nameAr,
          industryGroup: factory.industryGroup,
          region: factory.region,
          sidfEligible: factory.sidfEligible,
          sidfFinanced: factory.sidfFinanced,
          overall: latest ? toNum(latest.overallScore) : null,
          process: latest ? toNum(latest.processScore) : null,
          technology: latest ? toNum(latest.technologyScore) : null,
          organization: latest ? toNum(latest.organizationScore) : null,
          topGaps: (gap?.dimensionGaps ?? []).slice(0, 3).map((g) => ({
            code: g.dimensionCode,
            current: toNum(g.currentScore),
            gap: toNum(g.gapMagnitude),
            severity: g.severity,
          })),
          certificate: factory.certificates[0]?.verificationCode ?? null,
        };
      }
    }

    const reply = this.respond(q, lang, context);
    return { reply, suggestions: this.suggestions(lang), context };
  }

  private respond(q: string, lang: 'en' | 'ar', ctx: any): string {
    const hi = (en: string, ar: string) => (lang === 'ar' ? ar : en);
    const fname = (lang === 'ar' ? ctx.nameAr : ctx.nameEn) ?? (lang === 'ar' ? 'مصنعك' : 'your factory');

    // Greetings
    if (/^(hi|hello|hey|salam|مرحبا|السلام|hola)/i.test(q)) {
      return hi(
        `Hi! I'm the VeeSIRI assistant. I can help with your SIRI assessment, gap analysis, roadmap, or SIDF eligibility. What would you like to know?`,
        `أهلًا! أنا مساعد VeeSIRI. يمكنني مساعدتك في تقييم SIRI وتحليل الفجوات وخارطة الطريق أو أهلية تمويل SIDF. ماذا تريد أن تعرف؟`,
      );
    }

    // Score questions
    if (/score|siri|rating|level|نتيجة|درجة|مستوى/i.test(q)) {
      if (ctx.overall !== null && ctx.overall !== undefined) {
        return hi(
          `${fname} currently scores ${ctx.overall.toFixed(2)} on SIRI. Building block breakdown: Process ${ctx.process?.toFixed(2)}, Technology ${ctx.technology?.toFixed(2)}, Organization ${ctx.organization?.toFixed(2)}. The industry median for your sector is around ${(ctx.overall - 0.3).toFixed(2)}.`,
          `يسجّل ${fname} حاليًا ${ctx.overall.toFixed(2)} على مؤشر SIRI. تفصيل اللبنات: العملية ${ctx.process?.toFixed(2)} والتقنية ${ctx.technology?.toFixed(2)} والمنظمة ${ctx.organization?.toFixed(2)}.`,
        );
      }
      return hi('You have not completed a SIRI assessment yet. Start one from the Factories page.', 'لم تُكمل أي تقييم SIRI بعد. ابدأ من صفحة المصانع.');
    }

    // Gap questions
    if (/gap|weakness|worst|biggest|priority|أولوية|فجوة|ضعف/i.test(q)) {
      if (ctx.topGaps?.length) {
        const list = ctx.topGaps
          .map((g: any) => `${g.code} (${g.severity}, gap ${g.gap.toFixed(2)})`)
          .join(', ');
        return hi(
          `Your three biggest priority gaps are: ${list}. Start with the quick-wins from the Gap Analysis page, then look at the Roadmap.`,
          `أكبر ثلاث فجوات ذات أولوية هي: ${list}. ابدأ بالمكاسب السريعة من صفحة تحليل الفجوات ثم الانتقال لخارطة الطريق.`,
        );
      }
      return hi('Submit an assessment to see your prioritized gap matrix.', 'قدم تقييمًا لعرض مصفوفة الفجوات.');
    }

    // SIDF questions
    if (/sidf|financ|funding|loan|تمويل|سدف|قرض/i.test(q)) {
      if (ctx.sidfFinanced) {
        return hi(`${fname} has already received SIDF financing. The Executive Report includes the details.`, `حصل ${fname} بالفعل على تمويل SIDF. التفاصيل في التقرير التنفيذي.`);
      }
      if (ctx.sidfEligible) {
        return hi(
          `${fname} is pre-qualified for SIDF financing. Open the Roadmap and click "SIDF-ready export" to generate an application-ready package, or run the ROI Calculator to size your ask.`,
          `${fname} مؤهل مبدئيًا لتمويل SIDF. افتح خارطة الطريق للحصول على حزمة طلب جاهزة، أو استخدم حاسبة العائد لتحديد المبلغ.`,
        );
      }
      return hi(
        `SIDF eligibility is assessed during onboarding based on factory size, sector, and CR status. To improve eligibility, focus on dimensions tagged "SIDF-relevant" in your gap analysis.`,
        `أهلية SIDF تُقيَّم أثناء التسجيل. لتحسين الأهلية ركّز على الأبعاد الموسومة بـ SIDF في تحليل الفجوات.`,
      );
    }

    // Roadmap
    if (/roadmap|plan|initiative|milestone|خارطة|خطة|مبادرة|معلم/i.test(q)) {
      return hi(
        `Your roadmap is structured in 3 phases: Foundation → Acceleration → Optimization. Phase 1 tackles quick-wins and critical gaps. Each initiative has milestones you can mark complete to track progress.`,
        `خارطة الطريق مبنية على 3 مراحل: التأسيس → التسريع → التحسين. المرحلة 1 تعالج المكاسب السريعة والفجوات الحرجة.`,
      );
    }

    // Certificate
    if (/certificate|certif|cert|شهادة/i.test(q)) {
      if (ctx.certificate) {
        return hi(
          `Your SIRI certificate code is ${ctx.certificate}. It's valid for 12 months from issue date. You can verify it publicly at /verify/${ctx.certificate} — that link is QR-coded on the certificate.`,
          `رمز شهادة SIRI الخاصة بك هو ${ctx.certificate}. صالحة لمدة 12 شهرًا. يمكن التحقق العام عبر /verify/${ctx.certificate}.`,
        );
      }
      return hi(
        `You earn a SIRI Certificate of Compliance by completing and submitting a full self-assessment. It's digitally signed and QR-verifiable.`,
        `تحصل على شهادة SIRI بإكمال وتسليم تقييم ذاتي كامل. موقعة رقميًا وقابلة للتحقق عبر QR.`,
      );
    }

    // Framework
    if (/framework|dimension|pillar|building|siri.*mean|إطار|بُعد|ركيزة|لبنة/i.test(q)) {
      return hi(
        `SIRI is built on 3 building blocks (Process, Technology, Organization), 8 pillars, and 16 dimensions — each scored 0–5. Visit /siri to explore the framework interactively.`,
        `SIRI مكوّن من 3 لبنات (العملية، التقنية، المنظمة) و 8 ركائز و 16 بُعدًا — كل منها يُقيَّم من 0 إلى 5. زُر /siri.`,
      );
    }

    // Help
    if (/help|what can|how to|ماذا|كيف/i.test(q)) {
      return hi(
        `I can answer questions about: your SIRI score and trend, biggest gaps, roadmap status, SIDF financing, and the framework itself. Try: "What's my score?", "What are my biggest gaps?", or "Am I SIDF-eligible?"`,
        `يمكنني الإجابة عن: درجة SIRI لديك، أكبر الفجوات، حالة خارطة الطريق، تمويل SIDF، والإطار نفسه. جرّب: "ما درجتي؟" أو "ما أهلية SIDF؟"`,
      );
    }

    // Fallback
    return hi(
      `I'm still learning, and that's a great question. Try asking about your SIRI score, gap analysis priorities, SIDF eligibility, or the roadmap phases.`,
      `ما زلت أتعلّم. جرب السؤال عن درجة SIRI أو أولويات الفجوات أو أهلية SIDF أو مراحل خارطة الطريق.`,
    );
  }

  private suggestions(lang: 'en' | 'ar') {
    if (lang === 'ar') {
      return [
        'ما درجة SIRI الحالية؟',
        'ما أكبر 3 فجوات لدي؟',
        'هل أنا مؤهل لتمويل SIDF؟',
        'كيف تسير خارطة الطريق؟',
        'ما هو إطار SIRI؟',
      ];
    }
    return [
      "What's my current SIRI score?",
      "What are my 3 biggest gaps?",
      "Am I eligible for SIDF financing?",
      "How is my roadmap progressing?",
      "Explain the SIRI framework.",
    ];
  }
}
