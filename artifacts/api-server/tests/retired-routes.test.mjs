import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import jwt from "jsonwebtoken";

import app, { setSupabaseClientForTest } from "../dist/app.mjs";

let server;
let baseUrl;
let mock;

const baseUsers = () => [
  {
    id: 1,
    username: "admin",
    password: "pw",
    name: "Admin",
    email: "admin@example.test",
    phone: "",
    role: "admin",
    is_active: true,
    created_at: "2026-01-01",
  },
  {
    id: 2,
    username: "instructor",
    password: "pw",
    name: "Instructor",
    email: "instructor@example.test",
    phone: "",
    role: "instructor",
    is_active: true,
    created_at: "2026-01-01",
  },
  {
    id: 3,
    username: "student",
    password: "pw",
    name: "Student",
    email: "student@example.test",
    phone: "",
    role: "student",
    is_active: true,
    created_at: "2026-01-01",
  },
  {
    id: 4,
    username: "inactive",
    password: "pw",
    name: "Inactive",
    email: "inactive@example.test",
    phone: "",
    role: "student",
    is_active: false,
    created_at: "2026-01-01",
  },
  {
    id: 5,
    username: "legacy",
    password: "pw",
    name: "Legacy",
    email: "legacy@example.test",
    phone: "",
    role: "parent",
    is_active: false,
    created_at: "2026-01-01",
  },
  {
    id: 6,
    username: "other-student",
    password: "pw",
    name: "Other Student",
    email: "other@example.test",
    phone: "",
    role: "student",
    is_active: true,
    created_at: "2026-01-01",
  },
  {
    id: 7,
    username: "super",
    password: "pw",
    name: "Super",
    email: "super@example.test",
    phone: "",
    role: "super_admin",
    is_active: true,
    created_at: "2026-01-01",
  },
];

class Query {
  constructor(db, table) {
    this.db = db;
    this.table = table;
    this.filters = [];
    this.operation = "select";
    this.singleResult = false;
    this.head = false;
    this.values = undefined;
  }

  select(_columns, options = {}) {
    this.head = Boolean(options.head);
    return this;
  }

  eq(column, value) {
    this.filters.push((row) => String(row[column]) === String(value));
    return this;
  }

  neq(column, value) {
    this.filters.push((row) => String(row[column]) !== String(value));
    return this;
  }

  in(column, values) {
    this.filters.push((row) =>
      values.map(String).includes(String(row[column])),
    );
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderBy = { column, ascending };
    return this;
  }

  limit(count) {
    this.maxRows = count;
    return this;
  }

  maybeSingle() {
    this.singleResult = true;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  update(values) {
    this.operation = "update";
    this.values = values;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  insert(values) {
    this.operation = "insert";
    this.values = values;
    return this;
  }

  then(resolve, reject) {
    return Promise.resolve(this.execute()).then(resolve, reject);
  }

  execute() {
    if (this.db.lookupError && this.table === "school_users") {
      return { data: null, error: { message: "database unavailable" } };
    }
    const rows = this.db.tables[this.table] ?? [];
    let matched = rows.filter((row) =>
      this.filters.every((filter) => filter(row)),
    );
    if (this.operation === "update") {
      matched.forEach((row) => Object.assign(row, this.values));
    } else if (this.operation === "delete") {
      this.db.tables[this.table] = rows.filter((row) => !matched.includes(row));
    } else if (this.operation === "insert") {
      const inserted = Array.isArray(this.values) ? this.values : [this.values];
      rows.push(...inserted);
      matched = inserted;
    }
    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      matched = [...matched].sort(
        (left, right) =>
          String(left[column]).localeCompare(String(right[column])) *
          (ascending ? 1 : -1),
      );
    }
    if (this.maxRows !== undefined) matched = matched.slice(0, this.maxRows);
    if (this.head) return { data: null, count: matched.length, error: null };
    const data = this.singleResult ? (matched[0] ?? null) : matched;
    return { data, error: null };
  }
}

function createMock() {
  const mockDb = {
    lookupError: false,
    tables: {
      school_users: baseUsers(),
      school_courses: [
        {
          id: "course-owned",
          title: "Owned course",
          instructor_id: "2",
          duration: "1 month",
          fee: "",
          students: [],
          materials: [],
          status: "active",
          category: "",
          created_at: "2026-01-01",
        },
        {
          id: "course-other",
          title: "Other course",
          instructor_id: "1",
          duration: "1 month",
          fee: "",
          students: [],
          materials: [],
          status: "active",
          category: "",
          created_at: "2026-01-01",
        },
      ],
      school_enrollments: [
        {
          id: "enrollment-1",
          student_id: "3",
          course_id: "course-owned",
          status: "active",
          fee: "",
          notes: "",
          enrolled_at: "2026-01-01",
          created_at: "2026-01-01",
        },
        {
          id: "enrollment-2",
          student_id: "6",
          course_id: "course-other",
          status: "active",
          fee: "",
          notes: "",
          enrolled_at: "2026-01-01",
          created_at: "2026-01-01",
        },
      ],
      school_quizzes: [
        {
          id: "quiz-1",
          course_id: "course-owned",
          title: "Quiz",
          instructions: "",
          due_date: null,
          time_limit_mins: 0,
          status: "published",
          questions: [
            {
              id: "q1",
              type: "mcq",
              text: "Secret",
              options: ["A", "B"],
              correct: "A",
            },
          ],
          created_by: "2",
          created_at: "2026-01-01",
        },
      ],
      school_payments: [
        {
          id: "payment-1",
          student_id: "3",
          course_id: "course-owned",
          enrollment_id: "enrollment-1",
          amount: "10",
          status: "pending",
          method: "",
          reference: "",
          due_date: null,
          paid_at: null,
          notes: "",
          created_at: "2026-01-01",
        },
      ],
      school_grades: [],
    },
    from(table) {
      return new Query(this, table);
    },
  };
  return mockDb;
}

function auth(userId, staleRole = "admin") {
  const user = mock.tables.school_users.find(
    (candidate) => candidate.id === userId,
  );
  return `Bearer ${jwt.sign({ id: userId, username: user?.username ?? "stale", name: "Token", email: "token@example.test", role: staleRole }, "aoh-school-secret-2026")}`;
}

async function request(path, options = {}) {
  return fetch(`${baseUrl}/api/school${path}`, options);
}

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
  setSupabaseClientForTest(null);
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

beforeEach(() => {
  mock = createMock();
  setSupabaseClientForTest(mock);
});

test("health endpoints remain available", async () => {
  for (const path of ["/health", "/api/healthz"]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, path);
  }
});

test("retired routes return JSON 404 with and without a valid token", async () => {
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
    for (const headers of [{}, { authorization: auth(1) }]) {
      const response = await request(path, { headers });
      assert.equal(response.status, 404, path);
      assert.deepEqual(await response.json(), { error: "Not found" });
    }
  }
});

test("retained routes require authentication", async () => {
  for (const path of [
    "/me",
    "/courses",
    "/enrollments",
    "/quizzes",
    "/grades",
    "/payments",
  ]) {
    const response = await request(path);
    assert.equal(response.status, 401, path);
    assert.deepEqual(await response.json(), { error: "Unauthorized" });
  }
});

test("inactive and unsupported accounts cannot use stale JWT privileges", async () => {
  for (const userId of [4, 5]) {
    const response = await request("/me", {
      headers: { authorization: auth(userId, "super_admin") },
    });
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      error: "This account is no longer authorized",
    });
  }
});

test("authorization lookup outages return 503 instead of 401", async () => {
  mock.lookupError = true;
  const response = await request("/me", {
    headers: { authorization: auth(1) },
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "Authentication service unavailable",
  });
});

test("instructors cannot manage another instructor's course", async () => {
  const response = await request("/courses/course-other/materials", {
    method: "PATCH",
    headers: { authorization: auth(2), "content-type": "application/json" },
    body: JSON.stringify({ materials: [] }),
  });
  assert.equal(response.status, 403);
});

test("students cannot query another student's enrollment records", async () => {
  const response = await request("/enrollments?studentId=6", {
    headers: { authorization: auth(3, "student") },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(
    (await response.json()).map((row) => row.id),
    ["enrollment-1"],
  );
});

test("student quiz responses never include answer keys", async () => {
  const response = await request("/quizzes", {
    headers: { authorization: auth(3, "student") },
  });
  assert.equal(response.status, 200);
  const [quiz] = await response.json();
  assert.equal(quiz.questions[0].correct, undefined);
  assert.deepEqual(quiz.questions[0].options, ["A", "B"]);
});

test("non-admins cannot view another student's payments", async () => {
  const response = await request("/payments?studentId=3", {
    headers: { authorization: auth(2, "instructor") },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test("administrators can reactivate only supported roles and cannot manage super administrators", async () => {
  const legacy = await request("/users/5", {
    method: "PATCH",
    headers: { authorization: auth(1), "content-type": "application/json" },
    body: JSON.stringify({ isActive: true }),
  });
  assert.equal(legacy.status, 400);

  const converted = await request("/users/5", {
    method: "PATCH",
    headers: { authorization: auth(1), "content-type": "application/json" },
    body: JSON.stringify({ role: "student", isActive: true }),
  });
  assert.equal(converted.status, 200);
  assert.equal((await converted.json()).isActive, true);

  const promote = await request("/users/3", {
    method: "PATCH",
    headers: { authorization: auth(1), "content-type": "application/json" },
    body: JSON.stringify({ role: "super_admin" }),
  });
  assert.equal(promote.status, 403);

  const editSuperAdmin = await request("/users/7", {
    method: "PATCH",
    headers: { authorization: auth(1), "content-type": "application/json" },
    body: JSON.stringify({ name: "Changed" }),
  });
  assert.equal(editSuperAdmin.status, 403);

  const deleteSuperAdmin = await request("/users/7", {
    method: "DELETE",
    headers: { authorization: auth(1) },
  });
  assert.equal(deleteSuperAdmin.status, 403);
});

test("administrators cannot deactivate or demote their own account", async () => {
  for (const body of [{ isActive: false }, { role: "student" }]) {
    const response = await request("/users/1", {
      method: "PATCH",
      headers: { authorization: auth(1), "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: "Cannot deactivate or demote your own account",
    });
  }
});

test("the last active super administrator cannot be demoted or deleted", async () => {
  const demote = await request("/users/7", {
    method: "PATCH",
    headers: {
      authorization: auth(7, "super_admin"),
      "content-type": "application/json",
    },
    body: JSON.stringify({ role: "admin" }),
  });
  assert.equal(demote.status, 409);

  const remove = await request("/users/7", {
    method: "DELETE",
    headers: { authorization: auth(7, "super_admin") },
  });
  assert.equal(remove.status, 400);
});

test("course mutations reject missing and retired-field payloads", async () => {
  const missing = await request("/courses", {
    method: "POST",
    headers: { authorization: auth(1) },
  });
  assert.equal(missing.status, 400);

  const retired = await request("/courses/course-owned", {
    method: "PATCH",
    headers: { authorization: auth(1), "content-type": "application/json" },
    body: JSON.stringify({ schedule: "Tuesday" }),
  });
  assert.equal(retired.status, 400);
});
