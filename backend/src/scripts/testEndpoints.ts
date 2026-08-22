import app from '../app';
import http from 'http';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, () => resolve()));
  const BASE_URL = 'http://localhost:5099/api';

  console.log('🧪 Starting Automated API & Real-World Validation Tests on', BASE_URL);
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
    // 1. Health Check (with slight warm-up for remote Neon TLS handshake)
    let healthRes = await fetch(`${BASE_URL}/health`);
    if (healthRes.status !== 200) {
      await new Promise((r) => setTimeout(r, 500));
      healthRes = await fetch(`${BASE_URL}/health`);
    }
    const healthData = (await healthRes.json()) as ApiResponse;
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
    const loginData = (await loginRes.json()) as ApiResponse<{ token: string; user: any }>;
    assert(loginRes.status === 200 && loginData.success === true && !!loginData.data?.token, 'POST /api/auth/login valid credentials returns token');
    const authToken = loginData.data?.token;

    // 3. Login with Invalid Password
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@globetrotter.com',
        password: 'WrongPassword999!'
      })
    });
    const badLoginData = (await badLoginRes.json()) as ApiResponse;
    assert(badLoginRes.status === 401 && badLoginData.success === false, 'POST /api/auth/login invalid credentials returns 401');

    // 4. Signup Real-World Valid User (Phone >= 10 digits, Strong Password)
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
        phone: '+1 (555) 349-2041',
        city: 'Milan',
        country: 'Italy'
      })
    });
    const signupData = (await signupRes.json()) as ApiResponse<{ user: any; token: string }>;
    assert(signupRes.status === 201 && signupData.success === true && signupData.data?.user.email === signupEmail, 'POST /api/auth/signup creates user with 10-digit phone and returns JWT');

    // 5. Validation Check: Reject Weak Password (no special char / no number)
    const weakPassRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'David',
        email: `david${randomSuffix}@test.com`,
        password: 'weakpassword',
        phone: '9876543210'
      })
    });
    const weakPassData = (await weakPassRes.json()) as ApiResponse;
    assert(weakPassRes.status === 400 && weakPassData.success === false, 'POST /api/auth/signup rejects weak password (<8 chars / no symbols)');

    // 6. Validation Check: Reject Invalid Short Phone (<10 digits)
    const shortPhoneRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'David',
        email: `david_short_${randomSuffix}@test.com`,
        password: 'StrongPassword123!',
        phone: '12345'
      })
    });
    const shortPhoneData = (await shortPhoneRes.json()) as ApiResponse;
    assert(shortPhoneRes.status === 400 && shortPhoneData.success === false, 'POST /api/auth/signup rejects phone number under 10 digits');

    // 7. Google OAuth Login (New User Auto-Provisioning)
    const googleEmail = `googleuser${randomSuffix}@gmail.com`;
    const googleRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleEmail,
        first_name: 'Google',
        last_name: 'Explorer',
        photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      })
    });
    const googleData = (await googleRes.json()) as ApiResponse<{ user: any; token: string }>;
    assert(googleRes.status === 200 && googleData.success === true && googleData.data?.user.email === googleEmail, 'POST /api/auth/google provisions new user and returns JWT');

    // 8. Google OAuth Login (Existing User Handshake)
    const googleExistingRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleEmail,
        first_name: 'Google',
        last_name: 'Explorer'
      })
    });
    const googleExistingData = (await googleExistingRes.json()) as ApiResponse<{ user: any; token: string }>;
    assert(googleExistingRes.status === 200 && googleExistingData.success === true && !!googleExistingData.data?.token, 'POST /api/auth/google logs in existing user seamlessly');

    // 9. GET /api/users/me with Auth Token
    const meRes = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const meData = (await meRes.json()) as ApiResponse<any>;
    assert(meRes.status === 200 && meData.data?.email === 'demo@globetrotter.com', 'GET /api/users/me with valid Bearer token returns profile');

    // 10. GET /api/users/me without Auth Token (401)
    const unauthMeRes = await fetch(`${BASE_URL}/users/me`);
    assert(unauthMeRes.status === 401, 'GET /api/users/me without token returns 401 Unauthorized');

    // 11. PUT /api/users/me Update Profile
    const updateRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        bio: 'Updated travel bio with verified validation.'
      })
    });
    const updateData = (await updateRes.json()) as ApiResponse<any>;
    assert(updateRes.status === 200 && updateData.data?.bio === 'Updated travel bio with verified validation.', 'PUT /api/users/me updates profile successfully');

    // 12. GET /api/cities
    const citiesRes = await fetch(`${BASE_URL}/cities`);
    const citiesData = (await citiesRes.json()) as ApiResponse<any[]>;
    assert(citiesRes.status === 200 && Array.isArray(citiesData.data) && citiesData.data.length >= 10, 'GET /api/cities returns full city list');

    // 13. GET /api/cities with Search Filter
    const searchCityRes = await fetch(`${BASE_URL}/cities?search=Paris`);
    const searchCityData = (await searchCityRes.json()) as ApiResponse<any[]>;
    assert(searchCityRes.status === 200 && Boolean(searchCityData.data && searchCityData.data.length > 0 && searchCityData.data[0].name === 'Paris'), 'GET /api/cities?search=Paris filters correctly');

    // 14. GET /api/activities with Category Filter
    const catRes = await fetch(`${BASE_URL}/activities?category=food`);
    const catData = (await catRes.json()) as ApiResponse<any[]>;
    assert(catRes.status === 200 && Boolean(catData.data && catData.data.every((a: any) => a.category.toLowerCase() === 'food')), 'GET /api/activities?category=food filters activities correctly');

    // 15. POST /api/ai/plan (AI Trip Planning Assistant)
    const aiRes = await fetch(`${BASE_URL}/ai/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Plan a 3-day beach trip to Goa under 10000',
        city: 'Goa',
        budget: 10000
      })
    });
    const aiData = (await aiRes.json()) as ApiResponse<{ days: any[]; total_estimated_cost: number }>;
    assert(aiRes.status === 200 && Boolean(aiData.data && Array.isArray(aiData.data.days) && aiData.data.days.length > 0 && typeof aiData.data.total_estimated_cost === 'number'), 'POST /api/ai/plan returns structured day-by-day itinerary');

    console.log(`\n🏁 Complete Test Suite Run Summary: ${passed} passed, ${failed} failed.`);
  } catch (err) {
    console.error('💥 Test run encountered error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
