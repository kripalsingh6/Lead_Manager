import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';

describe('Authentication & Session Audit Tests', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Audit QA User',
    email: `audit.user.${timestamp}@leadmanager.io`,
    password: 'SecurePassword123!'
  };
  let authToken = '';

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  it('POST /api/auth/register should create user with valid information', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testUser.email.toLowerCase());
    assert.equal(res.body.data.user.password, undefined); // Password never leaked
    assert.ok(res.body.data.token);
    authToken = res.body.data.token;
  });

  it('POST /api/auth/register should reject duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('already exists'));
  });

  it('POST /api/auth/register should reject invalid email format with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'SecurePassword123!'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('POST /api/auth/register should reject short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Password User',
        email: `short.${timestamp}@leadmanager.io`,
        password: '123'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('POST /api/auth/login should authenticate with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, testUser.email.toLowerCase());
  });

  it('POST /api/auth/login should reject incorrect password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('POST /api/auth/login should reject non-existent user with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'does.not.exist@leadmanager.io',
        password: 'AnyPassword123!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('GET /api/auth/me should return authenticated user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, testUser.email.toLowerCase());
  });

  it('GET /api/auth/me should return 401 when accessed without token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('GET /api/auth/me should return 401 with tampered/invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.tampered.token');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('PUT /api/auth/profile should update user preferences and onboarding state', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated QA Master',
        role: 'Sales Director',
        domain: 'Fintech'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Updated QA Master');
  });

  it('POST /api/auth/logout should clear session cookie and return 200', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});

