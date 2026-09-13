const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
const app = require('../index');
const User = require('../models/User');

// Exercise HTTP routes with real JWT/bcrypt and an isolated in-memory user store.
const users = new Map();
const originals = { create: User.create, findOne: User.findOne, findById: User.findById };
let server, base;
before(async () => {
  User.create = async data => {
    if ([...users.values()].some(u => u.email === data.email)) throw { code: 11000 };
    const user = { ...data, _id: '507f1f77bcf86cd799439011' };
    users.set(user._id, user);
    return user;
  };
  User.findOne = filter => ({ select: async () => [...users.values()].find(u => u.email === filter.email) });
  User.findById = async id => users.get(id);
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  Object.assign(User, originals);
  await new Promise(resolve => server.close(resolve));
});

async function request(path, { body, token, raw } = {}) {
  const response = await fetch(base + path, {
    method: body !== undefined || raw !== undefined ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined)
  });
  return { status: response.status, body: await response.json() };
}

test('registration, login, profile, and current database role control admin access', async () => {
  const body = { name: 'Ayaan', email: ' AYAAN@example.com ', password: '123456' };
  assert.equal((await request('/auth/register', { body: { ...body, role: 'admin' } })).status, 400);
  const registered = await request('/auth/register', { body });
  assert.equal(registered.status, 201);
  assert.equal(registered.body.user.role, 'user');
  assert.equal(registered.body.user.email, 'ayaan@example.com');
  assert.equal(registered.body.user.password, undefined);
  const user = users.get(registered.body.user._id);
  assert.notEqual(user.password, body.password);
  assert.equal(await bcrypt.compare(body.password, user.password), true);
  const claims = jwt.verify(registered.body.token, process.env.JWT_SECRET);
  assert.equal(claims.exp - claims.iat, 3600);
  assert.equal((await request('/auth/register', { body })).status, 409);
  assert.equal((await request('/auth/login', { body: { ...body, password: 'wrong' } })).status, 401);
  assert.equal((await request('/auth/login', { body: { ...body, email: 'absent@example.com' } })).status, 401);
  const login = await request('/auth/login', { body });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.password, undefined);
  const token = login.body.token;
  const profile = await request('/auth/profile', { token });
  assert.equal(profile.status, 200);
  assert.equal(profile.body.user.password, undefined);
  assert.equal((await request('/admin/dashboard', { token })).status, 403);
  user.role = 'admin';
  const admin = await request('/admin/dashboard', { token });
  assert.equal(admin.status, 200);
  assert.equal(admin.body.message, 'Welcome to the admin dashboard, Ayaan');
  user.role = 'user';
  assert.equal((await request('/admin/dashboard', { token })).status, 403);
  users.delete(user._id);
  assert.equal((await request('/auth/profile', { token })).status, 401);
});

test('missing, invalid, expired, wrongly signed tokens and invalid subjects are rejected', async () => {
  const sign = (payload, secret = process.env.JWT_SECRET, options = {}) => jwt.sign(payload, secret, options);
  for (const token of [undefined, 'garbage', sign({ sub: 'invalid' }),
    sign({ sub: '507f1f77bcf86cd799439011' }, 'wrong-secret'),
    sign({ sub: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET, { expiresIn: -1 }),
    sign({ sub: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET, { algorithm: 'HS384' })]) {
    assert.equal((await request('/auth/profile', { token })).status, 401);
  }
  assert.equal((await request('/admin/dashboard')).status, 401);
});

test('invalid input and malformed JSON return 400', async () => {
  for (const body of [{}, [], { name: 'A', email: { $ne: null }, password: '123456' },
    { name: 'A', email: 'a@example.com', password: 'short' },
    { name: 'A', email: 'a@example.com', password: 'x'.repeat(73) }]) {
    assert.equal((await request('/auth/register', { body })).status, 400);
  }
  assert.equal((await request('/auth/login', { body: {} })).status, 400);
  assert.equal((await request('/auth/register', { raw: '{' })).status, 400);
});

test('database failures return a generic 500', async () => {
  const original = User.findById;
  User.findById = async () => { throw new Error('private database details'); };
  try {
    const token = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
    const response = await request('/auth/profile', { token });
    assert.equal(response.status, 500);
    assert.deepEqual(response.body, { message: 'Server error' });
  } finally { User.findById = original; }
});
