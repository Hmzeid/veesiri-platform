import { IsDateString, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GenerateGapDto {
  @IsString()
  assessmentId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  targetScore?: number;

  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
