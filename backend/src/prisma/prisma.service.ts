import 'dotenv/config'; // <--- TA LINIJKA TO NASZE ZBAWIENIE (ładuje plik .env)
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Teraz proces widzi nasz link do Supabase
    const connectionString = process.env.DATABASE_URL;
    
    // Tworzymy połączenie (z włączonym SSL wymaganym przez chmurę)
    const pool = new Pool({ 
      connectionString,
      ssl: { rejectUnauthorized: false } 
    });
    
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}