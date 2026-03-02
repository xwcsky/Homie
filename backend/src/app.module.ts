import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { FinancesModule } from './finances/finances.module';
import { ShoppingModule } from './shopping/shopping.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, ApartmentsModule, FinancesModule, ShoppingModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
