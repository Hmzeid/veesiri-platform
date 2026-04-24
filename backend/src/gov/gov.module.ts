import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GovController } from './gov.controller';
import { GovService } from './gov.service';
import { GovAuthService } from './gov-auth.service';
import { GovAuthGuard } from './gov-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev_secret_change_me'),
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [GovController],
  providers: [GovService, GovAuthService, GovAuthGuard],
})
export class GovModule {}
