import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (process.env.CORS_ORIGINS ?? '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin:
      allowedOrigins.length === 1 && allowedOrigins[0] === '*'
        ? true
        : allowedOrigins,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
