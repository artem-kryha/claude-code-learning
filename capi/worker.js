const PIXEL_ID = '1536549721238776';
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

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ error: 'Method Not Allowed' }), 405);
    }

    try {
      const { event_name, event_source_url, client_user_agent } = await request.json();

      const payload = {
        data: [{
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url,
          user_data: {
            client_ip_address: request.headers.get('CF-Connecting-IP'),
            client_user_agent,
          },
        }],
        access_token: env.META_ACCESS_TOKEN,
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
