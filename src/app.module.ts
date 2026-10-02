import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@database/database';
import { MailModule } from '@app/mail';
import { ControllersModule } from './controllers/controllers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MailModule,
    ControllersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
