const PIXEL_ID = '1663148121576361';
const FB_CAPI_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function corsResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

async function sha256(value) {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ error: 'Method Not Allowed' }), 405);
    }

    try {
      const { event_name, event_source_url, event_id, client_user_agent, fbc, email, city } = await request.json();

      const user_data = {
        client_ip_address: request.headers.get('CF-Connecting-IP'),
        client_user_agent,
        ...(fbc && { fbc }),
        ...(email && { em: [await sha256(email)] }),
        ...(city  && { ct: [await sha256(city)]  }),
      };

      const event = {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url,
        user_data,
        ...(event_id && { event_id }),
      };

      const payload = {
        data: [event],
        access_token: env.META_ACCESS_TOKEN,
        ...(env.META_TEST_EVENT_CODE && { test_event_code: env.META_TEST_EVENT_CODE }),
      };

      const fbResponse = await fetch(FB_CAPI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await fbResponse.text();
      return corsResponse(text, fbResponse.status);
    } catch (err) {
      return corsResponse(JSON.stringify({ error: err.message }), 500);
    }
  },
};
