import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';

  // CORS notes:
  // - With credentials:true, browsers will *not* accept Access-Control-Allow-Origin: *.
  // - Using '*' (mapped to `origin: true`) effectively reflects any Origin, which is risky
  //   once auth/cookies are involved.
  //
  // Prefer an explicit allowlist via CORS_ORIGINS.
  // Example:
  //   CORS_ORIGINS=http://localhost:5173,chrome-extension://<EXTENSION_ID>
  const corsOriginsEnv = (process.env.CORS_ORIGINS ?? '').trim();
  const allowedOrigins = corsOriginsEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowedOrigins.length > 0) {
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });
  } else if (!isProduction) {
    // Safe-ish defaults for local development only.
    app.enableCors({
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ],
      credentials: true,
    });
  }

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
