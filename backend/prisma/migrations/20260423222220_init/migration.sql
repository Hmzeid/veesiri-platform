-- CreateEnum
CREATE TYPE "IndustryGroup" AS ENUM ('AEROSPACE', 'AUTOMOTIVE', 'ELECTRONICS', 'ENERGY_CHEMICALS', 'FOOD_BEVERAGE', 'GENERAL_MANUFACTURING', 'LOGISTICS', 'OIL_GAS', 'MACHINERY_EQUIPMENT', 'MEDICAL_TECHNOLOGY', 'PHARMACEUTICALS', 'PRECISION_PARTS', 'SEMICONDUCTORS', 'TEXTILE_CLOTHING');

-- CreateEnum
CREATE TYPE "SizeClassification" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "FactoryStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "FactoryRole" AS ENUM ('ADMIN', 'ASSESSOR', 'QUALITY_MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "BuildingBlock" AS ENUM ('PROCESS', 'TECHNOLOGY', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "Pillar" AS ENUM ('OPERATIONS', 'SUPPLY_CHAIN', 'PRODUCT_LIFECYCLE', 'AUTOMATION', 'CONNECTIVITY', 'INTELLIGENCE', 'TALENT_READINESS', 'STRUCTURE_MANAGEMENT');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('SELF', 'ASSESSOR_VERIFIED', 'RENEWAL');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'CERTIFIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "GapSeverity" AS ENUM ('CRITICAL', 'MODERATE', 'MINOR', 'ON_TRACK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nameAr" TEXT,
    "nameEn" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "crNumber" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "industryGroup" "IndustryGroup" NOT NULL,
    "sizeClassification" "SizeClassification" NOT NULL,
    "employeeCount" INTEGER NOT NULL DEFAULT 0,
    "annualRevenueSar" DECIMAL(18,2),
    "foundingYear" INTEGER,
    "region" TEXT,
    "city" TEXT,
    "governorate" TEXT,
    "gpsLat" DECIMAL(10,7),
    "gpsLng" DECIMAL(10,7),
    "addressAr" TEXT,
    "addressEn" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "sidfEligible" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 1,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'BASIC',
    "status" "FactoryStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryUser" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "FactoryRole" NOT NULL DEFAULT 'VIEWER',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "FactoryUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryCertification" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "certificationType" TEXT NOT NULL,
    "certificationNumber" TEXT,
    "issuingBody" TEXT,
    "issuedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactoryCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "dimensionCode" TEXT NOT NULL,
    "dimensionNameAr" TEXT NOT NULL,
    "dimensionNameEn" TEXT NOT NULL,
    "buildingBlock" "BuildingBlock" NOT NULL,
    "pillar" "Pillar" NOT NULL,
    "industryGroup" "IndustryGroup",
    "questionAr" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "level0DescriptorAr" TEXT NOT NULL,
    "level0DescriptorEn" TEXT NOT NULL,
    "level1DescriptorAr" TEXT NOT NULL,
    "level1DescriptorEn" TEXT NOT NULL,
    "level2DescriptorAr" TEXT NOT NULL,
    "level2DescriptorEn" TEXT NOT NULL,
    "level3DescriptorAr" TEXT NOT NULL,
    "level3DescriptorEn" TEXT NOT NULL,
    "level4DescriptorAr" TEXT NOT NULL,
    "level4DescriptorEn" TEXT NOT NULL,
    "level5DescriptorAr" TEXT NOT NULL,
    "level5DescriptorEn" TEXT NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "assessmentType" "AssessmentType" NOT NULL DEFAULT 'SELF',
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "certifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "overallScore" DECIMAL(4,2),
    "processScore" DECIMAL(4,2),
    "technologyScore" DECIMAL(4,2),
    "organizationScore" DECIMAL(4,2),
    "industryGroup" "IndustryGroup" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DimensionResponse" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "dimensionCode" TEXT NOT NULL,
    "buildingBlock" "BuildingBlock" NOT NULL,
    "pillar" "Pillar" NOT NULL,
    "rawScore" INTEGER NOT NULL,
    "weightedScore" DECIMAL(6,3),
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notesAr" TEXT,
    "notesEn" TEXT,
    "respondedById" TEXT,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DimensionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GapAnalysis" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "overallGap" DECIMAL(4,2) NOT NULL,
    "processGap" DECIMAL(4,2) NOT NULL,
    "technologyGap" DECIMAL(4,2) NOT NULL,
    "organizationGap" DECIMAL(4,2) NOT NULL,
    "targetOverallScore" DECIMAL(4,2) NOT NULL DEFAULT 3.5,
    "targetAchievementDate" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GapAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DimensionGap" (
    "id" TEXT NOT NULL,
    "gapAnalysisId" TEXT NOT NULL,
    "dimensionCode" TEXT NOT NULL,
    "currentScore" DECIMAL(4,2) NOT NULL,
    "targetScore" DECIMAL(4,2) NOT NULL,
    "gapMagnitude" DECIMAL(4,2) NOT NULL,
    "priorityRank" INTEGER NOT NULL,
    "severity" "GapSeverity" NOT NULL,
    "estimatedEffortMonths" INTEGER NOT NULL DEFAULT 6,
    "estimatedCostSar" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "isQuickWin" BOOLEAN NOT NULL DEFAULT false,
    "isSidfRelevant" BOOLEAN NOT NULL DEFAULT false,
    "narrativeAr" TEXT,
    "narrativeEn" TEXT,

    CONSTRAINT "DimensionGap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Factory_crNumber_key" ON "Factory"("crNumber");

-- CreateIndex
CREATE INDEX "Factory_tenantId_idx" ON "Factory"("tenantId");

-- CreateIndex
CREATE INDEX "Factory_industryGroup_idx" ON "Factory"("industryGroup");

-- CreateIndex
CREATE INDEX "Factory_region_idx" ON "Factory"("region");

-- CreateIndex
CREATE INDEX "FactoryUser_factoryId_idx" ON "FactoryUser"("factoryId");

-- CreateIndex
CREATE INDEX "FactoryUser_userId_idx" ON "FactoryUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FactoryUser_factoryId_userId_key" ON "FactoryUser"("factoryId", "userId");

-- CreateIndex
CREATE INDEX "FactoryCertification_factoryId_idx" ON "FactoryCertification"("factoryId");

-- CreateIndex
CREATE INDEX "QuestionBank_industryGroup_idx" ON "QuestionBank"("industryGroup");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBank_dimensionCode_industryGroup_key" ON "QuestionBank"("dimensionCode", "industryGroup");

-- CreateIndex
CREATE INDEX "Assessment_factoryId_idx" ON "Assessment"("factoryId");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "DimensionResponse_assessmentId_idx" ON "DimensionResponse"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DimensionResponse_assessmentId_dimensionCode_key" ON "DimensionResponse"("assessmentId", "dimensionCode");

-- CreateIndex
CREATE INDEX "GapAnalysis_factoryId_idx" ON "GapAnalysis"("factoryId");

-- CreateIndex
CREATE INDEX "GapAnalysis_assessmentId_idx" ON "GapAnalysis"("assessmentId");

-- CreateIndex
CREATE INDEX "DimensionGap_gapAnalysisId_idx" ON "DimensionGap"("gapAnalysisId");

-- AddForeignKey
ALTER TABLE "Factory" ADD CONSTRAINT "Factory_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryUser" ADD CONSTRAINT "FactoryUser_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryUser" ADD CONSTRAINT "FactoryUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryCertification" ADD CONSTRAINT "FactoryCertification_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DimensionResponse" ADD CONSTRAINT "DimensionResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DimensionResponse" ADD CONSTRAINT "DimensionResponse_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GapAnalysis" ADD CONSTRAINT "GapAnalysis_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GapAnalysis" ADD CONSTRAINT "GapAnalysis_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DimensionGap" ADD CONSTRAINT "DimensionGap_gapAnalysisId_fkey" FOREIGN KEY ("gapAnalysisId") REFERENCES "GapAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
