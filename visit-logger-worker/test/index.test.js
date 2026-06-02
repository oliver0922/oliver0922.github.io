import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/index.js";

const env = {
  ADMIN_TOKEN: "owner-secret",
  ALLOWED_ORIGIN: "https://oliver0922.github.io",
  RETENTION_DAYS: "90",
};

test("collects a visit from the configured website", async () => {
  const db = new FakeDb();
  const tasks = [];
  const request = new Request(
    "https://logger.example/collect.gif?path=%2FOpenBox%2F&referrer=https%3A%2F%2Fexample.com",
    {
      headers: {
        "CF-Connecting-IP": "203.0.113.10",
        Referer: "https://oliver0922.github.io/",
        "User-Agent": "test-browser",
      },
    },
  );
  const response = await worker.fetch(request, { ...env, DB: db }, {
    waitUntil(task) {
      tasks.push(task);
    },
  });

  await Promise.all(tasks);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "image/gif");
  assert.equal(db.runs.length, 1);
  assert.equal(db.runs[0].values[1], "203.0.113.10");
  assert.equal(db.runs[0].values[9], "/OpenBox/");
});

test("rejects collection requests from other websites", async () => {
  const db = new FakeDb();
  const request = new Request("https://logger.example/collect.gif", {
    headers: {
      "CF-Connecting-IP": "203.0.113.10",
      Referer: "https://example.com/",
    },
  });
  const response = await worker.fetch(request, { ...env, DB: db }, {
    waitUntil() {},
  });

  assert.equal(response.status, 403);
  assert.equal(db.runs.length, 0);
});

test("requires the owner token to list visits", async () => {
  const db = new FakeDb();
  const response = await worker.fetch(
    new Request("https://logger.example/admin"),
    { ...env, DB: db },
    {},
  );

  assert.equal(response.status, 401);
});

test("lists visits for the owner", async () => {
  const db = new FakeDb();
  const response = await worker.fetch(
    new Request("https://logger.example/admin?limit=10", {
      headers: {
        Authorization: "Bearer owner-secret",
      },
    }),
    { ...env, DB: db },
    {},
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.total, 1);
  assert.deepEqual(body.visits, [{ ip: "203.0.113.10" }]);
});

class FakeDb {
  constructor() {
    this.runs = [];
  }

  prepare(sql) {
    return new FakeStatement(this, sql);
  }

  async batch() {
    return [
      { results: [{ count: 1 }] },
      { results: [{ ip: "203.0.113.10" }] },
    ];
  }
}

class FakeStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.values = [];
  }

  bind(...values) {
    this.values = values;
    return this;
  }

  async run() {
    this.db.runs.push({
      sql: this.sql,
      values: this.values,
    });
  }
}

