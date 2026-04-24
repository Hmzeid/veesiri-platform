import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { IndustryGroup } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { QuestionBankService } from './question-bank.service';

@UseGuards(JwtAuthGuard)
@Controller('question-bank')
export class QuestionBankController {
  constructor(private service: QuestionBankService) {}

  @Get(':industryGroup')
  forIndustry(@Param('industryGroup') industryGroup: IndustryGroup) {
    return this.service.forIndustry(industryGroup);
  }
}
