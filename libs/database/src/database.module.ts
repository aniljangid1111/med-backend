import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        const isSsl = Boolean(dbUrl || configService.get('DB_SSL') === 'true');

        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            ssl: isSsl ? { rejectUnauthorized: false } : false,
            synchronize: configService.get('NODE_ENV') !== 'production',
            retryAttempts: 3,
            retryDelay: 3000,
            autoLoadEntities: true,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: +configService.get('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'password'),
          database: configService.get<string>('DB_DATABASE', 'medii_track'),
          ssl: isSsl ? { rejectUnauthorized: false } : false,
          synchronize: configService.get('NODE_ENV') !== 'production',
          retryAttempts: 3,
          retryDelay: 3000,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
