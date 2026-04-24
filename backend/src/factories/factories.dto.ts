import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { IndustryGroup, SizeClassification } from '@prisma/client';

export class CreateFactoryDto {
  @IsString()
  @Length(10, 10, { message: 'CR number must be exactly 10 digits' })
  crNumber: string;

  @IsString()
  nameAr: string;

  @IsString()
  nameEn: string;

  @IsEnum(IndustryGroup)
  industryGroup: IndustryGroup;

  @IsEnum(SizeClassification)
  sizeClassification: SizeClassification;

  @IsInt()
  @Min(1)
  employeeCount: number;

  @IsOptional()
  @IsInt()
  foundingYear?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsString()
  addressAr?: string;

  @IsOptional()
  @IsString()
  addressEn?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;
}

export class UpdateFactoryDto {
  @IsOptional() @IsString() nameAr?: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsOptional() @IsEnum(SizeClassification) sizeClassification?: SizeClassification;
  @IsOptional() @IsInt() employeeCount?: number;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() governorate?: string;
  @IsOptional() @IsString() addressAr?: string;
  @IsOptional() @IsString() addressEn?: string;
  @IsOptional() @IsString() contactEmail?: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsOptional() @IsInt() onboardingStep?: number;
}
