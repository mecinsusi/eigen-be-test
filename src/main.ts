import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DatabaseService } from './database/database.service';

//Load .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Library')
    .setDescription('API for managing borrowed books and members.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const databaseService = app.get(DatabaseService);
  await databaseService.initialDatabase();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Listening on port:`,port)
}
bootstrap();
