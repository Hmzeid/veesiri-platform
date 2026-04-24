-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PhaseStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InitiativeStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('ACTION', 'TECHNOLOGY', 'VENDOR', 'INITIATIVE', 'LEARNING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASSESSMENT_EXPIRY', 'MILESTONE_DUE', 'DOCUMENT_EXPIRY', 'SIDF_UPDATE', 'COMPLIANCE_ALERT', 'SYSTEM', 'BROADCAST', 'RECOMMENDATION', 'CERTIFICATE_ISSUED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CERTIFICATION', 'EVIDENCE', 'REPORT', 'TEMPLATE', 'CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "GovAlertType" AS ENUM ('EXPIRED_ASSESSMENT', 'SCORE_DECLINE', 'SIDF_NON_COMPLIANCE', 'REGISTRATION_ANOMALY');

-- CreateEnum
CREATE TYPE "GovAlertSeverity" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "GovOrganization" AS ENUM ('MIMR', 'SIDF', 'SASO', 'REGIONAL_AUTHORITY', 'OTHER_MINISTRY');

-- CreateEnum
CREATE TYPE "GovRole" AS ENUM ('VIEWER', 'ANALYST', 'DIRECTOR', 'MINISTER');

-- AlterTable
ALTER TABLE "DimensionGap" ADD COLUMN     "estimatedRoiSar" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "peerMedianScore" DECIMAL(4,2),
ADD COLUMN     "peerTop25Score" DECIMAL(4,2);

-- AlterTable
ALTER TABLE "Factory" ADD COLUMN     "sidfAmountSar" DECIMAL(18,2),
ADD COLUMN     "sidfFinanced" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "gapAnalysisId" TEXT NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'DRAFT',
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalBudgetSar" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapPhase" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "targetOverallScore" DECIMAL(4,2),
    "status" "PhaseStatus" NOT NULL DEFAULT 'PLANNED',

    CONSTRAINT "RoadmapPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapInitiative" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "dimensionCode" TEXT,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "budgetSar" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "sidfEligible" BOOLEAN NOT NULL DEFAULT false,
    "ownerUserId" TEXT,
    "vendorName" TEXT,
    "status" "InitiativeStatus" NOT NULL DEFAULT 'PLANNED',
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoadmapInitiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "gapAnalysisId" TEXT,
    "dimensionCode" TEXT NOT NULL,
    "recommendationType" "RecommendationType" NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "rationaleAr" TEXT,
    "rationaleEn" TEXT,
    "estimatedImpactScore" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "estimatedCostSar" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "confidenceScore" DECIMAL(4,2) NOT NULL DEFAULT 0.85,
    "userFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentFolder" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "parentFolderId" TEXT,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "dimensionCode" TEXT,
    "isSystemFolder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "folderId" TEXT,
    "nameAr" TEXT,
    "nameEn" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL DEFAULT 0,
    "fileType" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "dimensionTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "expiryDate" TIMESTAMP(3),
    "accessLevel" TEXT NOT NULL DEFAULT 'all_team',
    "uploadedById" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "siriLevelAchieved" DECIMAL(4,2) NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "digitalSignature" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "pdfUrl" TEXT,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "factoryId" TEXT,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "bodyAr" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "actionUrl" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernmentUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "organization" "GovOrganization" NOT NULL,
    "regionScope" TEXT,
    "role" "GovRole" NOT NULL DEFAULT 'VIEWER',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernmentUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovAlert" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "alertType" "GovAlertType" NOT NULL,
    "severity" "GovAlertSeverity" NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "GovAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkSnapshot" (
    "id" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "industryGroup" "IndustryGroup" NOT NULL,
    "dimensionCode" TEXT NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "meanScore" DECIMAL(4,2) NOT NULL,
    "medianScore" DECIMAL(4,2) NOT NULL,
    "p25Score" DECIMAL(4,2) NOT NULL,
    "p75Score" DECIMAL(4,2) NOT NULL,
    "p90Score" DECIMAL(4,2) NOT NULL,
    "region" TEXT,

    CONSTRAINT "BenchmarkSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Roadmap_factoryId_idx" ON "Roadmap"("factoryId");

-- CreateIndex
CREATE INDEX "RoadmapPhase_roadmapId_idx" ON "RoadmapPhase"("roadmapId");

-- CreateIndex
CREATE INDEX "RoadmapInitiative_phaseId_idx" ON "RoadmapInitiative"("phaseId");

-- CreateIndex
CREATE INDEX "Milestone_initiativeId_idx" ON "Milestone"("initiativeId");

-- CreateIndex
CREATE INDEX "Recommendation_factoryId_idx" ON "Recommendation"("factoryId");

-- CreateIndex
CREATE INDEX "Recommendation_gapAnalysisId_idx" ON "Recommendation"("gapAnalysisId");

-- CreateIndex
CREATE INDEX "DocumentFolder_factoryId_idx" ON "DocumentFolder"("factoryId");

-- CreateIndex
CREATE INDEX "DocumentFolder_parentFolderId_idx" ON "DocumentFolder"("parentFolderId");

-- CreateIndex
CREATE INDEX "Document_factoryId_idx" ON "Document"("factoryId");

-- CreateIndex
CREATE INDEX "Document_folderId_idx" ON "Document"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verificationCode_key" ON "Certificate"("verificationCode");

-- CreateIndex
CREATE INDEX "Certificate_factoryId_idx" ON "Certificate"("factoryId");

-- CreateIndex
CREATE INDEX "Notification_recipientUserId_idx" ON "Notification"("recipientUserId");

-- CreateIndex
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentUser_email_key" ON "GovernmentUser"("email");

-- CreateIndex
CREATE INDEX "GovAlert_factoryId_idx" ON "GovAlert"("factoryId");

-- CreateIndex
CREATE INDEX "GovAlert_severity_idx" ON "GovAlert"("severity");

-- CreateIndex
CREATE INDEX "BenchmarkSnapshot_industryGroup_dimensionCode_idx" ON "BenchmarkSnapshot"("industryGroup", "dimensionCode");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_gapAnalysisId_fkey" FOREIGN KEY ("gapAnalysisId") REFERENCES "GapAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapPhase" ADD CONSTRAINT "RoadmapPhase_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapInitiative" ADD CONSTRAINT "RoadmapInitiative_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "RoadmapPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "RoadmapInitiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_gapAnalysisId_fkey" FOREIGN KEY ("gapAnalysisId") REFERENCES "GapAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "DocumentFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "DocumentFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovAlert" ADD CONSTRAINT "GovAlert_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
