import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import app from "../dist/app.mjs";

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("health endpoints remain available", async () => {
  for (const path of ["/health", "/api/healthz"]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, path);
  }
});

test("retired school modules return the shared JSON 404", async () => {
  const retiredPaths = [
    "/sessions",
    "/attendance",
    "/announcements",
    "/events",
    "/parent-links",
    "/users/my-children",
    "/staff",
    "/leave",
    "/payroll",
    "/messages",
    "/timetable",
    "/exams",
    "/books",
    "/borrows",
    "/reports/hr",
    "/reports/attendance",
  ];

  for (const path of retiredPaths) {
    const response = await fetch(`${baseUrl}/api/school${path}`);
    assert.equal(response.status, 404, path);
    assert.deepEqual(await response.json(), { error: "Not found" }, path);
  }
});

test("retained school modules still require authentication", async () => {
  for (const path of [
    "/me",
    "/courses",
    "/enrollments",
    "/quizzes",
    "/grades",
    "/payments",
  ]) {
    const response = await fetch(`${baseUrl}/api/school${path}`);
    assert.equal(response.status, 401, path);
    assert.deepEqual(await response.json(), { error: "Unauthorized" }, path);
  }
});
