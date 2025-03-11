import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up do 100 użytkowników
    { duration: '5m', target: 100 }, // Utrzymanie 100 użytkowników
    { duration: '5m', target: 500 }, // Ramp-up do 500 użytkowników
    { duration: '5m', target: 500 }, // Utrzymanie 500 użytkowników
    { duration: '5m', target: 1000 }, // Ramp-up do 1000 użytkowników
    { duration: '10m', target: 1000 }, // Test z 1000 użytkownikami
    { duration: '5m', target: 0 }, // Stopniowe zmniejszanie
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% requestów powinno być poniżej 2s
    http_req_failed: ['rate<0.01'], // Mniej niż 1% błędów
    'checks': ['rate>0.95'], // 95% sprawdzeń powinno być udanych
  },
};

export default function () {
  const BASE_URL = 'http://o0k0o0sgk0wcosow8w48kgog.188.245.221.231.sslip.io';
  const SUPABASE_URL = 'https://api.facesfactory.com';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdmxzaXVxamZvdGlmb3lxaXZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzI1Mzc0MCwiZXhwIjoyMDQyODI5NzQwfQ.cfxhRv8o7U5CyHvzp4EKuLb9VrZ4zwd-Zhm1mi4UMLw';
  
  // 1. Logowanie przez Supabase
  const loginData = {
    email: 'kontakt@corkamor.com',
    password: 'Lasto420!'
  };

  const loginHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  };

  const loginResponse = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify(loginData),
    { headers: loginHeaders }
  );

  check(loginResponse, {
    'login successful': (r) => r.status === 200,
  });

  // Wyciągnij access token z odpowiedzi Supabase
  const accessToken = loginResponse.json('access_token');
  const authHeaders = {
    'Authorization': `Bearer ${accessToken}`,
    'apikey': SUPABASE_ANON_KEY
  };

  sleep(1); // Krótka przerwa po zalogowaniu

  // 2. Przeglądanie galerii (strony 1-3)
  for (let page = 1; page <= 3; page++) {
    const galleryResponse = http.get(
      `${BASE_URL}/gallery/images?page=${page}`,
      { headers: authHeaders }
    );

    check(galleryResponse, {
      [`gallery page ${page} loaded`]: (r) => r.status === 200,
      'has images': (r) => r.body.includes('img') // Podstawowe sprawdzenie czy strona zawiera obrazy
    });

    sleep(Math.random() * 3 + 2); // Losowa przerwa 2-5 sekund między przeglądaniem stron
  }

  sleep(1); // Końcowa przerwa przed następną iteracją
} 