import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';

describe('Leads API & Lifecycle Operations', () => {
  const timestamp = Date.now();
  let userToken = '';
  let createdLeadId = '';

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();

    // Register a dedicated test user for lead operations
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Lead Operations QA',
        email: `lead.qa.${timestamp}@leadmanager.io`,
        password: 'Password123!'
      });
    userToken = regRes.body.data.token;
  });

  it('GET /api/leads without authentication should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/leads');
    assert.equal(res.status, 401);
  });

  it('POST /api/leads should create a new lead with valid data', async () => {
    const newLead = {
      name: 'Sarah Connor',
      email: `sarah.${timestamp}@cyberdyne.com`,
      phone: '+1 555 019 2831',
      company: 'Cyberdyne Systems',
      source: 'LinkedIn',
      status: 'New'
    };

    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newLead);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Sarah Connor');
    assert.equal(res.body.data.company, 'Cyberdyne Systems');
    assert.equal(res.body.data.status, 'New');
    assert.ok(res.body.data.id);
    createdLeadId = res.body.data.id;
  });

  it('POST /api/leads should fail when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        company: 'Missing Name & Email Co'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('POST /api/leads should reject invalid status value', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'John Doe',
        email: 'john.doe@test.com',
        status: 'INVALID_STATUS'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('POST /api/leads should reject invalid source value', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'John Doe',
        email: 'john.doe2@test.com',
        source: 'INVALID_SOURCE'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('GET /api/leads should return paginated list of user leads', async () => {
    const res = await request(app)
      .get('/api/leads?page=1&limit=5')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.pagination);
    assert.equal(res.body.pagination.currentPage, 1);
    assert.equal(res.body.pagination.limit, 5);
  });

  it('GET /api/leads?status=New should filter leads by status', async () => {
    const res = await request(app)
      .get('/api/leads?status=New')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((l) => l.status === 'New'));
  });

  it('GET /api/leads?search=Sarah should search by lead name', async () => {
    const res = await request(app)
      .get('/api/leads?search=Sarah')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.some((l) => l.name.includes('Sarah')));
  });

  it('GET /api/leads?timeRange=today should support time filtering', async () => {
    const res = await request(app)
      .get('/api/leads?timeRange=today')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it('GET /api/leads/:id should retrieve single lead by UUID', async () => {
    const res = await request(app)
      .get(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, createdLeadId);
    assert.equal(res.body.data.name, 'Sarah Connor');
  });

  it('PUT /api/leads/:id should update lead fields and transition status', async () => {
    const res = await request(app)
      .put(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        status: 'Qualified',
        company: 'Cyberdyne Defense Labs'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'Qualified');
    assert.equal(res.body.data.company, 'Cyberdyne Defense Labs');
  });

  it('PUT /api/leads/:id with invalid UUID format should return 400', async () => {
    const res = await request(app)
      .put('/api/leads/not-a-valid-uuid')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'Contacted' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('GET /api/leads/dashboard/stats should return aggregated status and source counts', async () => {
    const res = await request(app)
      .get('/api/leads/dashboard/stats')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(typeof res.body.data.total === 'number');
    assert.ok(res.body.data.byStatus);
    assert.ok(res.body.data.bySource);
    assert.ok(typeof res.body.data.byStatus.Qualified === 'number');
  });

  it('DELETE /api/leads/:id should safely delete lead', async () => {
    const res = await request(app)
      .delete(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify subsequent lookup returns 404
    const verifyRes = await request(app)
      .get(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(verifyRes.status, 404);
  });
});

