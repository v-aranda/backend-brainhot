import request from 'supertest';
import { createApp } from '../../src/main/config/app';

const app = createApp();

describe('User API (integration)', () => {
  it('should respond health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should create a user and list users', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ name: 'Alice', email: 'alice@example.com' })
      .set('Content-Type', 'application/json');

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body).toMatchObject({ name: 'Alice', email: 'alice@example.com' });

    const listRes = await request(app).get('/api/users');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBe(1);
  });

  it('should not allow duplicate email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Alice 2', email: 'alice@example.com' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});


