import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { FinancesModule } from './finances/finances.module';
import { ShoppingModule } from './shopping/shopping.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FlatsModule } from './flats/flats.module';
import { TasksModule } from './tasks/tasks.module';
import { BillsModule } from './bills/bills.module';

@Module({
  imports: [
       AuthModule,
       ApartmentsModule,
       FinancesModule,
       ShoppingModule,
       PrismaModule,
       ConfigModule.forRoot({
        isGlobal: true, 
      }),
       FlatsModule,
       TasksModule,
       BillsModule,
      ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
