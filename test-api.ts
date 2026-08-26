import handler from './api/index.ts';

const req = {
  url: '/api/admin/login',
  method: 'POST',
  body: { username: 'admin', password: 'admin123' },
  headers: { 'content-type': 'application/json' },
};

const res = {
  status(code) { console.log('STATUS:', code); return this; },
  json(body) { console.log('JSON:', body); return this; },
  setHeader(k, v) { console.log('HEADER:', k, v); return this; },
};

async function run() {
  try {
    await handler(req as any, res as any);
  } catch (err) {
    console.error('Crash:', err);
  }
}
run();
