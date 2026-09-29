process.env.APP_ORIGIN = "http://localhost:3000";
process.env.ENABLE_X402 = "false";

const test = require("node:test");
const assert = require("node:assert/strict");
const { app, stepGrid, createEmptyGrid, hashGrid } = require("./server");

test("Conway B3/S23 evolves deterministically", () => {
  const grid = createEmptyGrid(5, 5);
  grid[1][2] = 1;
  grid[2][2] = 1;
  grid[3][2] = 1;

  const next = stepGrid(grid);
  assert.equal(next[2][1], 1);
  assert.equal(next[2][2], 1);
  assert.equal(next[2][3], 1);
  assert.equal(next[1][2], 0);
  assert.equal(next[3][2], 0);
  assert.equal(hashGrid(next, 1), hashGrid(next, 1));
});

test("HTTP health, Conway, advisor and disabled x402 endpoints are truthful", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  t.after(() => server.close());

  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  const healthRes = await fetch(`${base}/health`);
  assert.equal(healthRes.status, 200);
  const health = await healthRes.json();
  assert.equal(health.ok, true);
  assert.equal(health.conwayEngine, "active-in-memory");
  assert.equal(health.aiMode, "scripted-advisor");
  assert.equal(health.x402BazaarReady, false);

  const stateRes = await fetch(`${base}/api/v1/conway/state`);
  assert.equal(stateRes.status, 200);
  const state = await stateRes.json();
  assert.equal(Array.isArray(state.grid), true);
  assert.equal(state.rows, 25);
  assert.equal(state.cols, 25);

  const aiRes = await fetch(`${base}/api/v1/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "status", agentType: "security" }),
  });
  assert.equal(aiRes.status, 200);
  const ai = await aiRes.json();
  assert.equal(ai.mode, "scripted-advisor");
  assert.equal(ai.productionAI, false);

  const x402Res = await fetch(`${base}/api/v1/x402/agent/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal: "test" }),
  });
  assert.equal(x402Res.status, 503);
});
