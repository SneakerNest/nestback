import request from 'supertest';
import app from '../src/server.js'; // Adjust if your server file is in a different path
import { pool } from '../src/config/database.js';

describe('🛒 Cart API', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(done);
  });

  afterAll((done) => {
    server.close(done);
    pool.end(); // Close DB connection pool
  });

  it('should respond to GET /cart with welcome message', async () => {
    const res = await request(server).get('/cart');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Cart API, welcome!');
  });

  it('should create or fetch a temporary cart on POST /cart/fetch', async () => {
    const res = await request(server)
      .post('/cart/fetch')
      .set('Content-Type', 'application/json')
      .send({}); // No customerID, so acts like guest

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cartID');
    expect(res.body).toHaveProperty('temporary', true);
    expect(res.body).toHaveProperty('loggedIn', false);
    expect(res.body).toHaveProperty('products');
  });
});
