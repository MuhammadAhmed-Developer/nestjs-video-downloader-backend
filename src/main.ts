import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Server running on port ${port}`);
}
bootstrap();
