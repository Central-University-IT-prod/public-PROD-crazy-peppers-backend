import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { parseEnvironment } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = parseEnvironment();
  await app.listen(config.port);
}

bootstrap();
