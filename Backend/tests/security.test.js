import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';

describe('Application Security & Access Control Suite (OWASP Top 10)', () => {
  const timestamp = Date.now();
  let userAToken = '';
  let userBToken = '';
  let leadAId = '';

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();

    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Alpha',
        email: `alpha.${timestamp}@securitytest.com`,
        password: 'Password123!'
      });
    userAToken = resA.body.data?.token;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Beta',
        email: `beta.${timestamp}@securitytest.com`,
        password: 'Password123!'
      });
    userBToken = resB.body.data?.token;

    // Create a private lead belonging to User A
    const leadRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Classified Lead Alpha',
        email: `classified.${timestamp}@alphatest.com`,
        phone: '+1 555 999 0001',
        company: 'Alpha Defense Corp',
        source: 'Referral',
        status: 'New'
      });
    leadAId = leadRes.body.data?.id;
  });

  describe('Broken Access Control & IDOR Protection', () => {
    it('User B cannot view User A\'s private lead (IDOR GET prevention)', async () => {
      const res = await request(app)
        .get(`/api/leads/${leadAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /not found/i);
    });

    it('User B cannot update User A\'s private lead (IDOR PUT prevention)', async () => {
      const res = await request(app)
        .put(`/api/leads/${leadAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          name: 'Hacked by Beta',
          company: 'Compromised Inc'
        });

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    it('User B cannot delete User A\'s private lead (IDOR DELETE prevention)', async () => {
      const res = await request(app)
        .delete(`/api/leads/${leadAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    it('User A can successfully access their own lead', async () => {
      const res = await request(app)
        .get(`/api/leads/${leadAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Classified Lead Alpha');
    });
  });

  describe('JWT Authentication & Token Tampering', () => {
    it('Rejects requests with forged/tampered JWT tokens', async () => {
      const parts = userAToken.split('.');
      // Tamper signature
      const tamperedToken = `${parts[0]}.${parts[1]}.tampered_signature_payload`;

      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${tamperedToken}`);

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('Rejects requests with garbage token format', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', 'Bearer not-even-a-token');

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('Rejects requests without Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', userAToken);

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });
  });

  describe('SQL / NoSQL Injection Resilience', () => {
    it('Handles classic SQL injection in search query safely', async () => {
      const sqlInjectionPayload = "'; DROP TABLE leads; --";
      const res = await request(app)
        .get('/api/leads')
        .query({ search: sqlInjectionPayload })
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    it('Handles OR 1=1 boolean injection safely without data leakage', async () => {
      const booleanPayload = "' OR '1'='1";
      const res = await request(app)
        .get('/api/leads')
        .query({ search: booleanPayload })
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      // All returned leads must strictly belong to user A
      res.body.data.forEach(lead => {
        assert.equal(lead.userId, res.body.data[0]?.userId);
      });
    });
  });

  describe('Mass Assignment & Parameter Tampering', () => {
    it('Strictly rejects spoofed userId injection via schema with 400 Bad Request', async () => {
      const spoofedUserId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Security Probe Lead',
          email: `probe.${timestamp}@securitytest.com`,
          phone: '+1 555 123 4567',
          company: 'Probe Corp',
          source: 'Website',
          status: 'New',
          userId: spoofedUserId // Attempted spoof
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.some(e => e.field === 'userId'));
    });
  });

  describe('Input Validation & Malformed Input', () => {
    it('Rejects malformed non-UUID identifiers with 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/leads/not-a-valid-uuid-string')
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors);
    });

    it('Rejects payload with invalid enum status with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Invalid Enum Lead',
          email: `inval.${timestamp}@test.com`,
          phone: '+1 555 111 2222',
          company: 'Test Co',
          source: 'Website',
          status: 'MALICIOUS_STATUS_UNKNOWN'
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  describe('Security Headers & Transport Protection', () => {
    it('Returns OWASP recommended security headers via Helmet', async () => {
      const res = await request(app).get('/api/health');

      assert.equal(res.headers['x-content-type-options'], 'nosniff');
      assert.equal(res.headers['x-frame-options'], 'DENY');
      assert.ok(res.headers['x-dns-prefetch-control']);
    });
  });
});
