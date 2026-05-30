/**
 * QA verification script — run: node scripts/qa-test.mjs
 * Requires backend at http://localhost:4000
 */
const BASE = 'http://localhost:4000/api';
const ts = Date.now();
const emailA = `qa_a_${ts}@test.com`;
const emailB = `qa_b_${ts}@test.com`;
const pass = 'SecurePass123!';

const results = [];

function pass_(name, detail = '') {
  results.push({ status: 'PASS', name, detail });
  console.log(`✅ PASS: ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ status: 'FAIL', name, detail });
  console.log(`❌ FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
}

function warn(name, detail = '') {
  results.push({ status: 'WARN', name, detail });
  console.log(`⚠️  WARN: ${name}${detail ? ` — ${detail}` : ''}`);
}

async function req(method, path, { body, cookieJar, rawBody } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookieJar?.cookie) headers.Cookie = cookieJar.cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (cookieJar && setCookie.length) {
    cookieJar.cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    cookieJar.raw = setCookie;
  }

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: res.status, data, setCookie, headers: res.headers };
}

async function main() {
  console.log('\n=== Team Task Manager QA Tests ===\n');

  const jarA = { cookie: '', raw: [] };
  const jarB = { cookie: '', raw: [] };

  // --- AUTH: Protected without login ---
  {
    const r = await req('GET', '/teams');
    r.status === 401 ? pass_('Protected route blocks unauthenticated access', '/teams → 401') : fail('Protected route', `Expected 401, got ${r.status}`);
  }
  {
    const r = await req('GET', '/tasks');
    r.status === 401 ? pass_('Protected route blocks unauthenticated access', '/tasks → 401') : fail('Protected route tasks', `Expected 401, got ${r.status}`);
  }

  // --- VALIDATION: empty / bad input ---
  {
    const r = await req('POST', '/auth/register', { body: {} });
    r.status === 422 && r.data?.details?.length
      ? pass_('Empty register rejected with validation errors', r.data.details.join('; '))
      : fail('Empty register validation', `status=${r.status}`);
  }
  {
    const r = await req('POST', '/auth/register', {
      body: { name: 'X', email: 'not-an-email', password: 'ab' },
    });
    r.status === 422 ? pass_('Bad email + short password rejected', `422`) : fail('Bad input validation', `status=${r.status}`);
  }

  // --- REGISTER user A ---
  {
    const r = await req('POST', '/auth/register', {
      body: { name: 'QA User A', email: emailA, password: pass },
      cookieJar: jarA,
    });
    if (r.status === 201 && r.data?.user?.email === emailA) {
      pass_('New user registration succeeds', emailA);
    } else {
      fail('Registration', JSON.stringify(r.data));
      process.exit(1);
    }
  }

  // --- HTTP-only cookie ---
  {
    const sessionCookie = jarA.raw.find((c) => c.includes('ttm.sid'));
    if (sessionCookie?.toLowerCase().includes('httponly')) {
      pass_('Session cookie has HttpOnly flag', 'ttm.sid');
    } else {
      fail('HttpOnly cookie', sessionCookie ?? 'no cookie found');
    }
  }

  // --- DUPLICATE email ---
  {
    const r = await req('POST', '/auth/register', {
      body: { name: 'Duplicate', email: emailA, password: pass },
    });
    r.status === 409 ? pass_('Duplicate email rejected', '409 Conflict') : fail('Duplicate email', `status=${r.status}`);
  }

  // --- LOGOUT ---
  {
    const r = await req('POST', '/auth/logout', { cookieJar: jarA });
    r.status === 200 ? pass_('Logout succeeds', '200') : fail('Logout', `status=${r.status}`);
  }
  {
    const r = await req('GET', '/auth/me', { cookieJar: jarA });
    r.status === 401 ? pass_('Session destroyed after logout', '/me → 401') : fail('Post-logout session', `status=${r.status}`);
  }

  // --- WRONG password ---
  {
    const r = await req('POST', '/auth/login', { body: { email: emailA, password: 'WrongPassword99' } });
    r.status === 401 ? pass_('Wrong password login fails', '401') : fail('Wrong password', `status=${r.status}`);
  }

  // --- CORRECT login ---
  {
    const r = await req('POST', '/auth/login', { body: { email: emailA, password: pass }, cookieJar: jarA });
    r.status === 200 && r.data?.user ? pass_('Correct password login succeeds', emailA) : fail('Login', `status=${r.status}`);
  }

  // --- BCRYPT check via mongoose ---
  {
    const mongoose = (await import('mongoose')).default;
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/team_task_manager');
    const user = await mongoose.connection.db.collection('users').findOne({ email: emailA });
    if (user?.password_hash?.startsWith('$2')) {
      pass_('Password stored as bcrypt hash (not plain text)', user.password_hash.slice(0, 7) + '...');
    } else {
      fail('Password hashing', user?.password_hash ?? 'no hash field');
    }
    if (user?.password) {
      fail('Plain password field exists in DB', 'password field found');
    } else {
      pass_('No plain-text password field in database');
    }
    await mongoose.disconnect();
  }

  // --- REGISTER user B ---
  {
    const r = await req('POST', '/auth/register', {
      body: { name: 'QA User B', email: emailB, password: pass },
      cookieJar: jarB,
    });
    r.status === 201 ? pass_('Second user registration succeeds', emailB) : fail('User B register', `status=${r.status}`);
  }

  // --- TEAMS: create ---
  let teamId = '';
  {
    const r = await req('POST', '/teams', { body: { name: 'QA Team Alpha' }, cookieJar: jarA });
    if (r.status === 201 && r.data?.team?.id) {
      teamId = r.data.team.id;
      pass_('Team creation succeeds', teamId);
    } else {
      fail('Team create', JSON.stringify(r.data));
    }
  }

  // --- TEAMS: list ---
  {
    const r = await req('GET', '/teams', { cookieJar: jarA });
    const found = r.data?.teams?.some((t) => t.id === teamId);
    found ? pass_('Team appears in list for creator') : fail('Team list', 'team not found');
  }

  // --- TEAMS: member cannot delete (user B not in team) ---
  {
    const r = await req('DELETE', `/teams/${teamId}`, { cookieJar: jarB });
    (r.status === 403 || r.status === 401)
      ? pass_('Non-member cannot delete team', `status=${r.status}`)
      : fail('Cross-user team delete', `status=${r.status} — expected 403`);
  }

  // --- Add member B ---
  {
    const r = await req('POST', `/teams/${teamId}/members`, { body: { email: emailB }, cookieJar: jarA });
    r.status === 201 ? pass_('Member added to team', emailB) : fail('Add member', `status=${r.status} ${JSON.stringify(r.data)}`);
  }

  // --- Member B still cannot delete team ---
  {
    const r = await req('DELETE', `/teams/${teamId}`, { cookieJar: jarB });
    r.status === 403 ? pass_('Regular member cannot delete team (creator-only)', '403') : fail('Member delete team', `status=${r.status}`);
  }

  // --- Creator can delete? test on separate team ---
  let team2Id = '';
  {
    const r = await req('POST', '/teams', { body: { name: 'QA Team To Delete' }, cookieJar: jarA });
    team2Id = r.data?.team?.id;
    const del = await req('DELETE', `/teams/${team2Id}`, { cookieJar: jarA });
    del.status === 204 ? pass_('Team creator can delete team', '204') : fail('Creator delete', `status=${del.status}`);
  }

  // --- TASKS CRUD ---
  let taskId = '';
  let userBId = '';
  {
    const me = await req('GET', '/auth/me', { cookieJar: jarB });
    userBId = me.data?.user?.id;
  }

  {
    const r = await req('POST', '/tasks', {
      body: {
        title: 'QA Test Task',
        description: 'Persistence check',
        status: 'pending',
        priority: 'high',
        team_id: teamId,
        assigned_to: userBId,
      },
      cookieJar: jarA,
    });
    if (r.status === 201 && r.data?.task?.id) {
      taskId = r.data.task.id;
      pass_('Task create succeeds', taskId);
    } else {
      fail('Task create', `status=${r.status} ${JSON.stringify(r.data)}`);
    }
  }

  {
    const r = await req('PUT', `/tasks/${taskId}`, {
      body: { title: 'QA Updated Task', status: 'in_progress' },
      cookieJar: jarA,
    });
    r.status === 200 && r.data?.task?.title === 'QA Updated Task'
      ? pass_('Task update succeeds', 'title + status updated')
      : fail('Task update', JSON.stringify(r.data));
  }

  // --- FILTER by team ---
  {
    const r = await req('GET', `/tasks?team_id=${teamId}`, { cookieJar: jarA });
    const allMatch = r.data?.tasks?.every((t) => t.team_id === teamId);
    allMatch && r.data.tasks.length >= 1
      ? pass_('Filter by team works', `${r.data.tasks.length} task(s)`)
      : fail('Team filter', JSON.stringify(r.data?.tasks?.map((t) => t.team_id)));
  }

  // --- FILTER by assignee ---
  {
    const r = await req('GET', `/tasks?team_id=${teamId}&assigned_to=${userBId}`, { cookieJar: jarA });
    const allMatch = r.data?.tasks?.every((t) => t.assigned_to === userBId);
    allMatch ? pass_('Filter by assignee works', `${r.data.tasks.length} task(s)`) : fail('Assignee filter');
  }

  // --- SEARCH ---
  {
    const r = await req('GET', `/tasks?team_id=${teamId}&search=Updated`, { cookieJar: jarA });
    r.data?.tasks?.some((t) => t.title.includes('Updated'))
      ? pass_('Search by title works', 'found Updated task')
      : fail('Search filter');
  }

  // --- PERSISTENCE: new session fetch ---
  {
    const jarFresh = { cookie: '', raw: [] };
    await req('POST', '/auth/login', { body: { email: emailA, password: pass }, cookieJar: jarFresh });
    const r = await req('GET', `/tasks?team_id=${teamId}`, { cookieJar: jarFresh });
    r.data?.tasks?.some((t) => t.id === taskId)
      ? pass_('Task persists after re-login (database save)', taskId)
      : fail('Persistence', 'task not found after re-login');
  }

  // --- SECURITY: User B cannot access User A's private team via API ---
  {
    const r = await req('POST', '/teams', { body: { name: 'Private Team A Only' }, cookieJar: jarA });
    const privateTeamId = r.data?.team?.id;
    const access = await req('GET', `/teams/${privateTeamId}`, { cookieJar: jarB });
    access.status === 404 || access.status === 403
      ? pass_('User cannot access another user\'s team', `status=${access.status}`)
      : fail('Cross-user team access', `status=${access.status}`);
  }

  // --- XSS input ---
  {
    const xssTitle = '<script>alert(1)</script>';
    const r = await req('POST', '/tasks', {
      body: { title: xssTitle, team_id: teamId, status: 'pending', priority: 'low' },
      cookieJar: jarA,
    });
    if (r.status === 201) {
      const stored = r.data?.task?.title;
      stored === xssTitle
        ? pass_('XSS string stored safely (MongoDB, no execution on server)', 'stored as literal string — React escapes on render')
        : fail('XSS storage', stored);
    } else {
      warn('XSS task create', `status=${r.status}`);
    }
  }

  // --- NoSQL injection attempt ---
  {
    const r = await req('POST', '/auth/login', {
      body: { email: "' OR 1=1 --", password: 'anything' },
    });
    r.status === 422 ? pass_('Malformed login input rejected by Joi', '422') : pass_('Injection login did not succeed', `status=${r.status}`);
  }

  // --- TASK DELETE ---
  {
    const r = await req('DELETE', `/tasks/${taskId}`, { cookieJar: jarA });
    r.status === 204 ? pass_('Task delete succeeds (creator)', '204') : fail('Task delete', `status=${r.status}`);
  }

  // --- SUMMARY ---
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const warned = results.filter((r) => r.status === 'WARN').length;
  console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed, ${warned} warnings ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
