import http from 'node:http';
import app from '../src/app.js';
import sequelize, { connectDB } from '../src/config/database.js';

process.env.NODE_ENV = 'test';

const runTier = async (serverUrl, token, concurrency, totalRequests) => {
  const latencies = [];
  let successful = 0;
  let failed = 0;
  let inFlight = 0;
  let completed = 0;

  const startTime = Date.now();
  const initialMem = process.memoryUsage().heapUsed / 1024 / 1024;

  return new Promise((resolve) => {
    const launchNext = () => {
      if (completed >= totalRequests) {
        return;
      }

      while (inFlight < concurrency && (inFlight + completed) < totalRequests) {
        inFlight++;
        const reqStart = performance.now();

        const req = http.get(
          `${serverUrl}/api/leads?page=1&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Connection: 'keep-alive'
            }
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              const reqDuration = performance.now() - reqStart;
              latencies.push(reqDuration);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                successful++;
              } else {
                failed++;
              }
              inFlight--;
              completed++;

              if (completed === totalRequests) {
                const totalDuration = (Date.now() - startTime) / 1000;
                const finalMem = process.memoryUsage().heapUsed / 1024 / 1024;
                latencies.sort((a, b) => a - b);

                const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
                const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
                const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
                const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
                const rps = (totalRequests / totalDuration).toFixed(2);

                resolve({
                  concurrency,
                  totalRequests,
                  successful,
                  failed,
                  errorRate: ((failed / totalRequests) * 100).toFixed(2) + '%',
                  durationSec: totalDuration.toFixed(2),
                  rps,
                  avgLatencyMs: avg.toFixed(2),
                  p50LatencyMs: p50.toFixed(2),
                  p95LatencyMs: p95.toFixed(2),
                  p99LatencyMs: p99.toFixed(2),
                  heapUsedMb: finalMem.toFixed(2)
                });
              } else {
                launchNext();
              }
            });
          }
        );

        req.on('error', (err) => {
          failed++;
          inFlight--;
          completed++;
          latencies.push(performance.now() - reqStart);
          if (completed === totalRequests) {
            resolve({ concurrency, totalRequests, successful, failed, error: err.message });
          } else {
            launchNext();
          }
        });
      }
    };

    launchNext();
  });
};

const main = async () => {
  console.log('🚀 Initializing Lead Manager Concurrency & Load Benchmark...');
  await connectDB();

  // Create HTTP server on dynamic port
  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  const address = server.address();
  const serverUrl = `http://127.0.0.1:${address.port}`;
  console.log(`📡 Benchmark target running at ${serverUrl}`);

  // Register dedicated benchmark user
  const benchmarkEmail = `loadtest.${Date.now()}@leadmanager.io`;
  const regRes = await fetch(`${serverUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Load Test Runner',
      email: benchmarkEmail,
      password: 'BenchmarkPassword123!'
    })
  });
  const regData = await regRes.json();
  const token = regData.data.token;
  console.log('👤 Benchmark user registered and authenticated.');

  // Pre-seed sample leads for query realistic execution
  console.log('🌱 Pre-seeding query load dataset...');
  await fetch(`${serverUrl}/api/leads?page=1&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const tiers = [
    { concurrency: 10, totalRequests: 50 },
    { concurrency: 100, totalRequests: 200 },
    { concurrency: 500, totalRequests: 500 },
    { concurrency: 1000, totalRequests: 1000 }
  ];

  const results = [];
  console.log('\n📊 Executing Concurrency Tiers:');
  console.log('------------------------------------------------------------------------------------------------------------------------');
  console.log('| Virtual Users | Total Reqs | Success | Failed | Error Rate | RPS     | Avg Latency | P50 (ms) | P95 (ms) | P99 (ms) |');
  console.log('------------------------------------------------------------------------------------------------------------------------');

  for (const tier of tiers) {
    const result = await runTier(serverUrl, token, tier.concurrency, tier.totalRequests);
    results.push(result);
    console.log(
      `| ${String(result.concurrency).padEnd(13)} | ` +
      `${String(result.totalRequests).padEnd(10)} | ` +
      `${String(result.successful).padEnd(7)} | ` +
      `${String(result.failed).padEnd(6)} | ` +
      `${String(result.errorRate).padEnd(10)} | ` +
      `${String(result.rps).padEnd(7)} | ` +
      `${String(result.avgLatencyMs + ' ms').padEnd(11)} | ` +
      `${String(result.p50LatencyMs).padEnd(8)} | ` +
      `${String(result.p95LatencyMs).padEnd(8)} | ` +
      `${String(result.p99LatencyMs).padEnd(8)} |`
    );
  }
  console.log('------------------------------------------------------------------------------------------------------------------------\n');

  console.log('📋 Full JSON Benchmark Report:\n', JSON.stringify(results, null, 2));

  server.close();
  await sequelize.close();
  process.exit(0);
};

main().catch((err) => {
  console.error('Benchmark Error:', err);
  process.exit(1);
});
