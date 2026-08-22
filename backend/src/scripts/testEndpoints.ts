import app from '../app';
import http from 'http';

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, () => resolve()));
  const BASE_URL = 'http://localhost:5099/api';

  console.log('🧪 Starting Automated API Endpoint Tests on', BASE_URL);
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.success === true, 'GET /api/health returns status 200 and healthy');

    // 2. Demo User Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@globetrotter.com',
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success === true && !!loginData.data.token, 'POST /api/auth/login valid credentials returns token');
    const authToken = loginData.data.token;

    // 3. Login with Invalid Password
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@globetrotter.com',
        password: 'WrongPassword999!'
      })
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginRes.status === 401 && badLoginData.success === false, 'POST /api/auth/login invalid credentials returns 401');

    // 4. Signup New Unique User
    const randomSuffix = Math.floor(Math.random() * 100000);
    const signupEmail = `traveler${randomSuffix}@test.com`;
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Elena',
        last_name: 'Rostova',
        email: signupEmail,
        password: 'SecurePassword123!',
        city: 'Milan',
        country: 'Italy'
      })
    });
    const signupData = await signupRes.json();
    assert(signupRes.status === 201 && signupData.success === true && signupData.data.user.email === signupEmail, 'POST /api/auth/signup creates user and returns JWT');

    // 5. Signup Duplicate Email
    const dupSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Elena',
        email: signupEmail,
        password: 'SecurePassword123!'
      })
    });
    const dupSignupData = await dupSignupRes.json();
    assert(dupSignupRes.status === 400 && dupSignupData.success === false, 'POST /api/auth/signup duplicate email returns 400');

    // 6. GET /api/users/me with Auth Token
    const meRes = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.data.email === 'demo@globetrotter.com', 'GET /api/users/me with valid Bearer token returns profile');

    // 7. GET /api/users/me without Auth Token (401)
    const unauthMeRes = await fetch(`${BASE_URL}/users/me`);
    assert(unauthMeRes.status === 401, 'GET /api/users/me without token returns 401 Unauthorized');

    // 8. PUT /api/users/me Update Profile
    const updateRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        bio: 'Updated bio for testing purposes.'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.data.bio === 'Updated bio for testing purposes.', 'PUT /api/users/me updates profile successfully');

    // 9. GET /api/cities
    const citiesRes = await fetch(`${BASE_URL}/cities`);
    const citiesData = await citiesRes.json();
    assert(citiesRes.status === 200 && Array.isArray(citiesData.data) && citiesData.data.length >= 10, 'GET /api/cities returns full city list');

    // 10. GET /api/cities with Search Filter
    const searchCityRes = await fetch(`${BASE_URL}/cities?search=Paris`);
    const searchCityData = await searchCityRes.json();
    assert(searchCityRes.status === 200 && searchCityData.data.length > 0 && searchCityData.data[0].name === 'Paris', 'GET /api/cities?search=Paris filters correctly');

    // 11. GET /api/activities
    const activitiesRes = await fetch(`${BASE_URL}/activities`);
    const activitiesData = await activitiesRes.json();
    assert(activitiesRes.status === 200 && Array.isArray(activitiesData.data) && activitiesData.data.length >= 30, 'GET /api/activities returns full activities list');

    // 12. GET /api/activities with Category Filter
    const catRes = await fetch(`${BASE_URL}/activities?category=food`);
    const catData = await catRes.json();
    assert(catRes.status === 200 && catData.data.every((a: any) => a.category.toLowerCase() === 'food'), 'GET /api/activities?category=food filters activities correctly');

    console.log(`\n🏁 Test Run Summary: ${passed} passed, ${failed} failed.`);
  } catch (err) {
    console.error('💥 Test run encountered error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
