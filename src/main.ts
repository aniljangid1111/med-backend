import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Express } from 'express';

let cachedServer: Express;

export async function bootstrapServer(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.getHttpAdapter().getInstance().set('etag', false);
  app.use(helmet());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  cachedServer = app.getHttpAdapter().getInstance();
  return cachedServer;
}

// Vercel serverless entry point
export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return new Promise<void>((resolve, reject) => {
    res.on('finish', () => resolve());
    res.on('close', () => resolve());
    res.on('error', (err: any) => reject(err));
    server(req, res);
  });
}

// Standalone / Cloud server (Render, Railway, local development)
if (!process.env.VERCEL) {
  async function bootstrap() {
    const server = await bootstrapServer();
    const port = Number(process.env.PORT) || 3001;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Application is running on port: ${port}`);
    });
  }
  bootstrap().catch((err) => {
    console.error('Error during application bootstrap:', err);
    process.exit(1);
  });
}
