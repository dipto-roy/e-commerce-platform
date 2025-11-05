import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';

describe('Authentication System (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  // Test user credentials
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `testuser_${Date.now()}@example.com`,
    password: 'Test123!@#',
    role: 'USER',
    fullName: 'Test User E2E',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global pipes (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Apply cookie parser middleware
    app.use(cookieParser());

    // Set global prefix (same as main.ts)
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register (Signup)', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('username', testUser.username);
          expect(res.body.user).toHaveProperty('email', testUser.email);
          expect(res.body.user).toHaveProperty('role', testUser.role);
          // Password should NOT be in response
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should fail when registering with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toMatch(/already exists|duplicate/i);
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'invaliduser',
          email: 'invalid-email',
          password: 'Test123!@#',
          role: 'USER',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'shortpass',
          email: 'shortpass@example.com',
          password: '123',
          role: 'USER',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'incomplete',
          // Missing email, password, role
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          // Check response structure
          expect(res.body).toHaveProperty('message', 'Login successful');
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body).toHaveProperty('user');

          // Validate tokens
          expect(res.body.access_token).toBeTruthy();
          expect(res.body.refresh_token).toBeTruthy();
          expect(typeof res.body.access_token).toBe('string');
          expect(typeof res.body.refresh_token).toBe('string');

          // Store tokens for later tests
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;

          // Check user object
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('username', testUser.username);
          expect(res.body.user).toHaveProperty('email', testUser.email);
          expect(res.body.user).not.toHaveProperty('password');

          // Check cookies
          expect(res.headers['set-cookie']).toBeDefined();
          const cookies = Array.isArray(res.headers['set-cookie'])
            ? res.headers['set-cookie']
            : [res.headers['set-cookie']];
          expect(
            cookies.some((cookie: string) => cookie.includes('access_token')),
          ).toBe(true);
          expect(
            cookies.some((cookie: string) => cookie.includes('refresh_token')),
          ).toBe(true);

          // Verify HttpOnly flag is set
          expect(
            cookies.some((cookie: string) => cookie.includes('HttpOnly')),
          ).toBe(true);
        });
    });

    it('should login with username instead of email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.username, // Using username in email field
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toMatch(/invalid|incorrect|unauthorized/i);
        });
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!@#',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should fail with missing credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get user profile with valid JWT token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('username', testUser.username);
          expect(res.body.user).toHaveProperty('email', testUser.email);
          expect(res.body.user).toHaveProperty('role', testUser.role);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should fail without authentication token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should fail with expired token format', () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshToken}`])
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toMatch(/refresh|success/i);

          // Check that new cookies are set
          expect(res.headers['set-cookie']).toBeDefined();
          const cookies = Array.isArray(res.headers['set-cookie'])
            ? res.headers['set-cookie']
            : [res.headers['set-cookie']];
          expect(
            cookies.some((cookie: string) => cookie.includes('access_token')),
          ).toBe(true);
          expect(
            cookies.some((cookie: string) => cookie.includes('refresh_token')),
          ).toBe(true);
        });
    });

    it('should fail without refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toMatch(/refresh token|not found/i);
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refresh_token=invalid-token'])
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', [
          `access_token=${accessToken}`,
          `refresh_token=${refreshToken}`,
        ])
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toMatch(/logged out|success/i);

          // Check that cookies are cleared
          expect(res.headers['set-cookie']).toBeDefined();
          const cookies = Array.isArray(res.headers['set-cookie'])
            ? res.headers['set-cookie']
            : [res.headers['set-cookie']];

          // Verify cookies are set to expire
          cookies.forEach((cookie: string) => {
            if (
              cookie.includes('access_token') ||
              cookie.includes('refresh_token')
            ) {
              expect(cookie).toMatch(/Max-Age=0|Expires=/);
            }
          });
        });
    });

    it('should logout even without tokens', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send OTP for valid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toMatch(/OTP|sent|email/i);
        });
    });

    it('should handle non-existent email gracefully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect((res) => {
          // Should not reveal if email exists (security best practice)
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should enforce rate limiting', async () => {
      // Make multiple requests quickly
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/api/v1/auth/forgot-password')
            .send({ email: testUser.email }),
        );
      }

      const responses = await Promise.all(requests);

      // At least one should be rate limited (429)
      const rateLimited = responses.some((res) => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Security Tests', () => {
    it('should not expose sensitive data in responses', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect((res) => {
          // Check that password is not in response
          const responseStr = JSON.stringify(res.body);
          expect(responseStr).not.toContain(testUser.password);

          // Check user object doesn't have password
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should set secure cookie attributes', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect((res) => {
          const cookies = Array.isArray(res.headers['set-cookie'])
            ? res.headers['set-cookie']
            : [res.headers['set-cookie']];

          cookies.forEach((cookie: string) => {
            if (
              cookie.includes('access_token') ||
              cookie.includes('refresh_token')
            ) {
              // Check HttpOnly flag
              expect(cookie).toContain('HttpOnly');

              // Check SameSite flag
              expect(cookie).toMatch(/SameSite=(Strict|strict)/i);

              // Note: Secure flag is only set in production
              // Check Path is set
              expect(cookie).toContain('Path=/');
            }
          });
        });
    });

    it('should validate JWT token structure', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect((res) => {
          const token = res.body.access_token;

          // JWT should have 3 parts separated by dots
          const parts = token.split('.');
          expect(parts).toHaveLength(3);

          // Each part should be base64 encoded
          parts.forEach((part: string) => {
            expect(part).toMatch(/^[A-Za-z0-9_-]+$/);
          });
        });
    });

    it('should prevent SQL injection in login', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: "admin' OR '1'='1",
          password: "password' OR '1'='1",
        })
        .expect((res) => {
          // Should fail authentication, not cause SQL error
          expect(res.status).toBe(401);
          expect(res.body).not.toHaveProperty('sqlMessage');
        });
    });

    it('should sanitize error messages', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer malformed-token')
        .expect(401)
        .expect((res) => {
          // Error message should not expose internal details
          const errorMsg = res.body.message.toLowerCase();
          expect(errorMsg).not.toContain('stack');
          expect(errorMsg).not.toContain('database');
          expect(errorMsg).not.toContain('sql');
        });
    });
  });

  describe('Token Lifecycle', () => {
    let newAccessToken: string;
    let newRefreshToken: string;

    it('should complete full authentication flow', async () => {
      // 1. Register
      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: `lifecycle_${Date.now()}`,
          email: `lifecycle_${Date.now()}@example.com`,
          password: 'Test123!@#',
          role: 'USER',
        })
        .expect(201);

      expect(registerRes.body.user).toHaveProperty('id');

      // 2. Login
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: registerRes.body.user.email,
          password: 'Test123!@#',
        })
        .expect(201);

      newAccessToken = loginRes.body.access_token;
      newRefreshToken = loginRes.body.refresh_token;

      expect(newAccessToken).toBeTruthy();
      expect(newRefreshToken).toBeTruthy();

      // 3. Access Protected Route
      const profileRes = await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(profileRes.body.user).toHaveProperty(
        'email',
        registerRes.body.user.email,
      );

      // 4. Refresh Tokens
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refresh_token=${newRefreshToken}`])
        .expect(201);

      expect(refreshRes.body).toHaveProperty('message');

      // 5. Logout
      const logoutRes = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', [
          `access_token=${newAccessToken}`,
          `refresh_token=${newRefreshToken}`,
        ])
        .expect(201);

      expect(logoutRes.body.message).toMatch(/logged out|success/i);
    });
  });
});
