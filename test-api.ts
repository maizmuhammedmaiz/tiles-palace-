import handler from './api/index.js';

async function testEndpoint(url: string, method = 'GET') {
  return new Promise((resolve) => {
    let statusCode = 200;
    const resHeaders: Record<string, string> = {};
    const req: any = {
      url,
      method,
      headers: { 'content-type': 'application/json' },
      body: {},
      query: {},
      params: {},
    };
    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      setHeader(k: string, v: string) {
        resHeaders[k] = v;
        return this;
      },
      json(body: any) {
        resolve({ url, status: statusCode, body, headers: resHeaders });
        return this;
      },
      send(body: any) {
        resolve({ url, status: statusCode, body, headers: resHeaders });
        return this;
      },
      end(body: any) {
        resolve({ url, status: statusCode, body, headers: resHeaders });
        return this;
      },
    };

    handler(req, res);
  });
}

async function run() {
  console.log('Testing /api/debug...');
  const debugRes = await testEndpoint('/api/debug');
  console.log('Result /api/debug:', JSON.stringify(debugRes, null, 2));

  console.log('Testing /api/settings...');
  const settingsRes = await testEndpoint('/api/settings');
  console.log('Result /api/settings:', JSON.stringify(settingsRes, null, 2));

  console.log('Testing /api/products...');
  const productsRes = await testEndpoint('/api/products');
  console.log('Result /api/products:', JSON.stringify(productsRes, null, 2));

  process.exit(0);
}

run();

