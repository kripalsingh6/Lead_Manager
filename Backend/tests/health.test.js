import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';

describe('Health and System Endpoints', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  it('GET /api/health should return 200 with operational metrics', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Lead Manager API');
    assert.equal(res.body.database, 'connected');
    assert.ok(res.body.uptime);
    assert.ok(res.body.timestamp);
  });

  it('GET / should return root welcome and security layer metadata', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Welcome to the Lead Manager API');
    assert.ok(res.body.security);
    assert.ok(res.body.documentation);
  });

  it('GET /api/unknown-endpoint should return 404 with standardized error response', async () => {
    const res = await request(app).get('/api/non-existent-route-404');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('not found'));
  });

  it('Helmet security headers should be enforced on all responses', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.ok(res.headers['content-security-policy']);
  });
});
