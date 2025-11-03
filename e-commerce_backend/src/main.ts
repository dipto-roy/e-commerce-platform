import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // Add cookie parser middleware
  app.use(cookieParser());

  // API Versioning: Set global prefix for all routes
  // This prepares the structure for versioned APIs (/api/v1, /api/v2, etc.)
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe());

  // Get CORS origins from environment variable or use defaults
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000', // Next.js frontend (current)
        'http://localhost:4050', // Alternative frontend port
        'http://localhost:4051', // Alternative frontend port
        'http://localhost:7000', // Previous frontend port
      ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // FIXED: Proper static file serving configuration
  const imagePath = join(__dirname, '..', 'image');
  console.log('📁 Static image path:', imagePath);

  app.useStaticAssets(imagePath, {
    prefix: '/images/',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setHeaders: (res, _path) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=31536000');
    },
  });

  // NEW: Static serving for uploaded images - FIXED PATH
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('📁 Uploads path:', uploadsPath);

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setHeaders: (res, path) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=31536000');
    },
  });

  // Swagger API Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Commerce Platform API')
    .setDescription(
      'Complete API documentation for the E-Commerce platform with authentication, products, orders, notifications, and seller management.',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management operations')
    .addTag('Products', 'Product CRUD operations and management')
    .addTag('Sellers', 'Seller verification and management')
    .addTag('Orders', 'Order processing and management')
    .addTag('Cart', 'Shopping cart operations')
    .addTag('Notifications', 'Real-time notifications with Pusher')
    .addTag('Admin', 'Admin-only operations')
    .addTag('Image Upload', 'Product image upload and management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'JWT token stored in HTTP-only cookie',
    })
    .addServer('http://localhost:4002', 'Development Server')
    .addServer('http://localhost:4002/api/v1', 'API v1')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'E-Commerce API Documentation',
    customfavIcon: 'https://nestjs.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = configService.get<number>('PORT') || 4002;

  try {
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(
      `🌍 Environment: ${configService.get<string>('NODE_ENV') || 'development'}`,
    );
    console.log(`📁 Images available at: http://localhost:${port}/images/`);
    console.log(
      `🔧 API endpoints available at: http://localhost:${port}/api/v1/`,
    );
    console.log(
      `📚 Swagger API Documentation: http://localhost:${port}/api-docs`,
    );
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `❌ Port ${port} is already in use. Please try a different port.`,
      );
      console.error(
        `💡 You can set a different port using: PORT=3000 npm run start:dev`,
      );
    } else {
      console.error('❌ Failed to start application:', error.message);
    }
    process.exit(1);
  }
}
bootstrap();
