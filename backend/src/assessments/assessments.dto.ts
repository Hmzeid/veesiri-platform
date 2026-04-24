import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class StartAssessmentDto {
  @IsString()
  factoryId: string;
}

export class SaveResponseDto {
  @IsInt()
  @Min(0)
  @Max(5)
  rawScore: number;

  @IsOptional()
  @IsString()
  notesAr?: string;

  @IsOptional()
  @IsString()
  notesEn?: string;
}
